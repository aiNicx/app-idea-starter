import { DocumentCategory, Document } from '../types';
import { Language } from '../lib/translations';
import { Agent, Workflow, AgentConfiguration, AgentExecutionContext, WorkflowExecutionContext } from '../types/agents';
import { TemplateEngine } from '../lib/templateEngine';
import { callOpenRouter } from './openRouterService';

export class DynamicAgentService {
  /**
   * Esegue un singolo agente con il contesto fornito
   */
  static async executeAgent(
    agent: Agent, 
    context: AgentExecutionContext
  ): Promise<string> {
    try {
      // Prepara le variabili per il template
      const templateVariables = {
        idea: context.idea,
        frontendDoc: context.variables.frontendDoc || '',
        backendDoc: context.variables.backendDoc || '',
        langInstruction: this.getLanguageInstruction(context.language as Language),
        userName: context.variables.userName || '',
        projectName: context.variables.projectName || '',
        language: context.language as "it" | "en",
        modelId: context.modelId || 'google/gemini-2.0-flash-exp:free',
        temperature: context.variables.temperature || 0.7,
        maxTokens: context.variables.maxTokens || 4000,
        ...context.variables,
      };

      // Renderizza il template con le variabili
      const renderedPrompt = TemplateEngine.renderTemplate(
        agent.promptTemplate, 
        templateVariables
      );

      // Valida il template renderizzato
      const validation = TemplateEngine.validateTemplate(renderedPrompt);
      if (!validation.isValid) {
        console.warn('Template validation warnings:', validation.warnings);
        if (validation.errors.length > 0) {
          throw new Error(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      }

      // Esegui la chiamata a OpenRouter
      const result = await callOpenRouter(
        renderedPrompt, 
        (context.modelId as any) || 'google/gemini-2.0-flash-exp:free'
      );

      return result;

    } catch (error) {
      console.error(`Error executing agent ${agent.name}:`, error);
      throw new Error(`Failed to execute agent ${agent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Esegue un workflow completo
   */
  static async executeWorkflow(
    workflow: Workflow, 
    context: WorkflowExecutionContext
  ): Promise<Document[]> {
    const documents: Document[] = [];
    const previousResults: Record<string, string> = {};

    try {
      console.log(`Starting workflow execution: ${workflow.name}`);

      // Ordina gli agenti per ordine di esecuzione
      const sortedAgents = workflow.agentSequence
        .filter(step => step.isActive)
        .sort((a, b) => a.order - b.order);

      for (const step of sortedAgents) {
        try {
          // Ottieni l'agente
          const agent = await this.getAgentById(step.agentId);
          if (!agent) {
            console.warn(`Agent ${step.agentId} not found, skipping...`);
            continue;
          }

          // Verifica condizioni se presenti
          if (step.conditions) {
            const shouldExecute = this.evaluateConditions(step.conditions, previousResults);
            if (!shouldExecute) {
              console.log(`Skipping agent ${agent.name} due to conditions`);
              continue;
            }
          }

          // Prepara il contesto per l'agente
          const agentContext: AgentExecutionContext = {
            ...context,
            variables: {
              ...context.variables,
              ...previousResults,
            },
          };

          // Esegui l'agente
          console.log(`Executing agent: ${agent.name}`);
          const result = await this.executeAgent(agent, agentContext);

          // Salva il risultato
          previousResults[agent.id] = result;

          // Crea il documento se l'agente produce output documentabile
          if (this.shouldCreateDocument(agent)) {
            const document = this.createDocumentFromResult(agent, result);
            documents.push(document);
          }

          // Aggiungi delay per evitare rate limiting
          await this.delay(2000);

        } catch (error) {
          console.error(`Error in workflow step ${step.agentId}:`, error);
          // Continua con il prossimo agente invece di fermare tutto il workflow
        }
      }

      // Riordina i documenti secondo l'ordine delle categorie
      return this.reorderDocuments(documents);

    } catch (error) {
      console.error(`Error executing workflow ${workflow.name}:`, error);
      throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Valida una configurazione di agente
   */
  static async validateAgentConfiguration(
    agentId: string, 
    config: AgentConfiguration
  ): Promise<boolean> {
    try {
      // Verifica che l'agente esista
      const agent = await this.getAgentById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Valida il template con le variabili di test
      const testVariables = {
        idea: 'Test idea',
        frontendDoc: 'Test frontend doc',
        backendDoc: 'Test backend doc',
        langInstruction: 'Test language instruction',
        userName: 'Test User',
        projectName: 'Test Project',
        language: 'en',
        modelId: config.modelId,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      };

      const testTemplate = config.customPrompt || agent.promptTemplate;
      const validation = TemplateEngine.validateTemplate(testTemplate);
      
      if (!validation.isValid) {
        console.error('Template validation failed:', validation.errors);
        return false;
      }

      // Testa il rendering del template
      const rendered = TemplateEngine.renderTemplate(testTemplate, testVariables);
      if (!rendered || rendered.trim().length === 0) {
        console.error('Template rendered empty result');
        return false;
      }

      return true;

    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Ottiene un agente per ID (placeholder - da implementare con Convex)
   */
  static async getAgentById(agentId: string): Promise<Agent | null> {
    // TODO: Implementare con Convex query
    // Per ora restituisce null, sarà implementato quando si integra con Convex
    console.warn('getAgentById not implemented yet');
    return null;
  }

  /**
   * Valuta le condizioni di esecuzione
   */
  private static evaluateConditions(
    conditions: string, 
    previousResults: Record<string, string>
  ): boolean {
    try {
      const parsedConditions = JSON.parse(conditions);
      
      for (const condition of parsedConditions) {
        const { variable, operator, value } = condition;
        const actualValue = previousResults[variable];
        
        switch (operator) {
          case 'eq':
            if (actualValue !== value) return false;
            break;
          case 'ne':
            if (actualValue === value) return false;
            break;
          case 'gt':
            if (Number(actualValue) <= Number(value)) return false;
            break;
          case 'lt':
            if (Number(actualValue) >= Number(value)) return false;
            break;
          case 'contains':
            if (!actualValue || !actualValue.includes(value)) return false;
            break;
          default:
            console.warn(`Unknown operator: ${operator}`);
            return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Determina se un agente dovrebbe creare un documento
   */
  static shouldCreateDocument(agent: Agent): boolean {
    // Agenti che producono documenti specifici
    const documentProducingAgents = [
      'generateFrontendDoc',
      'generateCssSpec', 
      'generateBackendDoc',
      'generateDbSchema',
    ];
    
    return documentProducingAgents.some(name => agent.name.includes(name));
  }

  /**
   * Crea un documento dal risultato di un agente
   */
  static createDocumentFromResult(agent: Agent, result: string): Document {
    let category: DocumentCategory;
    
    if (agent.name.includes('Frontend')) {
      category = DocumentCategory.FRONTEND;
    } else if (agent.name.includes('CSS') || agent.name.includes('Css')) {
      category = DocumentCategory.CSS;
    } else if (agent.name.includes('Backend')) {
      category = DocumentCategory.BACKEND;
    } else if (agent.name.includes('Db') || agent.name.includes('Schema')) {
      category = DocumentCategory.DB_SCHEMA;
    } else {
      category = DocumentCategory.FRONTEND; // Default
    }

    return {
      id: `doc_${Date.now()}_${category.toLowerCase()}`,
      category,
      content: result,
    };
  }

  /**
   * Riordina i documenti secondo l'ordine delle categorie
   */
  static reorderDocuments(documents: Document[]): Document[] {
    const categoryOrder = [
      DocumentCategory.FRONTEND,
      DocumentCategory.CSS,
      DocumentCategory.BACKEND,
      DocumentCategory.DB_SCHEMA,
    ];

    return documents.sort((a, b) => 
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    );
  }

  /**
   * Ottiene l'istruzione di lingua
   */
  private static getLanguageInstruction(language: Language): string {
    return language === 'it'
      ? "IMPORTANT: Your entire response must be in Italian."
      : "IMPORTANT: Your entire response must be in English.";
  }

  /**
   * Delay helper per evitare rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class WorkflowExecutor {
  /**
   * Esegue un workflow in modo sequenziale
   */
  static async executeSequential(
    workflow: Workflow, 
    context: WorkflowExecutionContext
  ): Promise<Document[]> {
    return DynamicAgentService.executeWorkflow(workflow, context);
  }

  /**
   * Esegue un workflow in modo parallelo (per agenti indipendenti)
   */
  static async executeParallel(
    workflow: Workflow, 
    context: WorkflowExecutionContext
  ): Promise<Document[]> {
    const documents: Document[] = [];
    
    // Raggruppa gli agenti per dipendenze
    const independentAgents = workflow.agentSequence.filter(step => 
      step.isActive && !step.conditions
    );
    
    const dependentAgents = workflow.agentSequence.filter(step => 
      step.isActive && step.conditions
    );

    // Esegui agenti indipendenti in parallelo
    if (independentAgents.length > 0) {
      const parallelPromises = independentAgents.map(async (step) => {
        try {
          const agent = await DynamicAgentService.getAgentById(step.agentId);
          if (!agent) return null;

          const agentContext: AgentExecutionContext = {
            ...context,
            variables: context.variables,
          };

          const result = await DynamicAgentService.executeAgent(agent, agentContext);
          return { agent, result };
        } catch (error) {
          console.error(`Error in parallel execution of agent ${step.agentId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(parallelPromises);
      
      for (const result of results) {
        if (result && DynamicAgentService.shouldCreateDocument(result.agent)) {
          const document = DynamicAgentService.createDocumentFromResult(result.agent, result.result);
          documents.push(document);
        }
      }
    }

    // Esegui agenti dipendenti sequenzialmente
    if (dependentAgents.length > 0) {
      const sequentialWorkflow: Workflow = {
        ...workflow,
        agentSequence: dependentAgents,
      };
      
      const sequentialDocs = await DynamicAgentService.executeWorkflow(sequentialWorkflow, context);
      documents.push(...sequentialDocs);
    }

    return DynamicAgentService.reorderDocuments(documents);
  }

  /**
   * Gestisce i branch condizionali in un workflow
   */
  static async handleConditionalBranches(
    workflow: Workflow, 
    context: WorkflowExecutionContext
  ): Promise<Document[]> {
    // Per ora implementa solo esecuzione sequenziale
    // I branch condizionali saranno implementati in una versione futura
    return DynamicAgentService.executeWorkflow(workflow, context);
  }
}
