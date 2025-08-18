import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Client } from "../iwf/client.ts";
import Fastify, { FastifyInstance } from "fastify";
import { LOCAL_DEFAULT_CLIENT_OPTIONS } from "../iwf/client_options.ts";
import { Context } from "iwfidl";
import { REGISTRY } from "./registry.ts";
import routes from "./routes.ts";
import {
  BASIC_SIGNAL_WORKFLOW,
  BASIC_SIGNAL_WORKFLOW_STATE_2,
  SIGNAL_CHANNEL_NAME_1,
  SIGNAL_CHANNEL_NAME_3,
  SIGNAL_CHANNEL_PREFIX,
  TIMER_COMMAND_ID,
} from "./workflows/basic_signal_workflow.ts";
import z from "zod/v3";
import { BASIC_INTERNAL_CHANNEL_WORKFLOW } from "./workflows/basic_internal_channel_workflow.ts";

describe("Basic inter channel workflow tests", () => {
  let client: Client;
  let fastify: FastifyInstance;
  let workerUrl: string;

  before(async () => {
    fastify = Fastify({
      // logger: true,
    });
    fastify.register(routes);
    await fastify.listen({
      port: 0,
      listenTextResolver: (adr) => workerUrl = adr,
    });
    client = new Client(
      REGISTRY,
      { ...LOCAL_DEFAULT_CLIENT_OPTIONS, workerUrl },
    );
  });

  after(async () => {
    await fastify.close();
  });

  it("start_basic_inter_channel_workflow", async () => {
    console.log("starting basic-inter-channel-workflow test...");
    const workflowId = `basic-inter-channel-workflow-${new Date().getTime()}`;
    const ctx: Context = {
      workflowId,
      workflowRunId: "",
      workflowStartedTimestamp: 0,
    };
    const wfRunId = await client.startWorkflow(
      ctx,
      BASIC_INTERNAL_CHANNEL_WORKFLOW,
      workflowId,
      120,
      1,
      {
        workflowIdReusePolicy: "ALLOW_IF_NO_RUNNING",
        workflowCronSchedule: "",
        workflowStartDelaySeconds: 0,
        workflowRetryPolicy: {},
        initialSearchAttributes: new Map(),
        initialDataAttributes: new Map(),
        waitForCompletionStateIds: [],
        waitForCompletionStateExecutionIds: [],
      },
    );
    assert.ok(wfRunId, "Workflow Run Id should not be null");
    const result: number = await client.waitForWorkflowCompletion(
      <T>(v: unknown) => {
        return z.number().parse(v) as T;
      },
      workflowId,
      wfRunId,
    ) as number;
    assert.equal(result, 3);
  });
});
