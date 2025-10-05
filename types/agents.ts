// Tipi semplificati per il sistema modulare di agenti
import { Id } from "../convex/_generated/dataModel";

export interface Agent {
  _id: Id<"agents">;
  id?: Id<"agents">; // Mantenuto per compatibilità ma _id è quello principale
  userId: Id<"users">;
  name: string;
  description: string;
  systemPrompt: string;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  isActive: boolean;
  isSystem: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowStep {
  agentId: Id<"agents">;
  order: number;
  executeInParallel: boolean;
  useOutputFrom?: number;
  /** Se true, l'output di questo step deve generare un documento. Default: true (retrocompatibilità) */
  produceDocument?: boolean;
  /** Titolo del documento generato da questo step (richiesto se produceDocument !== false) */
  documentTitle?: string;
}

export interface Workflow {
  _id: Id<"workflows">;
  id?: Id<"workflows">; // Mantenuto per compatibilità ma _id è quello principale
  userId: Id<"users">;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Tipi per l'esecuzione
export interface AgentExecutionContext {
  input: string;
  language: string;
  userId: Id<"users">;
  previousOutput?: string;
}

export interface WorkflowExecutionResult {
  success: boolean;
  outputs: Record<number, string>; // order -> output
  error?: string;
}