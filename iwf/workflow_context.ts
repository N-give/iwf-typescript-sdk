import { Context } from "../gen/iwfidl/src/models/Context.ts";

export class WorkflowContext {
  ctx: Context;
  private _workflowId: string;
  private _workflowRunId: string;
  private _stateExecutionId: string;
  private _attempt: number;
  private _workflowStartTimestampSeconds: number;
  private _firstAttemptTimestampSeconds: number;

  constructor(
    ctx: Context,
    workflowId: string,
    workflowRunId: string,
    stateExecutionId: string,
    attempt: number,
    workflowStartTimestampSeconds: number,
    firstAttemptTimestampSeconds: number,
  ) {
    this.ctx = ctx;
    this._workflowId = workflowId;
    this._workflowRunId = workflowRunId;
    this._stateExecutionId = stateExecutionId;
    this._attempt = attempt;
    this._workflowStartTimestampSeconds = workflowStartTimestampSeconds;
    this._firstAttemptTimestampSeconds = firstAttemptTimestampSeconds;
  }

  public get workflowId(): string {
    return this._workflowId;
  }

  public get workflowRunId(): string {
    return this._workflowRunId;
  }

  public get stateExecutionId(): string {
    return this._stateExecutionId;
  }

  public get attempt(): number {
    return this._attempt;
  }

  public get workflowStartTimestampSeconds(): number {
    return this._workflowStartTimestampSeconds;
  }

  public get firstAttemptTimestampSeconds(): number {
    return this._firstAttemptTimestampSeconds;
  }
}
