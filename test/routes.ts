import Fastify, { FastifyInstance } from "fastify";
import {
  WorkflowStateExecuteRequest as ZWorkflowStateExecuteRequest,
  WorkflowStateExecuteResponse as ZWorkflowStateExecuteResponse,
  WorkflowStateWaitUntilRequest as ZWorkflowStateWaitUntilRequest,
  WorkflowStateWaitUntilResponse as ZWorkflowStateWaitUntilResponse,
} from "../gen/api-schema.ts";
import {
  WorkerService,
  WORKFLOW_STATE_EXECUTE_API_PATH,
  WORKFLOW_STATE_RPC_API_PATH,
  WORKFLOW_STATE_WAIT_UNTIL_API_PATH,
} from "../iwf/worker_service.ts";
import {
  WorkflowStateExecuteRequest,
  WorkflowStateExecuteResponse,
  WorkflowStateWaitUntilRequest,
  WorkflowStateWaitUntilResponse,
  WorkflowWorkerRpcRequest,
} from "iwfidl";
import { Registry } from "../iwf/registry.ts";
import { WorkerOptions } from "../iwf/worker_options.ts";
import { DEFAULT_ENCODER } from "../iwf/default_encoder.ts";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { ALL_WORKFLOWS } from "./workflows/index.ts";
import { z } from "zod";

const options: WorkerOptions = {
  objectEncoder: DEFAULT_ENCODER,
};
const registry: Registry = new Registry();
registry.addWorkflows(...ALL_WORKFLOWS);
const worker_service: WorkerService = new WorkerService(registry, options);

const fastify: FastifyInstance = Fastify({
  logger: true,
});

// const encodedObjectSchema = z.object({
//   encoding: z.string(),
// });
//
// const waitUntilSchema = z.object({});

const schema = {
  "$defs": {
    encodedObject: {
      type: "object",
      properties: {
        encoding: "string",
        data: "string",
      },
    },
    components: {
      type: "object",
      properties: {},
    },
    context: {
      type: "object",
      properties: {
        workflowId: "string",
        workflowRunId: "string",
        workflowStartedTimestamp: "number",
        stateExecutionId: "string",
        firstAttemptTimestamp: "number",
        attempt: "number",
      },
      required: [
        "workflowId",
        "workflowRunId",
        "workflowStartedTimestamp",
      ],
    },
    keyValue: {
      type: "object",
      properties: {
        key: "string",
        value: { "$ref": "#/#defs/encodedObject" },
      },
    },
    searchAttributeValueType: {
      oneOf: [
        "KEYWORD",
        "TEXT",
        "DATETIME",
        "INT",
        "DOUBLE",
        "BOOL",
        "KEYWORD_ARRAY",
      ],
    },
    searchAttribute: {
      type: "object",
      properties: {
        key: "string",
        stringValue: "string",
        integerValue: "number",
        doubleValue: "number",
        boolValue: "boolean",
        stringArrayValue: {
          type: "array",
          items: { type: "string" },
        },
        valueType: { "$ref": "#/defs/searchAttributeValueType" },
      },
    },
  },
  waitUntil: {
    body: {
      type: "object",
      properties: {
        context: { "$ref": "#/$defs/context" },
        workflowType: { type: "string" },
        workflowStateId: { type: "string" },
        stateInput: { "$ref": "#/$defs/encodedObject" }, // optional components["schemas"]["EncodedObject"],
        searchAttributes: { // optional
          type: "array",
          items: { "$ref": "#/$defs/searchAttribute" },
        },
        dataObjects: { // optional
          type: "array",
          items: { "$ref": "#/$defs/keyValue" },
        },
      },
    },
  },
};

// type IWorkflowStateWaitUntilRequest = Static<
//   typeof schemas.WorkflowStateWaitUntilRequest
// >;

export default function routes(
  fastify: FastifyInstance,
  options: unknown,
) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().post<{
    Body: WorkflowStateWaitUntilRequest;
    Reply: WorkflowStateWaitUntilResponse;
  }>(
    WORKFLOW_STATE_WAIT_UNTIL_API_PATH,
    {
      schema: {
        body: ZWorkflowStateWaitUntilRequest,
        response: {
          200: ZWorkflowStateWaitUntilResponse,
        },
      },
    },
    function waitUntil(
      req,
      res,
    ) {
      res.send(worker_service.handleWorkflowStateWaitUntil(req.body));
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().post<{
    Body: WorkflowStateExecuteRequest;
    Reply: WorkflowStateExecuteResponse;
  }>(
    WORKFLOW_STATE_EXECUTE_API_PATH,
    {
      schema: {
        body: ZWorkflowStateExecuteRequest,
        response: {
          200: ZWorkflowStateExecuteResponse,
        },
      },
    },
    async function execute(
      req,
      res,
    ) {
      res.send(worker_service.handleWorkflowStateExecute(req.body));
    },
  );

  //fastify.post(
  //  WORKFLOW_STATE_RPC_API_PATH,
  //  async function rpc(req: unknown, _res: unknown) {
  //    const rpcRequest = req.body as WorkflowWorkerRpcRequest;
  //    return worker_service.handleWorkflowWorkerRpc(rpcRequest);
  //  },
  //);
}
