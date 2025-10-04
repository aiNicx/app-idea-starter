# Piano Dettagliato - Fase 1: Database e Backend
## Sistema di Agenti Modulare - Implementazione Fase 1

### Obiettivo
Implementare la base dati e il backend per il sistema modulare di agenti, estendendo l'architettura attuale con tabelle per agenti personalizzati, workflow e configurazioni.

---

## Task 1: Estensione Schema Database Convex

### 1.1 Creazione Tabelle Nuove
**File:** `convex/schema.ts`

#### Task 1.1.1: Tabella `agents`
```typescript
agents: defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.string(),
  persona: v.string(),
  icon: v.string(), // Nome dell'icona (es. "WandIcon")
  promptTemplate: v.string(),
  isActive: v.boolean(),
  isSystem: v.boolean(), // true per agenti predefiniti
  order: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_user_active", ["userId", "isActive"])
.index("by_system", ["isSystem"]);
```

#### Task 1.1.2: Tabella `workflows`
```typescript
workflows: defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.string(),
  agentSequence: v.array(v.object({
    agentId: v.id("agents"),
    order: v.number(),
    isActive: v.boolean(),
    conditions: v.optional(v.string()), // JSON string per logica condizionale
  })),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_user", ["userId"])
.index("by_user_active", ["userId", "isActive"]);
```

#### Task 1.1.3: Tabella `agentConfigurations`
```typescript
agentConfigurations: defineTable({
  userId: v.id("users"),
  agentId: v.id("agents"),
  customPrompt: v.optional(v.string()),
  modelId: v.string(),
  temperature: v.number(),
  maxTokens: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_agent", ["agentId"])
.index("by_user", ["userId"])
.index("by_user_active", ["userId", "isActive"]);
```

### 1.2 Migrazione Agenti Esistenti
**File:** `convex/migrations.ts` (nuovo)

#### Task 1.2.1: Script di Migrazione
- Creare script per migrare i 6 agenti esistenti da `agentPrompts.ts` al database
- Popolare tabella `agents` con agenti predefiniti (`isSystem: true`)
- Creare workflow predefinito per il flusso attuale

---

## Task 2: Funzioni CRUD Convex

### 2.1 Funzioni per Agenti
**File:** `convex/agents.ts` (nuovo)

#### Task 2.1.1: Query Functions
```typescript
// getAgentsByUser - Ottiene agenti di un utente
// getSystemAgents - Ottiene agenti predefiniti
// getAgentById - Ottiene agente specifico
// getActiveAgentsByUser - Ottiene agenti attivi di un utente
```

#### Task 2.1.2: Mutation Functions
```typescript
// createAgent - Crea nuovo agente personalizzato
// updateAgent - Aggiorna agente esistente
// deleteAgent - Elimina agente (soft delete)
// toggleAgentActive - Attiva/disattiva agente
// reorderAgents - Riordina agenti
```

### 2.2 Funzioni per Workflow
**File:** `convex/workflows.ts` (nuovo)

#### Task 2.2.1: Query Functions
```typescript
// getWorkflowsByUser - Ottiene workflow di un utente
// getWorkflowById - Ottiene workflow specifico
// getActiveWorkflowsByUser - Ottiene workflow attivi
```

#### Task 2.2.2: Mutation Functions
```typescript
// createWorkflow - Crea nuovo workflow
// updateWorkflow - Aggiorna workflow esistente
// deleteWorkflow - Elimina workflow
// toggleWorkflowActive - Attiva/disattiva workflow
// updateWorkflowSequence - Aggiorna sequenza agenti
```

### 2.3 Funzioni per Configurazioni
**File:** `convex/agentConfigurations.ts` (nuovo)

#### Task 2.3.1: Query Functions
```typescript
// getConfigurationsByAgent - Ottiene configurazioni per agente
// getConfigurationsByUser - Ottiene configurazioni utente
// getActiveConfigurationByAgent - Ottiene configurazione attiva per agente
```

#### Task 2.3.2: Mutation Functions
```typescript
// createConfiguration - Crea nuova configurazione
// updateConfiguration - Aggiorna configurazione
// deleteConfiguration - Elimina configurazione
// setActiveConfiguration - Imposta configurazione attiva
```

---

## Task 3: Sistema di Template Engine

### 3.1 Template Parser
**File:** `lib/templateEngine.ts` (nuovo)

#### Task 3.1.1: Parser Base
```typescript
interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  defaultValue?: any;
}

interface TemplateCondition {
  variable: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains';
  value: any;
  then: string;
  else?: string;
}

class TemplateEngine {
  parseTemplate(template: string): ParsedTemplate;
  validateTemplate(template: string): ValidationResult;
  renderTemplate(template: string, variables: Record<string, any>): string;
  extractVariables(template: string): TemplateVariable[];
}
```

#### Task 3.1.2: Variabili Supportate
- `{{idea}}` - Idea dell'app
- `{{frontendDoc}}` - Documento frontend
- `{{backendDoc}}` - Documento backend
- `{{langInstruction}}` - Istruzione lingua
- `{{userName}}` - Nome utente
- `{{projectName}}` - Nome progetto

#### Task 3.1.3: Logica Condizionale
```typescript
// Supporto per condizioni nei template
// {{#if frontendDoc}}...{{/if}}
// {{#unless backendDoc}}...{{/unless}}
// {{#each items}}...{{/each}}
```

### 3.2 Validazione Template
**File:** `lib/templateValidator.ts` (nuovo)

#### Task 3.2.1: Validator
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

class TemplateValidator {
  validateSyntax(template: string): ValidationResult;
  validateVariables(template: string, availableVariables: string[]): ValidationResult;
  validateLogic(template: string): ValidationResult;
}
```

---

## Task 4: API Backend per Agenti

### 4.1 Servizio Agenti Dinamici
**File:** `services/dynamicAgentService.ts` (nuovo)

#### Task 4.1.1: Agent Executor
```typescript
interface AgentExecutionContext {
  idea: string;
  language: Language;
  modelId?: OpenRouterModelId;
  variables: Record<string, any>;
}

class DynamicAgentService {
  executeAgent(agentId: string, context: AgentExecutionContext): Promise<string>;
  executeWorkflow(workflowId: string, context: AgentExecutionContext): Promise<Document[]>;
  validateAgentConfiguration(agentId: string, config: AgentConfiguration): Promise<boolean>;
}
```

#### Task 4.1.2: Workflow Executor
```typescript
interface WorkflowExecutionContext extends AgentExecutionContext {
  previousResults: Record<string, string>;
}

class WorkflowExecutor {
  executeSequential(workflow: Workflow, context: WorkflowExecutionContext): Promise<Document[]>;
  executeParallel(workflow: Workflow, context: WorkflowExecutionContext): Promise<Document[]>;
  handleConditionalBranches(workflow: Workflow, context: WorkflowExecutionContext): Promise<Document[]>;
}
```

### 4.2 Integrazione con OpenRouter
**File:** `services/openRouterService.ts` (modifica)

#### Task 4.2.1: Estensione Servizio
```typescript
// Aggiungere supporto per agenti dinamici
export const executeDynamicAgent = async (
  agent: Agent, 
  context: AgentExecutionContext
): Promise<string>;

export const executeWorkflow = async (
  workflow: Workflow, 
  context: WorkflowExecutionContext
): Promise<Document[]>;
```

---

## Task 5: Sistema di Migrazione

### 5.1 Migrazione Agenti Predefiniti
**File:** `convex/migrations.ts`

#### Task 5.1.1: Script Migrazione
```typescript
// Funzione per migrare agenti da agentPrompts.ts
export const migrateDefaultAgents = async (ctx: ActionCtx) => {
  // 1. Leggere agenti da agentPrompts.ts
  // 2. Creare record in tabella agents
  // 3. Impostare isSystem: true
  // 4. Creare workflow predefinito
};
```

#### Task 5.1.2: Workflow Predefinito
```typescript
// Creare workflow che replica il flusso attuale:
// 1. ideaEnhancerAgent
// 2. generateFrontendDoc
// 3. generateCssSpec
// 4. generateBackendDoc
// 5. generateDbSchema
```

### 5.2 Compatibilità Backward
**File:** `services/legacyAgentService.ts` (nuovo)

#### Task 5.2.1: Wrapper Legacy
```typescript
// Mantenere compatibilità con API esistenti
export const ideaEnhancerAgent = async (idea: string, language: Language, modelId?: OpenRouterModelId) => {
  // Usare nuovo sistema dinamico
  return await executeDynamicAgent('idea-enhancer', { idea, language, modelId });
};
```

---

## Task 6: Validazione e Permessi

### 6.1 Validazione Input
**File:** `lib/validation.ts` (nuovo)

#### Task 6.1.1: Validatori
```typescript
export const validateAgent = (agent: Partial<Agent>): ValidationResult;
export const validateWorkflow = (workflow: Partial<Workflow>): ValidationResult;
export const validateConfiguration = (config: Partial<AgentConfiguration>): ValidationResult;
```

### 6.2 Sistema Permessi
**File:** `convex/permissions.ts` (nuovo)

#### Task 6.2.1: Controllo Accessi
```typescript
export const canUserAccessAgent = (ctx: QueryCtx, userId: string, agentId: string): Promise<boolean>;
export const canUserModifyAgent = (ctx: MutationCtx, userId: string, agentId: string): Promise<boolean>;
export const canUserAccessWorkflow = (ctx: QueryCtx, userId: string, workflowId: string): Promise<boolean>;
```

---

## Task 7: Testing e Documentazione

### 7.1 Test Unitari
**File:** `tests/agents.test.ts` (nuovo)

#### Task 7.1.1: Test Coverage
- Test funzioni CRUD agenti
- Test template engine
- Test workflow executor
- Test validazione input
- Test migrazione dati

### 7.2 Documentazione API
**File:** `docs/api/agents.md` (nuovo)

#### Task 7.2.1: Documentazione
- API reference per tutte le funzioni
- Esempi di utilizzo
- Schema database
- Guida migrazione

---

## Task 8: Integrazione Frontend (Preparazione)

### 8.1 Hook per Agenti Dinamici
**File:** `hooks/useDynamicAgents.ts` (nuovo)

#### Task 8.1.1: Hook Base
```typescript
export const useAgents = (userId: string) => {
  // Hook per gestire agenti utente
};

export const useWorkflows = (userId: string) => {
  // Hook per gestire workflow utente
};

export const useAgentExecution = () => {
  // Hook per eseguire agenti
};
```

### 8.2 Tipi TypeScript
**File:** `types/agents.ts` (nuovo)

#### Task 8.2.1: Definizioni Tipi
```typescript
export interface Agent {
  id: string;
  userId: string;
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

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  agentSequence: WorkflowStep[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AgentConfiguration {
  id: string;
  userId: string;
  agentId: string;
  customPrompt?: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## Cronologia Implementazione

### Settimana 1: Database e Schema
- [ ] Task 1.1: Creazione tabelle database
- [ ] Task 1.2: Script migrazione agenti predefiniti
- [ ] Task 6.1: Validazione input base

### Settimana 2: Funzioni CRUD
- [ ] Task 2.1: Funzioni CRUD agenti
- [ ] Task 2.2: Funzioni CRUD workflow
- [ ] Task 2.3: Funzioni CRUD configurazioni

### Settimana 3: Template Engine
- [ ] Task 3.1: Parser template base
- [ ] Task 3.2: Validatore template
- [ ] Task 4.1: Servizio agenti dinamici

### Settimana 4: Integrazione e Testing
- [ ] Task 4.2: Integrazione OpenRouter
- [ ] Task 5.1: Sistema migrazione
- [ ] Task 7.1: Test unitari
- [ ] Task 8.1: Hook frontend

---

## Criteri di Completamento Fase 1

### ✅ Database
- [ ] Tutte le tabelle create e funzionanti
- [ ] Indici ottimizzati per performance
- [ ] Migrazione agenti predefiniti completata

### ✅ Backend
- [ ] Tutte le funzioni CRUD implementate
- [ ] Template engine funzionante
- [ ] Sistema di validazione attivo
- [ ] Permessi e sicurezza implementati

### ✅ Integrazione
- [ ] Compatibilità backward mantenuta
- [ ] API esistenti funzionanti
- [ ] Nuovo sistema integrato con OpenRouter

### ✅ Testing
- [ ] Test unitari per tutte le funzioni
- [ ] Test di integrazione
- [ ] Documentazione API completa

---

## Note Implementative

### Priorità Alta
1. **Database Schema** - Base per tutto il sistema
2. **Template Engine** - Cuore del sistema modulare
3. **Funzioni CRUD** - API per gestione dati
4. **Migrazione** - Transizione senza interruzioni

### Considerazioni Tecniche
- **Performance**: Indici ottimizzati per query frequenti
- **Sicurezza**: Validazione input e controllo permessi
- **Scalabilità**: Architettura modulare per estensioni future
- **Manutenibilità**: Codice ben documentato e testato

### Rischi e Mitigazioni
- **Rischio**: Perdita dati durante migrazione
- **Mitigazione**: Backup completo prima della migrazione

- **Rischio**: Performance degradate con template complessi
- **Mitigazione**: Caching intelligente e ottimizzazioni

- **Rischio**: Incompatibilità con frontend esistente
- **Mitigazione**: Wrapper legacy e test di regressione
