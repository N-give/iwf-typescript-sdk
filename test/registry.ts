import { Registry } from "../iwf/registry.ts";
import { ALL_WORKFLOWS } from "./workflows/index.ts";

export const REGISTRY = new Registry();
REGISTRY.addWorkflows(...ALL_WORKFLOWS);
