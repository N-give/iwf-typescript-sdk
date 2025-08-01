import { CommunicationMethodDef } from "./communication_method_def.ts";
import { DataSources } from "./data_sources.ts";
import { PersistenceFieldDef } from "./persistence_def.ts";
import { StateDef } from "./state_def.ts";

export interface IWorkflow {
  // GetWorkflowStates defines the states of the workflow. A state represents a step of the workflow state machine.
  // A state can execute some commands (signal/timer) and wait for result
  // See more details in the WorkflowState interface.
  // It can return an empty list, meaning no states.
  // There can be at most one startingState in the list.
  // If there is no startingState or with the default empty state list, the workflow
  // will not start any state execution after workflow stated. Application can still
  // use RPC to invoke new state execution in the future.
  getWorkflowStates(): StateDef[];

  // GetPersistenceSchema defines all the persistence fields for this workflow, this includes:
  //  1. Data objects
  //  2. Search attributes
  //
  // Data objects can be read/upsert in WorkflowState WaitUntil/Execute API
  // Data objects  can also be read by getDataObjects API by external applications using {@link Client}
  //
  // Search attributes can be read/upsert in WorkflowState WaitUntil/Execute API
  // Search attributes can also be read by GetSearchAttributes Client API by external applications.
  // External applications can also use "SearchWorkflow" API to find workflows by SQL-like query
  getPersistenceSchema(): PersistenceFieldDef<
    | DataSources.DATA_ATTRIBUTE
    | DataSources.SEARCH_ATTRIBUTE
  >[];

  // GetCommunicationSchema defines all the communication methods for this workflow, this includes
  // 1. Signal channel
  // 2. Interstate channel
  //
  // Signal channel is for external applications to send signal to workflow execution.
  // ObjectWorkflow execution can listen on the signal in the WorkflowState WaitUntil API and receive in
  // the WorkflowState Execute API
  //
  // InterStateChannel is for synchronization communications between WorkflowStates.
  // E.g. WorkflowStateA will continue after receiving a value from WorkflowStateB
  ///
  getCommunicationSchema(): CommunicationMethodDef<
    | DataSources.SIGNAL_CHANNEL
    | DataSources.INTERNAL_CHANNEL
    | DataSources.RPC_METHOD
  >[];

  // GetWorkflowType Define the workflowType of this workflow definition.
  // See GetFinalWorkflowType for default value when return empty string.
  // It's the package + struct name of the workflow instance and ignores the import paths and aliases.
  // e.g. if the workflow is from myStruct{} under mywf package, the simple name is just "mywf.myStruct". Underneath, it's from reflect.TypeOf(wf).String().
  //
  // Usually using default value is enough. Unless cases like:
  // 1. To avoid type name conflicts because the GetFinalWorkflowType is not long enough
  // 2. In case of dynamic workflow implementation, return customized values instead of using empty string
  getWorkflowType(): string;
}

export function getFinalWorkflowType(wf: IWorkflow): string {
  return wf.getWorkflowType() || wf.constructor.name;
}
