import assert from "node:assert/strict";
import { /*  after ,*/ before, describe, it } from "node:test";
import { Client } from "../iwf/client.ts";
// import Fastify, { FastifyInstance } from "fastify";
import { LOCAL_DEFAULT_CLIENT_OPTIONS } from "../iwf/client_options.ts";
import { Context } from "iwfidl";
import {
  BASIC_STATE_1,
  BASIC_STATE_2,
  BASIC_WORKFLOW,
} from "./workflows/basic_workflow.ts";
// import routes from "./routes.ts";
import { REGISTRY } from "./registry.ts";

describe("Basic Workflow", () => {
  let client: Client;

  before(async () => {
    client = new Client(
      REGISTRY,
      LOCAL_DEFAULT_CLIENT_OPTIONS,
    );
  });

  it("start_basic_workflow", async () => {
    console.log("starting test...");
    const workflowId = `basic-workflow-${new Date().getTime()}`;
    const ctx: Context = {
      workflowId,
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
        waitForCompletionStateIds: [BASIC_STATE_2.getStateId()],
      },
    );

    assert.ok(wfRunId, "Workflow Run Id should not be null");
    await client.waitForWorkflowCompletion(
      <V>(v: unknown): V => {
        return v as V;
      },
      workflowId,
      wfRunId,
    );
  });
});
