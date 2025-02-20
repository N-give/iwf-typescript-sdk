export class Client {
  constructor() {

  }

  startWorkflow(
    _ctx: Context,
    _workflow: ObjectWorkflow,
    _workflowId: string,
    _timeoutSecs: number,
    _input: unknown,
    _options: WorkflowOptions
  ): string {
    return "";
  }

  // SignalWorkflow signals a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // signalChannelName is required, signalValue is optional(for case of empty value)
  signalWorkflow(
    _ctx: Context,
    _workflow: ObjectWorkflow,
    _workflowId: string,
    _workflowRunId: string,
    _signalChannelName: string,
    _signalValue: unknown
  ) {
  }

  // GetWorkflowDataAttributes returns the data objects of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // keys is required to be non-empty. If you intend to return all data objects, use GetAllWorkflowDataAttributes API instead
  getWorkflowDataAttributes(
    _ctx: Context,
    _workflow: ObjectWorkflow,
    _workflowId: string,
    _workflowRunId: string,
    _keys: string[],
  ): Map<string, unknown> {
    return new Map();
  }

  // GetWorkflowSearchAttributes returns search attributes of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // keys is required to be non-empty. If you intend to return all data objects, use GetAllWorkflowSearchAttributes API instead
  getWorkflowSearchAttributes(
    _ctx: Context,
    _workflow: ObjectWorkflow,
    _workflowId: string,
    _workflowRunId: string,
    _keys: string[]
  ): Map<string, unknown> {
    return new Map();
  }

  // GetAllWorkflowSearchAttributes returns all search attributes of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  getAllWorkflowSearchAttributes(
    _ctx: Context,
    _workflow: ObjectWorkflow,
    _workflowId: string,
    _workflowRunId: string
  ): Map<string, unknown> {
    retrun new Map();
  }

  // SkipTimerByCommandId skips a timer for the state execution based on the timerCommandId
  skipTimerByCommandId(
    _ctx: context.Context,
    _workflowId: string,
    _workflowRunId: string,
    _workflowState: WorkflowState,
    _stateExecutionNumber: number,
    _timerCommandId: stringw
  ) {
  }

  // SkipTimerByCommandIndex skips a timer for the state execution based on the timerCommandId
  skipTimerByCommandIndex(
    _ctx: context.Context,
    _workflowId: string,
    _workflowRunId: string,
    _workflowState: WorkflowState,
    _stateExecutionNumber: number,
    _timerCommandIndex: number
  ) {
  }

  // InvokeRPC invokes an RPC
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // rpc is required
  // input and outputPtr are optional
  invokeRPC(
    _ctx: context.Context,
    _workflowId: string,
    _workflowRunId: string,
    _rpc: RPC,
    _input: unknown,
    _outputPtr: unknown
  ) {
  }
}
