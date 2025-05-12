import { Registry } from "../iwf/registry.ts";
import { ALL_WORKFLOWS } from "./workflows/index.ts";

const registry = new Registry();
registry.addWorkflows(...ALL_WORKFLOWS);

export const REGISTRY: Registry = registry;
