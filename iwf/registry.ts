import { CommunicationMethodType } from "./communication_method_def.ts";
import { SearchAttributeValueType } from "../gen/iwfidl/src/models/SearchAttributeValueType.ts";
import { PersistenceFieldType } from "./persistence_def.ts";
import { getFinalWorkflowType, IWorkflow } from "./workflow.ts";
import { getFinalWorkflowStateId, WorkflowState } from "./workflow_state.ts";

export class Registry {
  private _workflowStore: Map<string, IWorkflow>;
  private _workflowStartingState: Map<string, WorkflowState>;
  private _workflowStateStore: Map<string, Map<string, StateDef>>;
  private _workflowRPCStore: Map<string, Map<string, CommunicationMethodDef>>;
  private _signalNameStore: Map<string, Map<string, boolean>>;
  private _internalChannelNameStore: Map<string, Map<string, boolean>>;
  private _dataAttrsKeyStore: Map<string, Map<string, boolean>>;
  private _searchAttributeTypeStore: Map<
    string,
    Map<string, SearchAttributeValueType>
  >;

  constructor() {
    this._workflowStore = new Map();
    this._workflowStartingState = new Map();
    this._workflowStateStore = new Map();
    this._workflowRPCStore = new Map();
    this._signalNameStore = new Map();
    this._internalChannelNameStore = new Map();
    this._dataAttrsKeyStore = new Map();
    this._searchAttributeTypeStore = new Map();
  }

  addWorkflows(...ws: IWorkflow[]) {
    ws.forEach((w) => {
      this.addWorkflow(w);
    });
  }

  addWorkflow(w: IWorkflow) {
    this.registerWorkflow(w);
    this.registerWorkflowStates(w);
    this.registerWorkflowCommunicationSchema(w);
    this.registerWorkflowPersistenceSchema(w);
  }

  registerWorkflow(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    this._workflowStore.set(wfType, w);
  }

  registerWorkflowStates(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    const stateMap = new Map();
    let startingState: WorkflowState | undefined;
    w.getWorkflowStates().forEach((state) => {
      const stateId = getFinalWorkflowStateId(state.state);
      if (this._workflowStateStore.has(stateId)) {
        throw new Error(
          `Workflow ${wfType} cannot have duplicate state ids ${stateId}`,
        );
      }
      stateMap.set(stateId, state);
      if (state.canStartWorkflow) {
        if (startingState === null || startingState === undefined) {
          startingState = state.state;
        } else {
          throw new Error(
            `Workflow ${wfType} must have exactly one starting state`,
          );
        }
      }
    });

    if (startingState === null || startingState === undefined) {
      throw new Error(
        `Workflow ${wfType} must have exactly one starting state`,
      );
    }
    this._workflowStateStore.set(wfType, stateMap);
    this._workflowStartingState.set(wfType, startingState);
  }

  registerWorkflowCommunicationSchema(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    const signalMap = new Map();
    const internalMap = new Map();
    const rpcMap = new Map();

    w.getCommunicationSchema().forEach((methodDef) => {
      const communicationMethod = methodDef.communicationMethod;
      switch (communicationMethod) {
        case CommunicationMethodType.SIGNAL_CHANNEL:
          signalMap.set(methodDef.name, true);
          break;

        case CommunicationMethodType.INTERNAL_CHANNEL:
          internalMap.set(methodDef.name, true);
          break;

        case CommunicationMethodType.RPC_METHOD:
          rpcMap.set(methodDef.name, methodDef);
          break;

        default:
          throw new Error(
            `Workflow ${wfType} has invalid communicationMethod ${communicationMethod}`,
          );
      }
    });
    this._signalNameStore.set(wfType, signalMap);
    this._internalChannelNameStore.set(wfType, internalMap);
    this._workflowRPCStore.set(wfType, rpcMap);
  }

  registerWorkflowPersistenceSchema(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    const dataAttrsKeys = new Map();
    const searchAttributes = new Map();

    w.getPersistenceSchema().forEach((p) => {
      switch (p.fieldType) {
        case PersistenceFieldType.DATA_ATTRIBUTE:
          dataAttrsKeys.set(p.key, true);
          break;

        case PersistenceFieldType.SEARCH_ATTRIBUTE:
          searchAttributes.set(p.key, p.searchAttributeType);
          break;

        default:
          throw new Error(
            `workflow ${wfType} has unsupported persistence field type ${p.fieldType} for key ${p.key}`,
          );
      }
    });
    this._dataAttrsKeyStore.set(wfType, dataAttrsKeys);
    this._searchAttributeTypeStore.set(wfType, searchAttributes);
  }
}
