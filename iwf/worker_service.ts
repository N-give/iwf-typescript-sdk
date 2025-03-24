import {
  Context,
  EncodedObject,
  InterStateChannelPublishing,
  WorkflowStateWaitUntilRequest,
  WorkflowStateWaitUntilResponse,
} from "iwfidl";
import { Registry } from "./registry.ts";
import { IObjectEncoder } from "./object_encoder.ts";
import { WorkerOptions } from "./worker_options.ts";
import { WorkflowContext } from "./workflow_context.ts";
import { Persistence } from "./persistence.ts";
import { Communication } from "./communication.ts";
import { toIdlCommandRequest } from "./command_request.ts";

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
    const ctx = new WorkflowContext(
      request.context,
      request.context.workflowId,
      request.context.workflowRunId,
      request.context.stateExecutionId || "",
      request.context.workflowStartedTimestamp,
      request.context.attempt || 1,
      request.context.firstAttemptTimestamp || Date.now(),
    );
    const persistence = new Persistence(
      this.options.objectEncoder,
      this.registry.getWorkflowDataAttributesKeyStore(wfType) || new Map(),
      this.registry.getSearchAttributeTypeStore(wfType) || new Map(),
      request.dataObjects || [],
      request.searchAttributes || [],
      [],
    );
    const communication = new Communication(
      this.options.objectEncoder,
      this.registry.getWorkflowInternalChannelNameStore(wfType) || new Map(),
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
