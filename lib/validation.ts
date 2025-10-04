import { Agent, Workflow, AgentConfiguration, ValidationResult, ValidationError, ValidationWarning } from '../types/agents';

export class ValidationService {
  /**
   * Valida un agente
   */
  static validateAgent(agent: Partial<Agent>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validazione campi obbligatori
    if (!agent.name || agent.name.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Agent name is required',
      });
    } else if (agent.name.length > 100) {
      errors.push({
        type: 'syntax',
        message: 'Agent name is too long (max 100 characters)',
      });
    }

    if (!agent.description || agent.description.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Agent description is required',
      });
    } else if (agent.description.length > 500) {
      errors.push({
        type: 'syntax',
        message: 'Agent description is too long (max 500 characters)',
      });
    }

    if (!agent.persona || agent.persona.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Agent persona is required',
      });
    }

    if (!agent.icon || agent.icon.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Agent icon is required',
      });
    }

    if (!agent.promptTemplate || agent.promptTemplate.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Agent prompt template is required',
      });
    } else if (agent.promptTemplate.length > 10000) {
      errors.push({
        type: 'syntax',
        message: 'Agent prompt template is too long (max 10000 characters)',
      });
    }

    // Validazione ordine
    if (agent.order !== undefined && (agent.order < 0 || agent.order > 1000)) {
      errors.push({
        type: 'syntax',
        message: 'Agent order must be between 0 and 1000',
      });
    }

    // Warning per template molto lunghi
    if (agent.promptTemplate && agent.promptTemplate.length > 5000) {
      warnings.push({
        type: 'performance',
        message: 'Prompt template is very long, consider breaking it into smaller parts',
        suggestion: 'Split the template into multiple smaller templates or use variables',
      });
    }

    // Warning per descrizioni molto brevi
    if (agent.description && agent.description.length < 20) {
      warnings.push({
        type: 'best_practice',
        message: 'Agent description is very short',
        suggestion: 'Provide a more detailed description to help users understand the agent\'s purpose',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida un workflow
   */
  static validateWorkflow(workflow: Partial<Workflow>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validazione campi obbligatori
    if (!workflow.name || workflow.name.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Workflow name is required',
      });
    } else if (workflow.name.length > 100) {
      errors.push({
        type: 'syntax',
        message: 'Workflow name is too long (max 100 characters)',
      });
    }

    if (!workflow.description || workflow.description.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Workflow description is required',
      });
    } else if (workflow.description.length > 500) {
      errors.push({
        type: 'syntax',
        message: 'Workflow description is too long (max 500 characters)',
      });
    }

    // Validazione sequenza agenti
    if (!workflow.agentSequence || workflow.agentSequence.length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Workflow must have at least one agent',
      });
    } else {
      // Verifica ordini unici
      const orders = workflow.agentSequence.map(step => step.order);
      const uniqueOrders = new Set(orders);
      
      if (orders.length !== uniqueOrders.size) {
        errors.push({
          type: 'syntax',
          message: 'Agent sequence must have unique order values',
        });
      }

      // Verifica che ci sia almeno un agente attivo
      const activeAgents = workflow.agentSequence.filter(step => step.isActive);
      if (activeAgents.length === 0) {
        errors.push({
          type: 'syntax',
          message: 'Workflow must have at least one active agent',
        });
      }

      // Warning per troppi agenti
      if (workflow.agentSequence.length > 10) {
        warnings.push({
          type: 'performance',
          message: 'Workflow has many agents, consider breaking it into smaller workflows',
          suggestion: 'Split complex workflows into multiple simpler ones',
        });
      }

      // Warning per ordini non sequenziali
      const sortedOrders = [...orders].sort((a, b) => a - b);
      const isSequential = orders.every((order, index) => order === sortedOrders[index]);
      
      if (!isSequential) {
        warnings.push({
          type: 'best_practice',
          message: 'Agent sequence orders are not sequential',
          suggestion: 'Consider reordering agents for better readability',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida una configurazione di agente
   */
  static validateConfiguration(config: Partial<AgentConfiguration>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validazione campi obbligatori
    if (!config.modelId || config.modelId.trim().length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Model ID is required',
      });
    }

    // Validazione temperatura
    if (config.temperature !== undefined) {
      if (config.temperature < 0 || config.temperature > 2) {
        errors.push({
          type: 'syntax',
          message: 'Temperature must be between 0 and 2',
        });
      }
    }

    // Validazione max tokens
    if (config.maxTokens !== undefined) {
      if (config.maxTokens < 1 || config.maxTokens > 10000) {
        errors.push({
          type: 'syntax',
          message: 'Max tokens must be between 1 and 10000',
        });
      }
    }

    // Validazione custom prompt
    if (config.customPrompt && config.customPrompt.length > 10000) {
      errors.push({
        type: 'syntax',
        message: 'Custom prompt is too long (max 10000 characters)',
      });
    }

    // Warning per temperatura molto alta
    if (config.temperature && config.temperature > 1.5) {
      warnings.push({
        type: 'best_practice',
        message: 'High temperature may produce inconsistent results',
        suggestion: 'Consider using a lower temperature (0.7-1.0) for more consistent output',
      });
    }

    // Warning per max tokens molto basso
    if (config.maxTokens && config.maxTokens < 100) {
      warnings.push({
        type: 'best_practice',
        message: 'Very low max tokens may truncate responses',
        suggestion: 'Consider increasing max tokens to allow for complete responses',
      });
    }

    // Warning per max tokens molto alto
    if (config.maxTokens && config.maxTokens > 8000) {
      warnings.push({
        type: 'performance',
        message: 'Very high max tokens may increase response time and cost',
        suggestion: 'Consider reducing max tokens if not needed for the specific use case',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida un nome di agente per unicità
   */
  static validateAgentNameUniqueness(
    name: string, 
    existingAgents: Agent[], 
    currentAgentId?: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const duplicateAgent = existingAgents.find(agent => 
      agent.name.toLowerCase() === name.toLowerCase() && 
      agent.id !== currentAgentId
    );

    if (duplicateAgent) {
      errors.push({
        type: 'syntax',
        message: 'Agent name must be unique',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida un nome di workflow per unicità
   */
  static validateWorkflowNameUniqueness(
    name: string, 
    existingWorkflows: Workflow[], 
    currentWorkflowId?: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const duplicateWorkflow = existingWorkflows.find(workflow => 
      workflow.name.toLowerCase() === name.toLowerCase() && 
      workflow.id !== currentWorkflowId
    );

    if (duplicateWorkflow) {
      errors.push({
        type: 'syntax',
        message: 'Workflow name must be unique',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida la sequenza di agenti in un workflow
   */
  static validateAgentSequence(agentSequence: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!Array.isArray(agentSequence)) {
      errors.push({
        type: 'syntax',
        message: 'Agent sequence must be an array',
      });
      return { isValid: false, errors, warnings };
    }

    if (agentSequence.length === 0) {
      errors.push({
        type: 'syntax',
        message: 'Agent sequence cannot be empty',
      });
    }

    // Verifica struttura degli step
    for (let i = 0; i < agentSequence.length; i++) {
      const step = agentSequence[i];
      
      if (!step.agentId) {
        errors.push({
          type: 'syntax',
          message: `Step ${i + 1} is missing agentId`,
        });
      }

      if (step.order === undefined || step.order === null) {
        errors.push({
          type: 'syntax',
          message: `Step ${i + 1} is missing order`,
        });
      }

      if (step.isActive === undefined || step.isActive === null) {
        errors.push({
          type: 'syntax',
          message: `Step ${i + 1} is missing isActive flag`,
        });
      }
    }

    // Verifica ordini unici
    const orders = agentSequence
      .map(step => step.order)
      .filter(order => order !== undefined && order !== null);
    
    const uniqueOrders = new Set(orders);
    
    if (orders.length !== uniqueOrders.size) {
      errors.push({
        type: 'syntax',
        message: 'Agent sequence must have unique order values',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida le condizioni di un workflow step
   */
  static validateConditions(conditions: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!conditions || conditions.trim().length === 0) {
      return { isValid: true, errors, warnings };
    }

    try {
      const parsed = JSON.parse(conditions);
      
      if (!Array.isArray(parsed)) {
        errors.push({
          type: 'syntax',
          message: 'Conditions must be an array',
        });
        return { isValid: false, errors, warnings };
      }

      for (let i = 0; i < parsed.length; i++) {
        const condition = parsed[i];
        
        if (!condition.variable) {
          errors.push({
            type: 'syntax',
            message: `Condition ${i + 1} is missing variable`,
          });
        }

        if (!condition.operator) {
          errors.push({
            type: 'syntax',
            message: `Condition ${i + 1} is missing operator`,
          });
        } else if (!['eq', 'ne', 'gt', 'lt', 'contains'].includes(condition.operator)) {
          errors.push({
            type: 'syntax',
            message: `Condition ${i + 1} has invalid operator: ${condition.operator}`,
          });
        }

        if (condition.value === undefined || condition.value === null) {
          errors.push({
            type: 'syntax',
            message: `Condition ${i + 1} is missing value`,
          });
        }
      }

    } catch (error) {
      errors.push({
        type: 'syntax',
        message: 'Conditions must be valid JSON',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
