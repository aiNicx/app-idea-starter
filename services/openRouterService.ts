import { DocumentCategory, Document } from '../types';
import { Language } from '../lib/translations';
import { ideaEnhancerPrompt, frontendDocPrompt, cssSpecPrompt, backendDocPrompt, dbSchemaPrompt } from '../lib/agentPrompts';

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
async function callOpenRouter(prompt: string, modelId: OpenRouterModelId = DEFAULT_MODEL, retries: number = 3): Promise<string> {
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
