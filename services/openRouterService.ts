import { DocumentCategory, Document } from '../types';
import { Language } from '../lib/translations';
import { ideaEnhancerPrompt, frontendDocPrompt, cssSpecPrompt, backendDocPrompt, dbSchemaPrompt } from '../lib/agentPrompts';
import { Agent, AgentExecutionContext, WorkflowExecutionContext } from '../types/agents';
import { TemplateEngine } from '../lib/templateEngine';

// Configurazione modelli OpenRouter - puoi aggiungere/rimuovere modelli qui
export const OPENROUTER_MODELS = {
  // Modelli gratuiti e popolari
  'google/gemini-2.0-flash-exp:free': 'gemini-2.0-flash-exp (Free)',
  'alibaba/tongyi-deepresearch-30b-a3b:free': 'tongyi-deepresearch-30b-a3b (Free)',

  // Modelli a pagamento (più potenti)

} as const;

export type OpenRouterModelId = keyof typeof OPENROUTER_MODELS;

// Configurazione di default
export const DEFAULT_MODEL: OpenRouterModelId = 'google/gemini-2.0-flash-exp:free';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

// Helper per ottenere il modello di default
export const getDefaultModel = (): OpenRouterModelId => DEFAULT_MODEL;

// Tipi per le risposte di OpenRouter
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface OpenRouterError {
  error: {
    message: string;
  };
}

// Helper per le istruzioni di lingua
const getLanguageInstruction = (language: Language) => {
  return language === 'it'
    ? "IMPORTANT: Your entire response must be in Italian."
    : "IMPORTANT: Your entire response must be in English.";
};

// Funzione principale per chiamare OpenRouter con retry logic
export async function callOpenRouter(prompt: string, modelId: OpenRouterModelId = DEFAULT_MODEL, retries: number = 3): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please set OPENROUTER_API_KEY in your .env.local file.');
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'DocuGenius AI'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        // Se è un errore 429 (rate limit), aspetta e riprova
        if (response.status === 429 && attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 3000; // Exponential backoff: 3s, 6s, 12s
          console.log(`Rate limit hit, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${retries}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        const errorData: OpenRouterError = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error.message}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      // Se è l'ultimo tentativo, lancia l'errore
      if (attempt === retries - 1) {
        console.error('Error calling OpenRouter API:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to generate content. Please check your API key and connection.');
      }
      // Altrimenti aspetta e riprova
      const waitTime = Math.pow(2, attempt) * 2000;
      console.log(`Error occurred, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${retries}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retries reached');
}

// --- Agent Functions (adattati per OpenRouter) ---

/**
 * Agent to enhance and mature a given app idea.
 */
export const ideaEnhancerAgent = async (idea: string, language: Language, modelId?: OpenRouterModelId): Promise<string> => {
  const prompt = ideaEnhancerPrompt({ idea, langInstruction: getLanguageInstruction(language) });

  try {
    return await callOpenRouter(prompt, modelId);
  } catch (error) {
    console.error("Error in ideaEnhancerAgent:", error);
    throw new Error("Failed to enhance idea. Please check your API key and connection.");
  }
};

/**
 * Orchestrator agent to generate all required documentation for an app idea.
 */
export const documentationGeneratorAgent = async (idea: string, language: Language, modelId?: OpenRouterModelId): Promise<Document[]> => {
  const documents: Document[] = [];

  try {
    console.log("Starting documentation generation...");

    // Helper function to add delay between requests
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 1. Generate Frontend Document first
    const frontendDoc = await generateFrontendDoc(idea, language, modelId);
    documents.push(frontendDoc);
    console.log("Frontend Doc generated.");

    // Wait 2 seconds to avoid rate limiting
    await delay(2000);

    // 2. Generate CSS Spec
    try {
      const cssDoc = await generateCssSpec(idea, language, frontendDoc.content, modelId);
      documents.push(cssDoc);
      console.log("CSS Spec generated.");
    } catch (e) {
      console.error("CSS Spec generation failed:", e);
    }

    // Wait 2 seconds to avoid rate limiting
    await delay(2000);

    // 3. Generate Backend Doc
    let backendDoc;
    try {
      backendDoc = await generateBackendDoc(idea, language, frontendDoc.content, modelId);
      documents.push(backendDoc);
      console.log("Backend Doc generated.");
    } catch (e) {
      console.error("Backend Doc generation failed:", e);
    }

    // Wait 2 seconds to avoid rate limiting
    await delay(2000);

    // 4. Generate DB Schema (only if backend was generated)
    if (backendDoc) {
      try {
        const dbSchemaDoc = await generateDbSchema(idea, language, frontendDoc.content, backendDoc.content, modelId);
        documents.push(dbSchemaDoc);
        console.log("DB Schema generated.");
      } catch (e) {
        console.error("DB Schema generation failed:", e);
      }
    }

    // Reorder documents
    const categoryOrder = [
        DocumentCategory.FRONTEND,
        DocumentCategory.CSS,
        DocumentCategory.BACKEND,
        DocumentCategory.DB_SCHEMA,
    ];

    return documents.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  } catch (error) {
      console.error("An error occurred during the documentation generation workflow:", error);
      return documents;
  }
};

// --- Sub-Agents for Specific Documents ---

const generateFrontendDoc = async (idea: string, language: Language, modelId?: OpenRouterModelId): Promise<Document> => {
  const prompt = frontendDocPrompt({ idea, langInstruction: getLanguageInstruction(language) });
  const content = await callOpenRouter(prompt, modelId);
  return { id: `doc_${Date.now()}_fe`, category: DocumentCategory.FRONTEND, content };
};

const generateCssSpec = async (idea: string, language: Language, frontendDoc: string, modelId?: OpenRouterModelId): Promise<Document> => {
  const prompt = cssSpecPrompt({ idea, langInstruction: getLanguageInstruction(language), frontendDoc });
  const content = await callOpenRouter(prompt, modelId);
  return { id: `doc_${Date.now()}_css`, category: DocumentCategory.CSS, content };
};

const generateBackendDoc = async (idea: string, language: Language, frontendDoc: string, modelId?: OpenRouterModelId): Promise<Document> => {
  const prompt = backendDocPrompt({ idea, langInstruction: getLanguageInstruction(language), frontendDoc });
  const content = await callOpenRouter(prompt, modelId);
  return { id: `doc_${Date.now()}_be`, category: DocumentCategory.BACKEND, content };
};

const generateDbSchema = async (idea: string, language: Language, frontendDoc: string, backendDoc: string, modelId?: OpenRouterModelId): Promise<Document> => {
  const prompt = dbSchemaPrompt({ idea, langInstruction: getLanguageInstruction(language), frontendDoc, backendDoc });
  let content = await callOpenRouter(prompt, modelId);

  // Pulisce la risposta da eventuali code blocks aggiunti dal modello
  const codeBlockMatch = content.match(/```typescript\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
      const explanation = content.substring(0, codeBlockMatch.index).trim();
      const code = codeBlockMatch[1].trim();
      content = `${explanation}\n\n\`\`\`typescript\n${code}\n\`\`\``;
  }

  return { id: `doc_${Date.now()}_db`, category: DocumentCategory.DB_SCHEMA, content };
};

// === FUNZIONI PER AGENTI DINAMICI ===

/**
 * Esegue un agente dinamico con il contesto fornito
 */
export const executeDynamicAgent = async (
  agent: Agent, 
  context: AgentExecutionContext
): Promise<string> => {
  try {
    // Prepara le variabili per il template
    const templateVariables = {
      idea: context.idea,
      frontendDoc: context.variables.frontendDoc || '',
      backendDoc: context.variables.backendDoc || '',
      langInstruction: getLanguageInstruction(context.language as Language),
      userName: context.variables.userName || '',
      projectName: context.variables.projectName || '',
      language: context.language,
      modelId: context.modelId || DEFAULT_MODEL,
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
      (context.modelId as OpenRouterModelId) || DEFAULT_MODEL
    );

    return result;

  } catch (error) {
    console.error(`Error executing dynamic agent ${agent.name}:`, error);
    throw new Error(`Failed to execute agent ${agent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Esegue un workflow completo con agenti dinamici
 */
export const executeWorkflow = async (
  workflow: any, // Workflow type from database
  context: WorkflowExecutionContext
): Promise<Document[]> => {
  const documents: Document[] = [];
  const previousResults: Record<string, string> = {};

  try {
    console.log(`Starting workflow execution: ${workflow.name}`);

    // Ordina gli agenti per ordine di esecuzione
    const sortedAgents = workflow.agentSequence
      .filter((step: any) => step.isActive)
      .sort((a: any, b: any) => a.order - b.order);

    for (const step of sortedAgents) {
      try {
        // TODO: Ottieni l'agente dal database
        // const agent = await getAgentById(step.agentId);
        // if (!agent) {
        //   console.warn(`Agent ${step.agentId} not found, skipping...`);
        //   continue;
        // }

        // Per ora usa un agente mock
        const agent: Agent = {
          id: step.agentId,
          userId: 'system' as any,
          name: `Agent ${step.agentId}`,
          description: 'Mock agent',
          persona: 'Mock persona',
          icon: 'WandIcon',
          promptTemplate: 'Mock template: {{idea}}',
          isActive: true,
          isSystem: true,
          order: step.order,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Verifica condizioni se presenti
        if (step.conditions) {
          const shouldExecute = evaluateConditions(step.conditions, previousResults);
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
        const result = await executeDynamicAgent(agent, agentContext);

        // Salva il risultato
        previousResults[agent.id] = result;

        // Crea il documento se l'agente produce output documentabile
        if (shouldCreateDocument(agent)) {
          const document = createDocumentFromResult(agent, result);
          documents.push(document);
        }

        // Aggiungi delay per evitare rate limiting
        await delay(2000);

      } catch (error) {
        console.error(`Error in workflow step ${step.agentId}:`, error);
        // Continua con il prossimo agente invece di fermare tutto il workflow
      }
    }

    // Riordina i documenti secondo l'ordine delle categorie
    return reorderDocuments(documents);

  } catch (error) {
    console.error(`Error executing workflow ${workflow.name}:`, error);
    throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// === HELPER FUNCTIONS ===

/**
 * Valuta le condizioni di esecuzione
 */
function evaluateConditions(
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
function shouldCreateDocument(agent: Agent): boolean {
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
function createDocumentFromResult(agent: Agent, result: string): Document {
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
function reorderDocuments(documents: Document[]): Document[] {
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
 * Delay helper per evitare rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
