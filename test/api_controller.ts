import Fastify, { FastifyInstance } from "fastify";
import {
  WorkerService,
  WORKFLOW_STATE_EXECUTE_API_PATH,
  WORKFLOW_STATE_WAIT_UNTIL_API_PATH,
} from "../iwf/worker_service.ts";
import {
  WorkflowStateExecuteRequest,
  WorkflowStateWaitUntilRequest,
} from "iwfidl";
import { Registry } from "../iwf/registry.ts";
import { WorkerOptions } from "../iwf/worker_options.ts";
import { DEFAULT_ENCODER } from "../iwf/default_encoder.ts";
import { ALL_WORKFLOWS } from "./workflows/index.ts";

const options: WorkerOptions = {
  objectEncoder: DEFAULT_ENCODER,
};
const registry: Registry = new Registry();
registry.addWorkflows(...ALL_WORKFLOWS);
const worker_service: WorkerService = new WorkerService(registry, options);

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.get("/", function home(_req, _res) {
  return { hello: "world" };
});

export default async function routes(
  fastify: FastifyInstance,
  options: unknown,
) {
  fastify.post(
    WORKFLOW_STATE_WAIT_UNTIL_API_PATH,
    async function waitUntil(req: unknown, _res: unknown) {
      const waitUntilApiRequest = req
        .body as WorkflowStateWaitUntilRequest;
      return worker_service.handleWorkflowStateWaitUntil(waitUntilApiRequest);
    },
  );

  fastify.post(
    WORKFLOW_STATE_EXECUTE_API_PATH,
    async function execute(req: unknown, _res: unknown) {
      const stateExecuteRequest: WorkflowStateExecuteRequest = req
        .body as WorkflowStateExecuteRequest;
      return worker_service.handleWorkflowStateExecute(
        stateExecuteRequest,
      );
    },
  );
}
