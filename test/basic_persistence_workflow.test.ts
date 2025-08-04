import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { Client } from "../iwf/client.ts";
// import Fastify, { FastifyInstance } from "fastify";
import { LOCAL_DEFAULT_CLIENT_OPTIONS } from "../iwf/client_options.ts";
import { Context, EncodedObject } from "iwfidl";
import { REGISTRY } from "./registry.ts";
import {
  BASIC_PERSISTENCE_STATE,
  BASIC_PERSISTENCE_WORKFLOW,
  TEST_DATA_ATTRIBUTE_MODEL_1,
  TEST_INIT_DATA_ATTRIBUTE_KEY,
} from "./workflows/basic_persistence_workflow.ts";
import { Context as ZodContext } from "../gen/api-schema.ts";

describe("Basic persistence workflow tests", () => {
  let client: Client;

  before(() => {
    client = new Client(
      REGISTRY,
      LOCAL_DEFAULT_CLIENT_OPTIONS,
    );
  });

  it("start_basic_persistence_workflow", async () => {
    console.log("starting test...");
    const workflowId = `basic-persistence-workflow-${new Date().getTime()}`;
    const ctx: Context = {
      workflowId,
      workflowRunId: "",
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
        waitForCompletionStateIds: [BASIC_PERSISTENCE_STATE.getStateId()],
      },
    );
    assert.ok(wfRunId, "Workflow Run Id should not be null");
    const result: string = await client.waitForWorkflowCompletion(
      <T>(v: unknown) => {
        return String(v) as T;
      },
      workflowId,
      wfRunId,
    ) as string;

    const searchAttributes = await client.getAllWorkflowSearchAttributes(
      BASIC_PERSISTENCE_WORKFLOW,
      workflowId,
      wfRunId,
    );
    const expected: Map<string, unknown> = new Map();
    expected.set("CustomIntField", 1234);
    expected.set("CustomKeywordField", "keyword");
    expected.set("CustomDatetimeField", 1731456001731);
    assert.deepStrictEqual(searchAttributes, expected);

    const dataAttributes = await client.getWorkflowDataAttributes(
      BASIC_PERSISTENCE_WORKFLOW,
      ctx.workflowId,
      wfRunId,
      [],
      false,
    );
    const model = dataAttributes.get(
      TEST_DATA_ATTRIBUTE_MODEL_1,
    ) as EncodedObject;
    dataAttributes.delete(TEST_DATA_ATTRIBUTE_MODEL_1);
    const parseResult = ZodContext.safeParse(JSON.parse(model.data || ""));
    assert.ok(parseResult.success);
    assert.deepEqual(
      dataAttributes,
      new Map([
        ["test-data-object-prefix-1234", { encoding: "json", data: "1234" }],
        ["test-init-data-object-key", {
          encoding: "json",
          data: '"init-test-value"',
        }],
      ]),
      "incorrect expected data attributes",
    );
    assert.equal(
      result,
      "finished",
      "expected workflow result to be `finished`",
    );
  });
});
