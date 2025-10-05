// Configurazione modelli OpenRouter - puoi aggiungere/rimuovere modelli qui
export const OPENROUTER_MODELS = {
  // Modelli gratuiti e popolari
  'google/gemini-2.0-flash-exp:free': 'gemini-2.0-flash-exp (Free)',
  'alibaba/tongyi-deepresearch-30b-a3b:free': 'tongyi-deepresearch-30b-a3b (Free)',

  // Modelli a pagamento (più potenti)

} as const;

export type OpenRouterModelId = keyof typeof OPENROUTER_MODELS;

// Configurazione di default
export const DEFAULT_MODEL: OpenRouterModelId = 'alibaba/tongyi-deepresearch-30b-a3b:free';
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
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Gestione errori specifici
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData: OpenRouterError = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Se è un errore 429 anche all'ultimo tentativo, dai un messaggio più informativo
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Please wait a few minutes before trying again. OpenRouter allows limited requests per minute. If this persists, check that your API key is configured correctly.`);
        }

        throw new Error(`OpenRouter API error: ${errorMessage}`);
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
