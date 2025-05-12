import { CommunicationMethodDef } from "./communication_method_def.ts";
import { DataSources } from "./data_sources.ts";
import { PersistenceFieldDef } from "./persistence_def.ts";

export class TypeStore<T extends DataSources> {
  #classType: T;
  #nameToType: Map<
    string,
    T extends DataSources.DATA_ATTRIBUTE
      ? PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>
      : CommunicationMethodDef<
        DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
      >
  >;
  #prefixToType: Map<
    string,
    T extends DataSources.DATA_ATTRIBUTE
      ? PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>
      : CommunicationMethodDef<
        DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
      >
  >;

  constructor(
    classType: T,
    nameToType?: Map<
      string,
      T extends DataSources.DATA_ATTRIBUTE
        ? PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>
        : CommunicationMethodDef<
          DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
        >
    >,
    prefixToType?: Map<
      string,
      T extends DataSources.DATA_ATTRIBUTE
        ? PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>
        : CommunicationMethodDef<
          DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
        >
    >,
  ) {
    this.#classType = classType;
    this.#nameToType = nameToType || new Map();
    this.#prefixToType = prefixToType || new Map();
  }

  validateKey(key: string): boolean {
    const [isValid, _validator] = this.validateKeyAndData(key);
    return isValid;
  }

  validateKeyAndData(
    key: string,
  ): [true, (<V>(v: unknown) => V)] | [false, undefined] {
    if (this.#nameToType.has(key)) {
      const def = this.#nameToType.get(key);
      if (!def) {
        throw new Error(`data attribute ${key} is not registered`);
      }
      return [true, def.validator];
    }
    for (const [prefix, t] of this.#prefixToType.entries()) {
      if (key.startsWith(prefix)) {
        return [true, t.validator];
      }
    }
    return [false, undefined];
  }

  addToTypeStore(
    def: T extends DataSources.DATA_ATTRIBUTE
      ? PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>
      : CommunicationMethodDef<
        DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
      >,
  ) {
    let isPrefix: boolean;
    let name: string;

    if (this.#classType === DataSources.DATA_ATTRIBUTE) {
      const da = def as PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>;
      if (da.fieldType !== DataSources.DATA_ATTRIBUTE) {
        throw new Error(
          `attribute of type ${da.fieldType} extected to be of type ${this.#classType}`,
        );
      }
      isPrefix = da.isPrefix;
      name = da.key;
    } else {
      const channel = def as CommunicationMethodDef<
        DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
      >;
      isPrefix = channel.isPrefix;
      name = channel.name;
    }
    this.#addToStore(isPrefix, name, def);
  }

  #addToStore(
    isPrefix: boolean,
    name: string,
    def: T extends DataSources.DATA_ATTRIBUTE
      ? PersistenceFieldDef<DataSources.DATA_ATTRIBUTE>
      : CommunicationMethodDef<
        DataSources.SIGNAL_CHANNEL | DataSources.INTERNAL_CHANNEL
      >,
  ) {
    const store = isPrefix ? this.#prefixToType : this.#nameToType;
    if (store.has(name)) {
      throw new Error(`${name} is already defined in TypeStore`);
    }
    store.set(name, def);
  }
}
