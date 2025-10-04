import { TemplateVariable, TemplateCondition, ParsedTemplate, ValidationResult, ValidationError, ValidationWarning } from '../types/agents';

export class TemplateEngine {
  private static readonly VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;
  private static readonly CONDITION_REGEX = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  private static readonly UNLESS_REGEX = /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
  private static readonly EACH_REGEX = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  /**
   * Estrae tutte le variabili da un template
   */
  static extractVariables(template: string): TemplateVariable[] {
    const variables: TemplateVariable[] = [];
    const variableNames = new Set<string>();
    
    let match;
    while ((match = this.VARIABLE_REGEX.exec(template)) !== null) {
      const variableName = match[1].trim();
      
      if (!variableNames.has(variableName)) {
        variableNames.add(variableName);
        
        // Determina il tipo di variabile basato sul nome
        let type: 'string' | 'number' | 'boolean' | 'object' = 'string';
        if (variableName.includes('Count') || variableName.includes('Number')) {
          type = 'number';
        } else if (variableName.startsWith('is') || variableName.startsWith('has')) {
          type = 'boolean';
        } else if (variableName.includes('Doc') || variableName.includes('Data')) {
          type = 'object';
        }

        variables.push({
          name: variableName,
          type,
          required: true,
        });
      }
    }

    return variables;
  }

  /**
   * Estrae tutte le condizioni da un template
   */
  static extractConditions(template: string): TemplateCondition[] {
    const conditions: TemplateCondition[] = [];
    
    // Estrai condizioni #if
    let match;
    while ((match = this.CONDITION_REGEX.exec(template)) !== null) {
      const variable = match[1].trim();
      const content = match[2];
      
      conditions.push({
        variable,
        operator: 'eq',
        value: true,
        then: content,
      });
    }

    // Estrai condizioni #unless
    while ((match = this.UNLESS_REGEX.exec(template)) !== null) {
      const variable = match[1].trim();
      const content = match[2];
      
      conditions.push({
        variable,
        operator: 'eq',
        value: false,
        then: content,
      });
    }

    return conditions;
  }

  /**
   * Parsa un template e restituisce la struttura analizzata
   */
  static parseTemplate(template: string): ParsedTemplate {
    return {
      variables: this.extractVariables(template),
      conditions: this.extractConditions(template),
      rawTemplate: template,
    };
  }

  /**
   * Valida un template
   */
  static validateTemplate(template: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Reset regex lastIndex
    this.VARIABLE_REGEX.lastIndex = 0;
    this.CONDITION_REGEX.lastIndex = 0;
    this.UNLESS_REGEX.lastIndex = 0;
    this.EACH_REGEX.lastIndex = 0;

    // Verifica sintassi base
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push({
        type: 'syntax',
        message: 'Mismatched braces in template',
      });
    }

    // Verifica condizioni non chiuse
    const ifMatches = template.match(/\{\{#if/g) || [];
    const ifEndMatches = template.match(/\{\{\/if\}\}/g) || [];
    
    if (ifMatches.length !== ifEndMatches.length) {
      errors.push({
        type: 'syntax',
        message: 'Unclosed #if conditions found',
      });
    }

    const unlessMatches = template.match(/\{\{#unless/g) || [];
    const unlessEndMatches = template.match(/\{\{\/unless\}\}/g) || [];
    
    if (unlessMatches.length !== unlessEndMatches.length) {
      errors.push({
        type: 'syntax',
        message: 'Unclosed #unless conditions found',
      });
    }

    // Verifica variabili con caratteri non validi
    let match;
    while ((match = this.VARIABLE_REGEX.exec(template)) !== null) {
      const variableName = match[1].trim();
      
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName)) {
        errors.push({
          type: 'syntax',
          message: `Invalid variable name: ${variableName}`,
        });
      }
    }

    // Warning per template molto lunghi
    if (template.length > 5000) {
      warnings.push({
        type: 'performance',
        message: 'Template is very long, consider breaking it into smaller parts',
        suggestion: 'Split the template into multiple smaller templates',
      });
    }

    // Warning per troppe condizioni
    const conditionCount = ifMatches.length + unlessMatches.length;
    if (conditionCount > 10) {
      warnings.push({
        type: 'best_practice',
        message: 'Template has many conditions, consider simplifying',
        suggestion: 'Use separate templates for different scenarios',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Renderizza un template con le variabili fornite
   */
  static renderTemplate(template: string, variables: Record<string, any>): string {
    let result = template;

    // Reset regex lastIndex
    this.VARIABLE_REGEX.lastIndex = 0;
    this.CONDITION_REGEX.lastIndex = 0;
    this.UNLESS_REGEX.lastIndex = 0;
    this.EACH_REGEX.lastIndex = 0;

    // Sostituisci variabili semplici
    result = result.replace(this.VARIABLE_REGEX, (match, variableName) => {
      const trimmedName = variableName.trim();
      const value = variables[trimmedName];
      
      if (value === undefined || value === null) {
        console.warn(`Variable ${trimmedName} not found in context`);
        return '';
      }
      
      return String(value);
    });

    // Gestisci condizioni #if
    result = result.replace(this.CONDITION_REGEX, (match, condition, content) => {
      const trimmedCondition = condition.trim();
      const value = variables[trimmedCondition];
      
      if (this.evaluateCondition(value, 'eq', true)) {
        return this.renderTemplate(content, variables);
      }
      
      return '';
    });

    // Gestisci condizioni #unless
    result = result.replace(this.UNLESS_REGEX, (match, condition, content) => {
      const trimmedCondition = condition.trim();
      const value = variables[trimmedCondition];
      
      if (!this.evaluateCondition(value, 'eq', true)) {
        return this.renderTemplate(content, variables);
      }
      
      return '';
    });

    // Gestisci loop #each
    result = result.replace(this.EACH_REGEX, (match, arrayName, content) => {
      const trimmedName = arrayName.trim();
      const array = variables[trimmedName];
      
      if (!Array.isArray(array)) {
        console.warn(`Variable ${trimmedName} is not an array`);
        return '';
      }
      
      return array.map((item, index) => {
        const itemVariables = {
          ...variables,
          [trimmedName]: item,
          index,
          first: index === 0,
          last: index === array.length - 1,
        };
        return this.renderTemplate(content, itemVariables);
      }).join('');
    });

    return result;
  }

  /**
   * Valida le variabili richieste sono presenti
   */
  static validateVariables(template: string, availableVariables: string[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const requiredVariables = this.extractVariables(template)
      .filter(v => v.required)
      .map(v => v.name);

    const missingVariables = requiredVariables.filter(v => !availableVariables.includes(v));
    
    if (missingVariables.length > 0) {
      errors.push({
        type: 'variable',
        message: `Missing required variables: ${missingVariables.join(', ')}`,
      });
    }

    const unusedVariables = availableVariables.filter(v => !template.includes(`{{${v}}}`));
    
    if (unusedVariables.length > 0) {
      warnings.push({
        type: 'best_practice',
        message: `Unused variables provided: ${unusedVariables.join(', ')}`,
        suggestion: 'Remove unused variables to improve performance',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida la logica del template
   */
  static validateLogic(template: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verifica condizioni circolari o problematiche
    const conditions = this.extractConditions(template);
    
    // Verifica se ci sono condizioni che si escludono a vicenda
    const conditionGroups = new Map<string, TemplateCondition[]>();
    
    conditions.forEach(condition => {
      if (!conditionGroups.has(condition.variable)) {
        conditionGroups.set(condition.variable, []);
      }
      conditionGroups.get(condition.variable)!.push(condition);
    });

    conditionGroups.forEach((group, variable) => {
      if (group.length > 1) {
        warnings.push({
          type: 'best_practice',
          message: `Multiple conditions for variable ${variable}`,
          suggestion: 'Consider consolidating conditions for better readability',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valuta una condizione
   */
  private static evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'eq':
        return value === expectedValue;
      case 'ne':
        return value !== expectedValue;
      case 'gt':
        return Number(value) > Number(expectedValue);
      case 'lt':
        return Number(value) < Number(expectedValue);
      case 'contains':
        return String(value).includes(String(expectedValue));
      default:
        return false;
    }
  }

  /**
   * Ottiene le variabili disponibili per il sistema
   */
  static getAvailableVariables(): string[] {
    return [
      'idea',
      'frontendDoc',
      'backendDoc',
      'langInstruction',
      'userName',
      'projectName',
      'language',
      'modelId',
      'temperature',
      'maxTokens',
    ];
  }

  /**
   * Crea un template di esempio
   */
  static createExampleTemplate(): string {
    return `You are a {{persona}} agent. Your task is to {{description}}.

{{#if frontendDoc}}
Based on the frontend specification:
{{frontendDoc}}
{{/if}}

{{#if backendDoc}}
And the backend architecture:
{{backendDoc}}
{{/if}}

Please generate the following for the app idea: "{{idea}}"

{{langInstruction}}`;
  }
}
