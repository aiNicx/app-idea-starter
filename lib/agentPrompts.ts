import React from 'react';
import {
    CodeBracketIcon,
    PaintBrushIcon,
    ServerIcon,
    CircleStackIcon,
    WandIcon,
    BrainCircuitIcon,
    SparklesIcon // Added for concept indicator
} from '../components/icons';
import { Language, translations } from './translations';

export type PromptArgs = {
    idea: string;
    langInstruction: string;
    frontendDoc?: string;
    backendDoc?: string;
};

export interface AgentProfile {
    id: string;
    name: string;
    persona: (t: typeof translations[Language]) => string;
    description: (t: typeof translations[Language]) => string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    getPrompt: (args: PromptArgs) => string;
}

export const ideaEnhancerPrompt = (args: PromptArgs) => `You are an expert product manager and software architect. Your task is to enhance a user's app idea.
Take the following idea and elaborate on it. Focus on:
1.  **Core Value Proposition:** Clearly state the main problem it solves.
2.  **Target Audience:** Define who the primary users are.
3.  **Key Features:** List 3-5 essential features with a brief description.
4.  **Monetization (Optional):** Suggest a potential business model if applicable.

Keep the output structured, clear, and ready to be used for documentation generation. Return only the enhanced idea text.

${args.langInstruction}

**Original Idea:**
"${args.idea}"`;

export const frontendDocPrompt = (args: PromptArgs) => `You are a senior frontend developer. Based on the app idea below, generate a descriptive frontend specification in Markdown. DO NOT mention specific technologies (like React, Vue, etc.).

The description must include these sections:
1.  **General Overview:** A brief, high-level summary of the frontend's purpose.
2.  **Pages & Content:** A list of the main pages (e.g., Home, Dashboard, Profile). For each page, describe its purpose and the key information or components it should contain. Be descriptive.
3.  **Core User Flows:** Describe the step-by-step process for 2-3 primary user interactions (e.g., "User Registration", "Creating a New Post").

The output must be concise and focused on WHAT the frontend does, not HOW it's built.

${args.langInstruction}

**App Idea:**
"${args.idea}"`;

export const cssSpecPrompt = (args: PromptArgs) => `You are a senior UI/UX designer. Based on the app idea and the frontend structure provided below, generate a concise and schematic style guide in Markdown. Be direct and avoid verbose explanations.

The specification must include:
1.  **Color Palette:** Define Primary, Secondary, Accent, Background, and Text colors. Provide names and HEX codes.
2.  **Typography:** Suggest a font family for Headings and Body text (from Google Fonts). Specify font sizes (rem) and weights for h1, h2, p, and small text.
3.  **UI Element Guidelines:** Provide brief styling notes for Buttons (primary, secondary), Input Fields, and Cards.

${args.langInstruction}

**App Idea:**
"${args.idea}"

---
**Frontend Structure Context:**
"${args.frontendDoc}"`;

export const backendDocPrompt = (args: PromptArgs) => `You are a senior backend architect. Based on the app idea and the user flows from the frontend specification below, create a short and schematic backend architecture outline in Markdown. Focus on the core logic and needs. Avoid verbose explanations.

The outline must include:
1.  **Core Logic Summary:** A brief, high-level description of the backend's main responsibilities.
2.  **Key API Endpoints:** List the main endpoints needed to support the frontend. For each, specify the HTTP method, path (e.g., POST /api/posts), and a very brief purpose. DO NOT include example payloads.
3.  **External Services:** List potential third-party services needed (e.g., Authentication, Payments, Email).

${args.langInstruction}

**App Idea:**
"${args.idea}"

---
**Frontend User Flows Context:**
"${args.frontendDoc}"`;

export const dbSchemaPrompt = (args: PromptArgs) => `You are a senior database administrator. Based on the application's logic described in the documents below, first provide a brief, high-level explanation of the data model and the relationships between tables.

After the explanation, generate a database schema using Convex schema syntax.

The output must be:
1. A short paragraph in Markdown explaining the data model.
2. A single Markdown code block containing the complete TypeScript code for the Convex schema. Import \`defineSchema\` and \`defineTable\` and use Convex validators (\`v.string()\`, \`v.id()\`, etc.). Define all tables and relationships with indexes.

${args.langInstruction}
(Note: The code itself must be TypeScript, but the initial explanation paragraph must be in the requested language).

**App Idea:**
"${args.idea}"

---
**Frontend Content Context:**
"${args.frontendDoc}"

---
**Backend API Context:**
"${args.backendDoc}"`;

export const agentProfiles: AgentProfile[] = [
    {
        id: 'idea-enhancer',
        name: 'ideaEnhancerAgent',
        persona: t => t.productManager,
        description: t => "Takes a raw user idea and transforms it into a structured, mature concept ready for development.",
        icon: WandIcon,
        getPrompt: (args) => ideaEnhancerPrompt(args),
    },
    {
        id: 'doc-orchestrator',
        name: 'documentationGeneratorAgent',
        persona: t => t.orchestrator,
        description: t => "Acts as the project lead, taking the mature idea and delegating document creation to a team of specialized sub-agents.",
        icon: BrainCircuitIcon,
        getPrompt: () => "This agent doesn't have a direct prompt. It orchestrates calls to sub-agents based on the matured idea.",
    },
    {
        id: 'frontend-doc',
        name: 'generateFrontendDoc',
        persona: t => t.frontendDev,
        description: t => "Generates a detailed frontend specification, including pages, components, and user flows.",
        icon: CodeBracketIcon,
        getPrompt: (args) => frontendDocPrompt(args),
    },
    {
        id: 'css-spec',
        name: 'generateCssSpec',
        persona: t => t.uiUxDesigner,
        description: t => "Creates a visual style guide, defining the color palette, typography, and component styles, based on frontend specs.",
        icon: PaintBrushIcon,
        getPrompt: (args) => cssSpecPrompt(args),
    },
    {
        id: 'backend-doc',
        name: 'generateBackendDoc',
        persona: t => t.backendArchitect,
        description: t => "Designs the backend architecture, defining API endpoints and suggesting a suitable tech stack, based on frontend specs.",
        icon: ServerIcon,
        getPrompt: (args) => backendDocPrompt(args),
    },
    {
        id: 'db-schema',
        name: 'generateDbSchema',
        persona: t => t.dbAdmin,
        description: t => "Produces a structured database schema using Convex syntax, aligned with frontend and backend needs.",
        icon: CircleStackIcon,
        getPrompt: (args) => dbSchemaPrompt(args),
    },
];