import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DocumentCategory, Document } from '../types';
import { Language } from '../lib/translations';
import { ideaEnhancerPrompt, frontendDocPrompt, cssSpecPrompt, backendDocPrompt, dbSchemaPrompt } from '../lib/agentPrompts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

// --- Helper for Language Instruction ---
const getLanguageInstruction = (language: Language) => {
  return language === 'it'
    ? "IMPORTANT: Your entire response must be in Italian."
    : "IMPORTANT: Your entire response must be in English.";
};


// --- Agent Functions ---

/**
 * Agent to enhance and mature a given app idea.
 * @param idea - The initial idea string.
 * @param language - The output language.
 * @returns The enhanced idea string.
 */
export const ideaEnhancerAgent = async (idea: string, language: Language): Promise<string> => {
  const prompt = ideaEnhancerPrompt({ idea, langInstruction: getLanguageInstruction(language) });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in ideaEnhancerAgent:", error);
    throw new Error("Failed to enhance idea. Please check your API key and connection.");
  }
};

/**
 * Orchestrator agent to generate all required documentation for an app idea.
 * It now runs the sub-agents sequentially to ensure document coherence.
 * @param idea - The final, mature app idea.
 * @param language - The output language.
 * @returns An array of generated documents.
 */
export const documentationGeneratorAgent = async (idea: string, language: Language): Promise<Document[]> => {
  const documents: Document[] = [];
  
  try {
    console.log("Starting documentation generation...");

    // 1. Generate Frontend Document first, as it's a key input for others.
    const frontendDoc = await generateFrontendDoc(idea, language);
    documents.push(frontendDoc);
    console.log("Frontend Doc generated.");

    // 2. Generate CSS and Backend in parallel, as they both depend on the Frontend doc.
    const cssPromise = generateCssSpec(idea, language, frontendDoc.content);
    const backendPromise = generateBackendDoc(idea, language, frontendDoc.content);

    const [cssResult, backendResult] = await Promise.allSettled([cssPromise, backendPromise]);

    if (cssResult.status === 'fulfilled') {
      documents.push(cssResult.value);
      console.log("CSS Spec generated.");
    } else {
      console.error("CSS Spec generation failed:", cssResult.reason);
    }

    if (backendResult.status === 'fulfilled') {
      const backendDoc = backendResult.value;
      documents.push(backendDoc);
      console.log("Backend Doc generated.");

      // 4. Generate DB Schema, which depends on both Frontend and Backend docs.
      try {
        const dbSchemaDoc = await generateDbSchema(idea, language, frontendDoc.content, backendDoc.content);
        documents.push(dbSchemaDoc);
        console.log("DB Schema generated.");
      } catch (e) {
        console.error("DB Schema generation failed:", e);
      }

    } else {
       console.error("Backend Doc generation failed:", backendResult.reason);
    }
    
    // Reorder documents to a logical order
    const categoryOrder = [
        DocumentCategory.FRONTEND,
        DocumentCategory.CSS,
        DocumentCategory.BACKEND,
        DocumentCategory.DB_SCHEMA,
    ];
    
    return documents.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  } catch (error) {
      console.error("An error occurred during the documentation generation workflow:", error);
      // Return successfully generated documents even if one step fails
      return documents;
  }
};


// --- Sub-Agents for Specific Documents ---

const generateFrontendDoc = async (idea: string, language: Language): Promise<Document> => {
  const prompt = frontendDocPrompt({ idea, langInstruction: getLanguageInstruction(language) });
  const content = await callGemini(prompt);
  return { id: `doc_${Date.now()}_fe`, category: DocumentCategory.FRONTEND, content };
};

const generateCssSpec = async (idea: string, language: Language, frontendDoc: string): Promise<Document> => {
  const prompt = cssSpecPrompt({ idea, langInstruction: getLanguageInstruction(language), frontendDoc });
  const content = await callGemini(prompt);
  return { id: `doc_${Date.now()}_css`, category: DocumentCategory.CSS, content };
};

const generateBackendDoc = async (idea: string, language: Language, frontendDoc: string): Promise<Document> => {
  const prompt = backendDocPrompt({ idea, langInstruction: getLanguageInstruction(language), frontendDoc });
  const content = await callGemini(prompt);
  return { id: `doc_${Date.now()}_be`, category: DocumentCategory.BACKEND, content };
};

const generateDbSchema = async (idea: string, language: Language, frontendDoc: string, backendDoc: string): Promise<Document> => {
  const prompt = dbSchemaPrompt({ idea, langInstruction: getLanguageInstruction(language), frontendDoc, backendDoc });
  let content = await callGemini(prompt);
  // Gemini might add backticks and 'typescript' annotation, clean it up from the full response.
  const codeBlockMatch = content.match(/```typescript\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
      const explanation = content.substring(0, codeBlockMatch.index).trim();
      const code = codeBlockMatch[1].trim();
      content = `${explanation}\n\n\`\`\`typescript\n${code}\n\`\`\``;
  }
  return { id: `doc_${Date.now()}_db`, category: DocumentCategory.DB_SCHEMA, content };
};

// --- Helper Function ---
const callGemini = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `Error: Failed to generate content. Details: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}