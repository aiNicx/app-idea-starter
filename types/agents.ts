// Tipi per il sistema modulare di agenti
import { Id } from "../convex/_generated/dataModel";

export interface Agent {
  id: Id<"agents">;
  _id?: Id<"agents">; // For Convex compatibility
  userId: Id<"users">;
  name: string;
  description: string;
  persona: string;
  icon: string;
  promptTemplate: string;
  isActive: boolean;
  isSystem: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface WorkflowStep {
  agentId: Id<"agents">;
  order: number;
  isActive: boolean;
  conditions?: string; // JSON string per logica condizionale
  parallelExecution?: boolean; // For parallel execution
}

export interface Workflow {
  id: Id<"workflows">;
  _id?: Id<"workflows">; // For Convex compatibility
  userId: Id<"users">;
  name: string;
  description: string;
  agentSequence: WorkflowStep[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AgentConfiguration {
  id: Id<"agentConfigurations">;
  _id?: Id<"agentConfigurations">; // For Convex compatibility
  userId: Id<"users">;
  agentId: Id<"agents">;
  customPrompt?: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Tipi per il template engine
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  defaultValue?: any;
}

export interface TemplateCondition {
  variable: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains';
  value: any;
  then: string;
  else?: string;
}

export interface ParsedTemplate {
  variables: TemplateVariable[];
  conditions: TemplateCondition[];
  rawTemplate: string;
}

export interface ValidationError {
  type: 'syntax' | 'variable' | 'logic';
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning {
  type: 'performance' | 'best_practice';
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Tipi per l'esecuzione degli agenti
export interface AgentExecutionContext {
  idea: string;
  language: string;
  modelId?: string;
  userId: Id<"users">;
  variables: Record<string, any>;
}

export interface WorkflowExecutionContext extends AgentExecutionContext {
  previousResults: Record<string, string>;
}

// Tipi per le funzioni CRUD
export interface CreateAgentInput {
  name: string;
  description: string;
  persona: string;
  icon: string;
  promptTemplate: string;
  order?: number;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  isActive?: boolean;
}

export interface CreateWorkflowInput {
  name: string;
  description: string;
  agentSequence: Omit<WorkflowStep, 'agentId'>[];
}

export interface UpdateWorkflowInput extends Partial<CreateWorkflowInput> {
  isActive?: boolean;
}

export interface CreateConfigurationInput {
  agentId: Id<"agents">;
  customPrompt?: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
}

export interface UpdateConfigurationInput extends Partial<CreateConfigurationInput> {
  isActive?: boolean;
}
