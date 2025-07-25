import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Client } from "../iwf/client.ts";
import Fastify, { FastifyInstance } from "fastify";
import { LOCAL_DEFAULT_CLIENT_OPTIONS } from "../iwf/client_options.ts";
import { Context } from "iwfidl";
import { BASIC_WORKFLOW } from "./workflows/basic_workflow.ts";
import routes from "./routes.ts";
import { REGISTRY } from "./registry.ts";
import {
  BASIC_PERSISTENCE_WORKFLOW,
  TEST_INIT_DATA_ATTRIBUTE_KEY,
} from "./workflows/basic_persistence_workflow.ts";

describe("Basic workflow tests", () => {
  let client: Client;
  let fastify: FastifyInstance;

  before(async () => {
    client = new Client(
      REGISTRY,
      LOCAL_DEFAULT_CLIENT_OPTIONS,
    );
    fastify = Fastify({
      // logger: true,
    });
    fastify.register(routes);
    await fastify.listen({
      port: 8803,
    });
  });

  after(async () => {
    fastify.close();
  });

  it("starts basic test workflow", async () => {
    console.log("starting test...");
    const ctx: Context = {
      workflowId: `basic-workflow-${new Date().getTime()}`,
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
        initialDataAttributes: new Map(),
        waitForCompletionStateExecutionIds: [],
        waitForCompletionStateIds: [],
      },
    );

    assert.ok(wfRunId, "Workflow Run Id should not be null");
    await (new Promise((resolve) => setTimeout(resolve, 5000)));
  });
});

describe("Basic persistence workflow tests", () => {
  let client: Client;
  let fastify: FastifyInstance;

  before(async () => {
    client = new Client(
      REGISTRY,
      LOCAL_DEFAULT_CLIENT_OPTIONS,
    );
    fastify = Fastify({
      // logger: true,
    });
    fastify.register(routes);
    await fastify.listen({
      port: 8803,
    });
  });

  after(async () => {
    fastify.close();
  });

  it("starts basic persistence test workflow", async () => {
    console.log("starting test...");
    const workflowId = `basic-persistence-workflow-${new Date().getTime()}`;
    const ctx: Context = {
      workflowId,
      workflowRunId: "run1",
      workflowStartedTimestamp: 0,
    };
    const wfRunId = await client.startWorkflow(
      ctx,
      BASIC_PERSISTENCE_WORKFLOW,
      ctx.workflowId,
      120,
      {},
      {
        workflowIdReusePolicy: "ALLOW_IF_NO_RUNNING",
        workflowCronSchedule: "",
        workflowStartDelaySeconds: 0,
        workflowRetryPolicy: {},
        initialSearchAttributes: new Map(),
        initialDataAttributes: new Map([
          [TEST_INIT_DATA_ATTRIBUTE_KEY, "init-test-value"],
        ]),
        waitForCompletionStateExecutionIds: [],
        waitForCompletionStateIds: [],
      },
    );

    assert.ok(wfRunId, "Workflow Run Id should not be null");
    await client.waitForWorkflowCompletion(workflowId);
    // await (new Promise((resolve) => setTimeout(resolve, 5000)));
  });
});
