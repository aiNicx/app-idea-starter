import { DocumentCategory, Document } from '../types';
import { Language } from '../lib/translations';
import { Agent, Workflow, AgentConfiguration, AgentExecutionContext, WorkflowExecutionContext } from '../types/agents';
import { TemplateEngine } from '../lib/templateEngine';
import { callOpenRouter } from './openRouterService';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

export class DynamicAgentService {
  private static convexClient: ConvexHttpClient | null = null;

  /**
   * Inizializza il client Convex
   */
  static initializeConvex(convexUrl: string) {
    this.convexClient = new ConvexHttpClient(convexUrl);
  }

  /**
   * Ottiene il client Convex
   */
  private static getConvexClient(): ConvexHttpClient {
    if (!this.convexClient) {
      throw new Error('Convex client not initialized. Call initializeConvex() first.');
    }
    return this.convexClient;
  }

  /**
   * Esegue un singolo agente con il contesto fornito
   */
  static async executeAgent(
    agent: Agent, 
    context: AgentExecutionContext
  ): Promise<string> {
    try {
      // Ottieni la configurazione attiva per l'agente
      const configuration = await this.getActiveConfigurationForAgent(agent.id, context.userId);
      
      // Usa la configurazione se disponibile, altrimenti usa i valori di default
      const modelId = configuration?.modelId || context.modelId || 'google/gemini-2.0-flash-exp:free';
      const temperature = configuration?.temperature || context.variables.temperature || 0.7;
      const maxTokens = configuration?.maxTokens || context.variables.maxTokens || 4000;
      const customPrompt = configuration?.customPrompt || agent.promptTemplate;

      // Prepara le variabili per il template
      const templateVariables = {
        idea: context.idea,
        frontendDoc: context.variables.frontendDoc || '',
        backendDoc: context.variables.backendDoc || '',
        langInstruction: this.getLanguageInstruction(context.language as Language),
        userName: context.variables.userName || '',
        projectName: context.variables.projectName || '',
        language: context.language as "it" | "en",
        modelId,
        temperature,
        maxTokens,
        ...context.variables,
      };

      // Renderizza il template con le variabili
      const renderedPrompt = TemplateEngine.renderTemplate(
        customPrompt, 
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
        modelId as any
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
            userId: workflow.userId, // Usa l'userId del workflow
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
    agentId: Id<"agents">, 
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
   * Ottiene un agente per ID
   */
  static async getAgentById(agentId: Id<"agents">): Promise<Agent | null> {
    try {
      const client = this.getConvexClient();
      const agent = await client.query(api.agents.getAgentById, { agentId });
      
      if (!agent) {
        return null;
      }

      // Converte il documento Convex in un oggetto Agent
      return {
        id: agent._id,
        userId: agent.userId,
        name: agent.name,
        description: agent.description,
        persona: agent.persona,
        icon: agent.icon,
        promptTemplate: agent.promptTemplate,
        isActive: agent.isActive,
        isSystem: agent.isSystem,
        order: agent.order,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  /**
   * Ottiene un workflow per ID
   */
  static async getWorkflowById(workflowId: Id<"workflows">): Promise<Workflow | null> {
    try {
      const client = this.getConvexClient();
      const workflow = await client.query(api.workflows.getWorkflowWithAgents, { workflowId });
      
      if (!workflow) {
        return null;
      }

      // Converte il documento Convex in un oggetto Workflow
      return {
        id: workflow._id,
        userId: workflow.userId,
        name: workflow.name,
        description: workflow.description,
        agentSequence: workflow.agentSequence.map(step => ({
          agentId: step.agentId,
          order: step.order,
          isActive: step.isActive,
          conditions: step.conditions,
        })),
        isActive: workflow.isActive,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  /**
   * Ottiene la configurazione attiva per un agente
   */
  static async getActiveConfigurationForAgent(agentId: Id<"agents">, userId: Id<"users">): Promise<AgentConfiguration | null> {
    try {
      const client = this.getConvexClient();
      const config = await client.query(api.agentConfigurations.getActiveConfigurationForAgent, { 
        agentId, 
        userId 
      });
      
      if (!config) {
        return null;
      }

      // Converte il documento Convex in un oggetto AgentConfiguration
      return {
        id: config._id,
        userId: config.userId,
        agentId: config.agentId,
        customPrompt: config.customPrompt,
        modelId: config.modelId,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        isActive: config.isActive,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching configuration:', error);
      return null;
    }
  }

  /**
   * Ottiene tutti gli agenti di sistema
   */
  static async getSystemAgents(): Promise<Agent[]> {
    try {
      const client = this.getConvexClient();
      const agents = await client.query(api.agents.getSystemAgents);
      
      return agents.map(agent => ({
        id: agent._id,
        userId: agent.userId,
        name: agent.name,
        description: agent.description,
        persona: agent.persona,
        icon: agent.icon,
        promptTemplate: agent.promptTemplate,
        isActive: agent.isActive,
        isSystem: agent.isSystem,
        order: agent.order,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching system agents:', error);
      return [];
    }
  }

  /**
   * Ottiene il workflow predefinito (primo workflow di sistema)
   */
  static async getDefaultWorkflow(): Promise<Workflow | null> {
    try {
      const client = this.getConvexClient();
      
      // Ottieni prima gli agenti di sistema per ottenere l'userId di sistema
      const systemAgents = await client.query(api.agents.getSystemAgents);
      if (systemAgents.length === 0) {
        return null;
      }
      
      const systemUserId = systemAgents[0].userId;
      
      // Ottieni tutti i workflow di sistema
      const systemWorkflows = await client.query(api.workflows.getWorkflowsByUser, {
        userId: systemUserId
      });
      
      if (systemWorkflows.length === 0) {
        return null;
      }

      // Restituisci il primo workflow di sistema
      const workflow = systemWorkflows[0];
      return {
        id: workflow._id,
        userId: workflow.userId,
        name: workflow.name,
        description: workflow.description,
        agentSequence: workflow.agentSequence.map(step => ({
          agentId: step.agentId,
          order: step.order,
          isActive: step.isActive,
          conditions: step.conditions,
        })),
        isActive: workflow.isActive,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching default workflow:', error);
      return null;
    }
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
            userId: workflow.userId, // Usa l'userId del workflow
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
