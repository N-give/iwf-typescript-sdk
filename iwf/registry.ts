import { SearchAttributeValueType } from "iwfidl";
import { CommunicationMethodDef } from "./communication_method_def.ts";
import { getFinalWorkflowType, IWorkflow } from "./workflow.ts";
import { getFinalWorkflowStateId, IWorkflowState } from "./workflow_state.ts";
import { StateDef } from "./state_def.ts";
import { TypeStore } from "./type_store.ts";
import { DataSources } from "./data_sources.ts";

export class Registry {
  private _workflows: Map<string, IWorkflow>;
  private _startingStates: Map<string, IWorkflowState>;
  private _states: Map<string, Map<string, StateDef>>;
  private _rpcNameStore: Map<
    string,
    Map<string, CommunicationMethodDef<DataSources.RPC_METHOD>>
  >;
  private _signalNameStore: Map<
    string,
    TypeStore<DataSources.SIGNAL_CHANNEL>
  >;
  private _internalChannels: Map<
    string,
    TypeStore<DataSources.INTERNAL_CHANNEL>
  >;
  private _dataAttributeKeys: Map<
    string,
    TypeStore<DataSources.DATA_ATTRIBUTE>
  >;
  private _searchAttributeTypes: Map<
    string,
    Map<string, SearchAttributeValueType>
  >;

  constructor() {
    this._workflows = new Map();
    this._startingStates = new Map();
    this._states = new Map();
    this._rpcNameStore = new Map();
    this._signalNameStore = new Map();
    this._internalChannels = new Map();
    this._dataAttributeKeys = new Map();
    this._searchAttributeTypes = new Map();
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
    this._workflows.set(wfType, w);
  }

  registerWorkflowStates(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    const stateMap = new Map();
    let startingState: IWorkflowState | undefined;
    w.getWorkflowStates().forEach((state) => {
      const stateId = getFinalWorkflowStateId(state.state);
      if (this._states.has(stateId)) {
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
    this._states.set(wfType, stateMap);
    this._startingStates.set(wfType, startingState);
  }

  registerWorkflowCommunicationSchema(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    const signalMap = new TypeStore(DataSources.SIGNAL_CHANNEL);
    const internalMap = new TypeStore(DataSources.INTERNAL_CHANNEL);
    const rpcMap = new Map();

    w.getCommunicationSchema().forEach((methodDef) => {
      const communicationMethod = methodDef.communicationMethod;
      switch (communicationMethod) {
        case DataSources.SIGNAL_CHANNEL:
          signalMap.addToTypeStore(methodDef);
          break;

        case DataSources.INTERNAL_CHANNEL:
          internalMap.addToTypeStore(methodDef);
          break;

        case DataSources.RPC_METHOD:
          rpcMap.set(methodDef.name, methodDef);
          break;

        default:
          throw new Error(
            `Workflow ${wfType} has invalid communicationMethod ${communicationMethod}`,
          );
      }
    });
    this._signalNameStore.set(wfType, signalMap);
    this._internalChannels.set(wfType, internalMap);
    this._rpcNameStore.set(wfType, rpcMap);
  }

  registerWorkflowPersistenceSchema(w: IWorkflow) {
    const wfType = getFinalWorkflowType(w);
    const dataAttrsKeys = new TypeStore(DataSources.DATA_ATTRIBUTE);
    const searchAttributes = new Map();

    w.getPersistenceSchema().forEach((p) => {
      const fieldType = p.fieldType;
      const key = p.key;
      switch (fieldType) {
        case DataSources.DATA_ATTRIBUTE:
          dataAttrsKeys.addToTypeStore(p);
          break;

        case DataSources.SEARCH_ATTRIBUTE:
          searchAttributes.set(key, p.searchAttributeType);
          break;

        default:
          throw new Error(
            `workflow ${wfType} has unsupported persistence field type ${fieldType} for key ${key}`,
          );
      }
    });
    this._dataAttributeKeys.set(wfType, dataAttrsKeys);
    this._searchAttributeTypes.set(wfType, searchAttributes);
  }

  getAllRegisteredWorkflowTypes(): string[] {
    return this._workflows.keys().toArray();
  }

  getWorkflowStartingState(wfType: string): IWorkflowState | undefined {
    return this._startingStates.get(wfType);
  }

  getWorkflowStateDef(wfType: string, id: string): StateDef | undefined {
    return this._states.get(wfType)?.get(id);
  }

  getSignalNameStore(
    wfType: string,
  ): TypeStore<DataSources.SIGNAL_CHANNEL> | undefined {
    return this._signalNameStore.get(wfType);
  }

  getWorkflowInternalChannelNameStore(
    wfType: string,
  ): TypeStore<DataSources.INTERNAL_CHANNEL> | undefined {
    return this._internalChannels.get(wfType);
  }

  getWorkflowDataAttributesKeyStore(
    wfType: string,
  ): TypeStore<DataSources.DATA_ATTRIBUTE> | undefined {
    return this._dataAttributeKeys.get(wfType);
  }

  getSearchAttributeTypeStore(
    wfType: string,
  ): Map<string, SearchAttributeValueType> | undefined {
    return this._searchAttributeTypes.get(wfType);
  }

  getWorkflowRPC(
    wfType: string,
    rpcMethod: string,
  ): CommunicationMethodDef<DataSources.RPC_METHOD> | undefined {
    return this._rpcNameStore.get(wfType)?.get(rpcMethod);
  }

  getWorkflow(wfType: string): IWorkflow | undefined {
    return this._workflows.get(wfType);
  }
}
