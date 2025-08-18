import { SearchAttributeValueType } from "iwfidl";
import {
  allCommandsCompletedRequest,
  CommandRequest,
  emptyCommandRequest,
} from "../../iwf/command_request.ts";
import { z } from "zod";
import { CommandResults } from "../../iwf/command_result.ts";
import { Communication } from "../../iwf/communication.ts";
import { CommunicationMethodDef } from "../../iwf/communication_method_def.ts";
import { Persistence } from "../../iwf/persistence.ts";
import {
  dataAttributeDef,
  dataAttributePrefix,
  PersistenceFieldDef,
  searchAttributeDef,
} from "../../iwf/persistence_def.ts";
import {
  gracefulCompleteWorkflow,
  StateDecision,
} from "../../iwf/state_decision.ts";
import { startingStateDef, StateDef } from "../../iwf/state_def.ts";
import { IWorkflow } from "../../iwf/workflow.ts";
import { WorkflowContext } from "../../iwf/workflow_context.ts";
import { IWorkflowState } from "../../iwf/workflow_state.ts";
import { DataSources } from "../../iwf/data_sources.ts";
import { Context } from "../../gen/api-schema.ts";
// import { newTimerCommandByDuration } from "../../iwf/command.ts";

const InitDASchema = z.string();
const TestDAKey = z.string();
const TestDALong = z.number();

export const TEST_INIT_DATA_ATTRIBUTE_KEY = "test-init-data-object-key";
export const TEST_DATA_ATTRIBUTE_KEY = "test-data-object-key";
export const TEST_DATA_ATTRIBUTE_MODEL_1 = "test-data-object-model-1";
export const TEST_DATA_ATTRIBUTE_MODEL_2 = "test-data-object-model-2";
export const TEST_DATA_ATTRIBUTE_PREFIX = "test-data-object-prefix";
export const TEST_SEARCH_ATTRIBUTE_KEYWORD = "CustomKeywordField";
export const TEST_SEARCH_ATTRIBUTE_INT = "CustomIntField";
export const TEST_SEARCH_ATTRIBUTE_DATE_TIME = "CustomDatetimeField";

class BasicPersistenceState implements IWorkflowState {
  getStateId(): string {
    return "BasicPersistenceState";
  }

  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    console.log(`${ctx.stateExecutionId} wait until ${ctx.attempt}`);
    persistence.setDataAttribute(TEST_DATA_ATTRIBUTE_MODEL_1, ctx.ctx);
    persistence.setDataAttribute(`${TEST_DATA_ATTRIBUTE_PREFIX}-1234`, 1234);
    persistence.setSearchAttribute(TEST_SEARCH_ATTRIBUTE_INT, 1234);
    persistence.setSearchAttribute(TEST_SEARCH_ATTRIBUTE_KEYWORD, "keyword");
    persistence.setSearchAttribute(
      TEST_SEARCH_ATTRIBUTE_DATE_TIME,
      "2024-11-12T16:00:01.731455544-08:00",
    );
    return emptyCommandRequest();
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log(`${ctx.stateExecutionId} execute ${ctx.attempt}`);
    const da = persistence.getDataAttribute(TEST_DATA_ATTRIBUTE_MODEL_1);
    console.log("persistence workflow da:", da);
    const daLong = persistence.getDataAttribute(
      `${TEST_DATA_ATTRIBUTE_PREFIX}-1234`,
    );
    console.log("persistence workflow daLong:", daLong);
    const saInt = persistence.getSearchAttribute(TEST_SEARCH_ATTRIBUTE_INT);
    console.log("persistence workflow daInt:", saInt);
    const saKeyword = persistence.getSearchAttribute(
      TEST_SEARCH_ATTRIBUTE_KEYWORD,
    );
    console.log("persistence workflow saKeyword:", saKeyword);
    const saDatetime = persistence.getSearchAttribute(
      TEST_SEARCH_ATTRIBUTE_DATE_TIME,
    );
    console.log("persistence workflow saDatetime:", saDatetime);
    return gracefulCompleteWorkflow("finished");
  }
}

export const BASIC_PERSISTENCE_STATE = new BasicPersistenceState();

class BasicPersistenceWorkflow implements IWorkflow {
  getWorkflowStates(): StateDef[] {
    return [
      startingStateDef(BASIC_PERSISTENCE_STATE),
    ];
  }
  getPersistenceSchema(): PersistenceFieldDef<
    | DataSources.DATA_ATTRIBUTE
    | DataSources.SEARCH_ATTRIBUTE
  >[] {
    return [
      dataAttributeDef(
        TEST_INIT_DATA_ATTRIBUTE_KEY,
        <V>(v: unknown) => InitDASchema.parse(v) as V,
      ),
      dataAttributeDef(
        TEST_DATA_ATTRIBUTE_KEY,
        <V>(v: unknown) => TestDAKey.parse(v) as V,
      ),
      dataAttributeDef(
        TEST_DATA_ATTRIBUTE_MODEL_1,
        <V>(v: unknown) => Context.parse(v) as V,
      ),
      dataAttributePrefix(
        TEST_DATA_ATTRIBUTE_PREFIX,
        <V>(v: unknown) => TestDALong.parse(v) as V,
      ),
      searchAttributeDef(
        TEST_SEARCH_ATTRIBUTE_INT,
        SearchAttributeValueType.Int,
      ),
      searchAttributeDef(
        TEST_SEARCH_ATTRIBUTE_KEYWORD,
        SearchAttributeValueType.Keyword,
      ),
      searchAttributeDef(
        TEST_SEARCH_ATTRIBUTE_DATE_TIME,
        SearchAttributeValueType.Datetime,
      ),
    ];
  }
  getCommunicationSchema(): CommunicationMethodDef<
    | DataSources.SIGNAL_CHANNEL
    | DataSources.INTERNAL_CHANNEL
    | DataSources.RPC_METHOD
  >[] {
    return [];
  }
  getWorkflowType(): string {
    return "BasicPersistenceWorkflow";
  }
}

export const BASIC_PERSISTENCE_WORKFLOW = new BasicPersistenceWorkflow();
