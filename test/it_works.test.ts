import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { Client } from "../iwf/client.ts";
import { Fastify, FastifyInstance } from "fastify";
import { LOCAL_DEFAULT_CLIENT_OPTIONS } from "../iwf/client_options.ts";
import { Context } from "iwfidl";
import { Registry } from "../iwf/registry.ts";
import { BASIC_WORKFLOW } from "./workflows/basic_workflow.ts";
import routes from "./routes.ts";

const registry: Registry = new Registry();
registry.addWorkflow(BASIC_WORKFLOW);
const client: Client = new Client(
  registry,
  LOCAL_DEFAULT_CLIENT_OPTIONS,
);

describe("Basic workflow tests", () => {
  let fastify: FastifyInstance;

  before(async () => {
    fastify = Fastify({
      logger: true,
    });
    fastify.registry(routes);
    await fastify.listen({
      port: 8803,
    });
  });

  it("starts the test workflow", async () => {
    console.log("starting test...");
    const ctx: Context = {
      workflowId: "test-workflow-1",
      workflowRunId: "run1",
      workflowStartedTimestamp: 0,
    };
    const wfRunId = await client.startWorkflow(
      ctx,
      BASIC_WORKFLOW,
      ctx.workflowId,
      120,
      {},
      {
        workflowIdReusePolicy: "ALLOW_IF_NO_RUNNING",
        workflowCronSchedule: "",
        workflowStartDelaySeconds: 0,
        workflowRetryPolicy: {},
        initialSearchAttributes: new Map(),
      },
    );

    assert.ok(wfRunId, "Workflow Run Id should not be null");
  });
});
