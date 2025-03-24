import Fastify, { FastifyInstance } from "fastify";
import {
  WorkerService,
  WORKFLOW_STATE_WAIT_UNTIL_API_PATH,
} from "../iwf/worker_service.ts";
import {
  WorkflowStateWaitUntilRequest,
  WorkflowStateWaitUntilResponse,
} from "iwfidl";
import { Registry } from "../dist/iwf/registry.js";
import { WorkerOptions } from "../iwf/worker_options.ts";
import { DEFAULT_ENCODER } from "../iwf/default_encoder.ts";

const options: WorkerOptions = {
  objectEncoder: DEFAULT_ENCODER,
};
const registry: Registry = new Registry();
const worker_service: WorkerService = new WorkerService(registry, options);

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.get("/", function home(_req, _res) {
  return { hello: "world" };
});

fastify.post(
  WORKFLOW_STATE_WAIT_UNTIL_API_PATH,
  async function waitUntil(req) {
    const waitUntilApiRequest = req
      .body as WorkflowStateWaitUntilRequest;
    return worker_service.handleWorkflowStateWaitUntil({
      workflowId: "",
      workflowRunId: "",
      workflowStartedTimestamp: 0,
    }, waitUntilApiRequest);
  },
);
