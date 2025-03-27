import {
  Context,
  EncodedObject,
  InterStateChannelPublishing,
  WorkflowStateExecuteRequest,
  WorkflowStateExecuteResponse,
  WorkflowStateWaitUntilRequest,
  WorkflowStateWaitUntilResponse,
  WorkflowWorkerRpcRequest,
  WorkflowWorkerRpcResponse,
} from "iwfidl";
import { Registry } from "./registry.ts";
import { IObjectEncoder } from "./object_encoder.ts";
import { WorkerOptions } from "./worker_options.ts";
import { WorkflowContext } from "./workflow_context.ts";
import { Persistence } from "./persistence.ts";
import { Communication } from "./communication.ts";
import { toIdlCommandRequest } from "./command_request.ts";
import { CommunicationMethodType } from "./communication_method_def.ts";
import { toIdlDecision } from "./state_movement.ts";
import { fromIdlCommandResults } from "./utils/command_results.ts";

type Obj = {
  encodedObject: EncodedObject;
  objectEncoder: IObjectEncoder;
};

export const WORKFLOW_STATE_WAIT_UNTIL_API_PATH = "/api/v1/workflowState/start";
export const WORKFLOW_STATE_EXECUTE_API_PATH = "/api/v1/workflowState/decide";
export const WORKFLOW_STATE_RPC_API_PATH = "/api/v1/workflowState/rpc";

export class WorkerService {
  registry: Registry;
  options: WorkerOptions;

  constructor(registry: Registry, workerOptions: WorkerOptions) {
    this.registry = registry;
    this.options = workerOptions;
  }

  //handleWorkflowWorkerRpc(
  //  req: WorkflowWorkerRpcRequest,
  //): WorkflowWorkerRpcResponse {
  //  const method = this.registry.getWorkflowRPC(
  //    req.workflowType,
  //    req.rpcName,
  //  );
  //  if (method?.communicationMethod !== CommunicationMethodType.RPC_METHOD) {
  //    throw new Error(`Method ${req.rpcName} not registered as RPC_METHOD`);
  //  }
  //  const input = this.options.objectEncoder.decode(req.input);
  //  const ctx: WorkflowContext = {
  //    ctx: req.context,
  //    workflowId: req.ctx.workflowId,
  //    workflowRunId: req.workflowRunId,
  //    stateExecutionId: req.stateExecutionId,
  //    attempt: req.attempt,
  //    workflowStartTimestampSeconds: req.workflowStartTimestampSeconds,
  //    firstAttemptTimestampSeconds: req.firstAttemptTimestampSeconds,
  //  };
  //  const pers = new Persistence(
  //    this.options.objectEncoder,
  //    this.registry.getWorkflowDataAttributesKeyStore(req.workflowType),
  //    this.registry.getSearchAttributeTypeStore(req.workflowType),
  //    req.dataObjects,
  //    req.searchAttributes,
  //    [],
  //  );
  //  const comm = new Communication(
  //    this.options.objectEncoder,
  //    this.registry.getWorkflowInternalChannelNameStore(req.workflowType),
  //  );
  //  const output = method.rpc(ctx, input, pers, comm);
  //  const encodedOutput = this.options.objectEncoder.encode(output);
  //  const res: WorkflowWorkerRpcResponse = {
  //    output: encodedOutput,
  //  };
  //  const publishings = getToPublish(comm.toPublishInternalChannel);
  //  if (publishings.length > 0) {
  //    res.publishToInterStateChannel = publishings;
  //  }
  //  if (comm.getToTriggerStateMovements().length > 0) {
  //    res.stateDecision = {
  //      nextStates: toIdlDecision(
  //        {
  //          nextStates: comm.getToTriggerStateMovements(),
  //        },
  //        req.workflowType,
  //        this.registry,
  //        this.options.objectEncoder,
  //      ),
  //    };
  //  }
  //  const {
  //    dataObjectsToReturn,
  //    stateLocalToReturn,
  //    recordEvents,
  //    upsertSearchAttributes,
  //  } = pers.getToReturn();
  //  if (dataObjectsToReturn.length > 0) {
  //    res.upsertDataObjects = dataObjectsToReturn;
  //  }
  //  if (stateLocalToReturn.length > 0) {
  //    res.upsertStateLocals = stateLocalToReturn;
  //  }
  //  if (recordEvents.length > 0) {
  //    res.recordEvents = stateLocalToReturn;
  //  }
  //  if (upsertSearchAttributes.length > 0) {
  //    res.upsertSearchAttributes = upsertSearchAttributes;
  //  }
  //  return res;
  //}

  handleWorkflowStateWaitUntil(
    request: WorkflowStateWaitUntilRequest,
  ): WorkflowStateWaitUntilResponse {
    const wfType = request.workflowType;
    const stateDef = this.registry.getWorkflowStateDef(
      wfType,
      request.workflowStateId,
    );
    if (!stateDef) {
      throw new Error(
        `state ${request.workflowStateId} not found in workflow ${wfType}`,
      );
    }
    const input: Obj = {
      encodedObject: request.stateInput || {},
      objectEncoder: this.options.objectEncoder,
    };
    const ctx: WorkflowContext = {
      ctx: request.context,
      workflowId: request.context.workflowId,
      workflowRunId: request.context.workflowRunId,
      stateExecutionId: request.context.stateExecutionId || "",
      workflowStartTimestampSeconds: request.context.workflowStartedTimestamp,
      attempt: request.context.attempt || 1,
      firstAttemptTimestampSeconds: request.context.firstAttemptTimestamp ||
        Date.now(),
    };
    const persistence = new Persistence(
      this.options.objectEncoder,
      this.registry.getWorkflowDataAttributesKeyStore(wfType),
      this.registry.getSearchAttributeTypeStore(wfType),
      request.dataObjects,
      request.searchAttributes,
      [],
    );
    const communication = new Communication(
      this.options.objectEncoder,
      this.registry.getWorkflowInternalChannelNameStore(wfType),
    );
    if (!stateDef.state.waitUntil) {
      throw new Error(
        `state ${request.workflowStateId} does not have \`waitUntil\` definition`,
      );
    }
    const commandRequest = stateDef.state.waitUntil(
      ctx,
      input,
      persistence,
      communication,
    );

    const idlCommandRequest = toIdlCommandRequest(commandRequest);
    const toPublish = getToPublish(communication.toPublishInternalChannel);
    const res: WorkflowStateWaitUntilResponse = {
      commandRequest: idlCommandRequest,
    };
    if (toPublish.length > 0) {
      res.publishToInterStateChannel = toPublish;
    }

    const {
      dataObjectsToReturn,
      stateLocalToReturn,
      recordEvents,
      upsertSearchAttributes,
    } = persistence.getToReturn();

    if (dataObjectsToReturn.length > 0) {
      res.upsertDataObjects = dataObjectsToReturn;
    }
    if (stateLocalToReturn.length > 0) {
      res.upsertStateLocals = stateLocalToReturn;
    }
    if (recordEvents.length > 0) {
      res.recordEvents = recordEvents;
    }
    if (upsertSearchAttributes.length > 0) {
      res.upsertSearchAttributes = upsertSearchAttributes;
    }

    return res;
  }

  handleWorkflowStateExecute(
    request: WorkflowStateExecuteRequest,
  ): WorkflowStateExecuteResponse {
    const state = this.registry.getWorkflowStateDef(
      request.workflowType,
      request.workflowStateId,
    );
    const input = this.options.objectEncoder.decode(
      request.stateInput || {
        encoding: "json",
        data: "",
      },
    );
    const ctx = fromIdlContext(
      request.context,
      request.workflowType,
    );
    const commandResults = fromIdlCommandResults(
      request.commandResults,
      this.options.objectEncoder,
    );
    const pers = new Persistence(
      this.options.objectEncoder,
      this.registry.getWorkflowDataAttributesKeyStore(
        request.workflowType,
      ),
      this.registry.getSearchAttributeTypeStore(
        request.workflowType,
      ),
      request.dataObjects,
      request.searchAttributes,
    );
    const comm = new Communication(
      this.options.objectEncoder,
      this.registry.getWorkflowInternalChannelNameStore(
        request.workflowType,
      ),
    );
    const decision = state?.state.execute(
      ctx,
      input,
      commandResults,
      pers,
      comm,
    );
    const idlDecision = toIdlDecision(
      decision || { nextStates: [] },
      request.workflowType,
      this.registry,
      this.options.objectEncoder,
    );
    const res: WorkflowStateExecuteResponse = {
      stateDecision: idlDecision,
    };
    const publishings = getToPublish(comm.toPublishInternalChannel);
    if (publishings.length > 0) {
      res.publishToInterStateChannel = publishings;
    }
    const {
      dataObjectsToReturn,
      stateLocalToReturn,
      recordEvents,
      upsertSearchAttributes,
    } = pers.getToReturn();
    if (dataObjectsToReturn.length > 0) {
      res.upsertDataObjects = dataObjectsToReturn;
    }
    if (stateLocalToReturn.length > 0) {
      res.upsertStateLocals = stateLocalToReturn;
    }
    if (recordEvents.length > 0) {
      res.recordEvents = recordEvents;
    }
    if (upsertSearchAttributes.length > 0) {
      res.upsertSearchAttributes = upsertSearchAttributes;
    }
    return res;
  }
}

function getToPublish(
  channels: Map<string, EncodedObject[]>,
): InterStateChannelPublishing[] {
  return Array.from(
    channels.entries().flatMap(([name, l]) => {
      return l.map((value) => {
        return { channelName: name, value };
      });
    }),
  );
}

function fromIdlContext(ctx: Context, wfType: string): WorkflowContext {
  return {
    ctx,
    workflowId: ctx.workflowId,
    workflowRunId: ctx.workflowRunId,
    stateExecutionId: ctx.stateExecutionId || "",
    workflowStartTimestampSeconds: ctx.workflowStartedTimestamp,
    attempt: ctx.attempt || -1,
    firstAttemptTimestampSeconds: ctx.firstAttemptTimestamp || -1,
  };
}
