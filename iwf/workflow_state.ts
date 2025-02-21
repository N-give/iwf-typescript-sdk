import { StateDecision } from "./state_decision.ts";
import { StateOptions } from "./state_options.ts";
import { WorkflowContext } from "./workflow_context.ts";

export interface IWorkflowState {
  // GetStateId defines the StateId of this workflow state definition.
  // the StateId is being used for WorkerService to choose the right WorkflowState to execute Start/Execute APIs
  // See GetDefaultWorkflowStateId for default value when return empty string.
  // It's the package + struct name of the workflow instance and ignores the import paths and aliases.
  // e.g. if the workflow is from myStruct{} under mywf package, the simple name is just "mywf.myStruct". Underneath, it's from reflect.TypeOf(wf).String().
  //
  // Usually using default value is enough. Unless cases like:
  // 1. You rename the workflowState struct but there is some in-flight state execution still using the old StateId
  // 2. To avoid type name conflicts because the GetDefaultWorkflowStateId is not long enough
  // 3. In case of dynamic workflow state implementation, return customized values instead of using empty string
  getStateId(): string;

  // WaitUntil is the method to set up commands set up to wait for, before `Execute` API is invoked.
  //           It's optional -- use iwf.WorkflowStateDefaultsNoWaitUntil or iwf.NoWaitUntil to skip this step( Execute will be invoked instead)
  //
  //  ctx              the context info of this API invocation, like workflow start time, workflowId, etc
  //  input            the state input
  //  Persistence      the API for 1) data attributes, 2) search attributes and 3) stateExecutionLocals 4) recordEvent
  //                         DataObjects and SearchAttributes are defined by ObjectWorkflow interface.
  //                         StateExecutionLocals are for passing data within the state execution
  //                         RecordEvent is for storing some tracking info(e.g. RPC call input/output) when executing the API.
  //                         Note that any write API will be recorded to server after the whole WaitUntil API response is accepted
  //  Communication    the API right now only for publishing value to internalChannel
  //                         Note that any write API will be recorded to server after the whole start API response is accepted.
  // @return the requested commands for this state
  ///
  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest;

  // Execute is the method to execute and decide what to do next. Invoke after commands from WaitUntil are completed, or there is WaitUntil is not implemented for the state.
  //
  //  ctx              the context info of this API invocation, like workflow start time, workflowId, etc
  //  input            the state input
  //  CommandResults   the results of the command that executed by WaitUntil
  //  Persistence      the API for 1) data attributes, 2) search attributes and 3) stateExecutionLocals 4) recordEvent
  //                         DataObjects and SearchAttributes are defined by ObjectWorkflow interface.
  //                         StateExecutionLocals are for passing data within the state execution
  //                         RecordEvent is for storing some tracking info(e.g. RPC call input/output) when executing the API.
  //                         Note that any write API will be recorded to server after the whole WaitUntil API response is accepted
  //  Communication    the API right now only for publishing value to internalChannel
  //                         Note that any write API will be recorded to server after the whole start API response is accepted.
  // @return the decision of what to do next(e.g. transition to next states or closing workflow)
  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision;

  // GetStateOptions can just return nil to use the default Options
  // StateOptions is optional configuration to adjust the state behaviors
  getStateOptions(): StateOptions;
}

export function getFinalWorkflowStateId(s: IWorkflowState): string {
  return s.getStateId() || s.constructor.name;
}
