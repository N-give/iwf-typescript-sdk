import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Client } from "../iwf/client.ts";
import { LOCAL_DEFAULT_CLIENT_OPTIONS } from "../iwf/client_options.ts";
import { Context } from "iwfidl";
import { Registry } from "../iwf/registry.ts";
import { IWorkflow } from "../iwf/workflow.ts";
import { CommunicationMethodDef } from "../iwf/communication_method_def.ts";
import { PersistenceFieldDef } from "../iwf/persistence_def.ts";
import { StateDef } from "../iwf/state_def.ts";
import { IWorkflowState } from "../iwf/workflow_state.ts";
import { CommandResults } from "../iwf/command_result.ts";
import { Communication } from "../iwf/communication.ts";
import { Persistence } from "../iwf/persistence.ts";
import { StateDecision } from "../iwf/state_decision.ts";
import { WorkflowContext } from "../iwf/workflow_context.ts";

function adder(a: number, b: number) {
  return a + b;
}

// describe("testing that tests run", () => {
//   it("2 + 2 = 4", () => {
//     assert.equal(4, adder(2, 2));
//   });
// });

class TestState implements IWorkflowState {
  getStateId(): string {
    return "TestState";
  }
  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log("test state running");
    return {
      nextStates: [],
    };
  }

  getStateOptions() {
    return undefined;
  }
}

class TestWorkflow implements IWorkflow {
  getWorkflowStates(): StateDef[] {
    return [
      {
        state: new TestState(),
        canStartWorkflow: true,
      },
    ];
  }
  getPersistenceSchema(): PersistenceFieldDef[] {
    return [];
  }
  getCommunicationSchema(): CommunicationMethodDef[] {
    return [];
  }
  getWorkflowType(): string {
    return "TestWorkflow";
  }
}

const testWorkflow = new TestWorkflow();
const registry: Registry = new Registry();
registry.addWorkflow(testWorkflow);
const client: Client = new Client(
  registry,
  LOCAL_DEFAULT_CLIENT_OPTIONS,
);

describe("Start the test workflow", () => {
  it("starts the test workflow", async () => {
    console.log("starting test...");
    const ctx: Context = {
      workflowId: "test-workflow-1",
      workflowRunId: "run1",
      workflowStartedTimestamp: 0,
    };
    const wfRunId = await client.startWorkflow(
      ctx,
      testWorkflow,
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

    assert.equal(wfRunId, ctx.workflowId);
  });
});
