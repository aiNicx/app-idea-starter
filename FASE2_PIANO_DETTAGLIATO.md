# Piano Dettagliato - Fase 2: Core Engine e Integrazione
## Sistema di Agenti Modulare - Implementazione Fase 2

### Obiettivo
Completare l'integrazione del sistema modulare, implementare il core engine per l'esecuzione dinamica e preparare l'integrazione frontend.

---

## Task 1: Verifica e Completamento Database

### 1.1 Verifica Schema Database
**File:** `convex/schema.ts`

#### Task 1.1.1: Controllo Schema
- ✅ Schema già esteso con 3 nuove tabelle
- ✅ Indici ottimizzati implementati
- ✅ Relazioni corrette tra tabelle

#### Task 1.1.2: Test Connessione Database
- Verificare che Convex riconosca le nuove tabelle
- Testare creazione di record di test
- Verificare funzionamento degli indici

### 1.2 Generazione API Convex
**File:** `convex/_generated/api.ts`

#### Task 1.2.1: Rigenerare API
```bash
npx convex dev
# Verificare che le nuove funzioni siano generate
```

#### Task 1.2.2: Verifica Funzioni Generate
- Controllare che tutte le funzioni CRUD siano disponibili
- Verificare tipi TypeScript generati
- Testare import delle funzioni

---

## Task 2: Sistema di Migrazione e Setup

### 2.1 Esecuzione Migrazione Agenti Predefiniti
**File:** `convex/migrations.ts`

#### Task 2.1.1: Eseguire Migrazione
```typescript
// Chiamare la funzione di migrazione
await ctx.runAction("migrations:runFullMigration");
```

#### Task 2.1.2: Verifica Migrazione
- Controllare che 6 agenti di sistema siano stati creati
- Verificare che il workflow predefinito sia stato creato
- Testare che le configurazioni di default siano attive

#### Task 2.1.3: Test Rollback
- Testare il sistema di rollback
- Verificare che la migrazione possa essere annullata
- Controllare che il rollback ripristini lo stato originale

### 2.2 Sistema di Verifica Stato
**File:** `convex/migrations.ts`

#### Task 2.2.1: Implementare Check Status
```typescript
// Funzione per verificare stato migrazione
export const checkMigrationStatus = action({
  // Restituisce stato completo del sistema
});
```

---

## Task 3: Core Engine - Esecuzione Dinamica

### 3.1 Integrazione DynamicAgentService
**File:** `services/dynamicAgentService.ts`

#### Task 3.1.1: Connessione Database
- Integrare `getAgentById` con Convex
- Implementare query per recuperare agenti
- Aggiungere gestione errori per agenti non trovati

#### Task 3.1.2: Test Esecuzione Agenti
```typescript
// Test esecuzione singolo agente
const result = await DynamicAgentService.executeAgent(agent, context);
console.log('Agent execution result:', result);
```

#### Task 3.1.3: Test Esecuzione Workflow
```typescript
// Test esecuzione workflow completo
const documents = await DynamicAgentService.executeWorkflow(workflow, context);
console.log('Workflow execution result:', documents);
```

### 3.2 Sistema di Template Engine
**File:** `lib/templateEngine.ts`

#### Task 3.2.1: Test Template Parser
```typescript
// Test parsing template con variabili
const template = "Ciao {{userName}}, la tua idea è: {{idea}}";
const variables = { userName: "Mario", idea: "App mobile" };
const result = TemplateEngine.renderTemplate(template, variables);
// Expected: "Ciao Mario, la tua idea è: App mobile"
```

#### Task 3.2.2: Test Logica Condizionale
```typescript
// Test condizioni nei template
const template = "{{#if frontendDoc}}Frontend: {{frontendDoc}}{{/if}}";
const variables = { frontendDoc: "React app" };
const result = TemplateEngine.renderTemplate(template, variables);
// Expected: "Frontend: React app"
```

#### Task 3.2.3: Test Validazione Template
```typescript
// Test validazione template
const validation = TemplateEngine.validateTemplate(template);
console.log('Template validation:', validation);
```

---

## Task 4: Integrazione OpenRouter

### 4.1 Test Chiamate API
**File:** `services/openRouterService.ts`

#### Task 4.1.1: Test Chiamata Base
```typescript
// Test chiamata OpenRouter con agente dinamico
const result = await callOpenRouter(prompt, modelId);
console.log('OpenRouter response:', result);
```

#### Task 4.1.2: Test Gestione Errori
- Test rate limiting
- Test retry logic
- Test gestione errori API

#### Task 4.1.3: Test Modelli Diversi
- Test con modelli gratuiti
- Test con modelli a pagamento
- Verifica compatibilità modelli

### 4.2 Integrazione con Sistema Dinamico
**File:** `services/dynamicAgentService.ts`

#### Task 4.2.1: Test End-to-End
```typescript
// Test completo: Database -> Template -> OpenRouter -> Risultato
const agent = await getAgentById("agent_id");
const context = { idea: "Test idea", language: "it" };
const result = await DynamicAgentService.executeAgent(agent, context);
```

---

## Task 5: Sistema di Validazione e Permessi

### 5.1 Test Validazione Input
**File:** `lib/validation.ts`

#### Task 5.1.1: Test Validazione Agenti
```typescript
// Test validazione agente valido
const agent = { name: "Test Agent", description: "Test", ... };
const validation = ValidationService.validateAgent(agent);
console.log('Agent validation:', validation.isValid);
```

#### Task 5.1.2: Test Validazione Workflow
```typescript
// Test validazione workflow valido
const workflow = { name: "Test Workflow", agentSequence: [...], ... };
const validation = ValidationService.validateWorkflow(workflow);
console.log('Workflow validation:', validation.isValid);
```

#### Task 5.1.3: Test Validazione Configurazioni
```typescript
// Test validazione configurazione valida
const config = { modelId: "google/gemini-2.0-flash-exp:free", ... };
const validation = ValidationService.validateConfiguration(config);
console.log('Config validation:', validation.isValid);
```

### 5.2 Test Sistema Permessi
**File:** `convex/permissions.ts`

#### Task 5.2.1: Test Controllo Accessi
```typescript
// Test permessi utente per agente
const canAccess = await ctx.runQuery("permissions:canUserAccessAgent", {
  userId, agentId
});
console.log('Can access agent:', canAccess);
```

#### Task 5.2.2: Test Controllo Modifiche
```typescript
// Test permessi modifica
const canModify = await ctx.runQuery("permissions:canUserModifyAgent", {
  userId, agentId
});
console.log('Can modify agent:', canModify);
```

---

## Task 6: Test di Integrazione Frontend

### 6.1 Test Hook React
**File:** `hooks/useDynamicAgents.ts`

#### Task 6.1.1: Test Hook Agenti
```typescript
// Test hook per gestione agenti
const { agents, createAgent, updateAgent } = useAgents(userId);
console.log('User agents:', agents);
```

#### Task 6.1.2: Test Hook Workflow
```typescript
// Test hook per gestione workflow
const { workflows, createWorkflow } = useWorkflows(userId);
console.log('User workflows:', workflows);
```

#### Task 6.1.3: Test Hook Esecuzione
```typescript
// Test hook per esecuzione
const { executeAgent, executeWorkflow } = useAgentExecution();
console.log('Execution hooks ready');
```

### 6.2 Test Migrazione Frontend
**File:** `hooks/useDynamicAgents.ts`

#### Task 6.2.1: Test Hook Migrazione
```typescript
// Test hook migrazione
const { runMigration, checkStatus } = useMigration();
const status = await checkStatus();
console.log('Migration status:', status);
```

---

## Task 7: Test End-to-End

### 7.1 Test Flusso Completo
**Scenario:** Utente crea agente personalizzato e lo esegue

#### Task 7.1.1: Creazione Agente
```typescript
// 1. Creare agente personalizzato
const agent = await createAgent({
  name: "Test Agent",
  description: "Agent di test",
  persona: "Sono un agente di test",
  icon: "WandIcon",
  promptTemplate: "Analizza questa idea: {{idea}}",
  order: 0
});
```

#### Task 7.1.2: Creazione Workflow
```typescript
// 2. Creare workflow con l'agente
const workflow = await createWorkflow({
  name: "Test Workflow",
  description: "Workflow di test",
  agentSequence: [{
    agentId: agent._id,
    order: 0,
    isActive: true
  }]
});
```

#### Task 7.1.3: Esecuzione Workflow
```typescript
// 3. Eseguire workflow
const context = {
  idea: "App per gestire task",
  language: "it",
  variables: {}
};
const documents = await executeWorkflow(workflow, context);
console.log('Generated documents:', documents);
```

### 7.2 Test Compatibilità Backward
**Scenario:** Verificare che il sistema esistente funzioni ancora

#### Task 7.2.1: Test API Esistenti
```typescript
// Test che le API esistenti funzionino ancora
const result = await ideaEnhancerAgent("Test idea", "it");
console.log('Legacy API still works:', result);
```

#### Task 7.2.2: Test Flusso Originale
```typescript
// Test che il flusso originale funzioni
const docs = await documentationGeneratorAgent("Test idea", "it");
console.log('Original flow still works:', docs);
```

---

## Task 8: Debugging e Ottimizzazione

### 8.1 Debug Performance
**File:** `services/dynamicAgentService.ts`

#### Task 8.1.1: Monitoraggio Tempi
- Misurare tempi di esecuzione agenti
- Identificare bottleneck
- Ottimizzare query database

#### Task 8.1.2: Debug Template Engine
- Verificare performance parsing template
- Ottimizzare rendering
- Testare template complessi

### 8.2 Debug Errori
**File:** `lib/validation.ts`

#### Task 8.2.1: Test Gestione Errori
```typescript
// Test gestione errori vari scenari
try {
  await DynamicAgentService.executeAgent(invalidAgent, context);
} catch (error) {
  console.log('Error handled correctly:', error.message);
}
```

#### Task 8.2.2: Test Fallback
```typescript
// Test fallback per errori OpenRouter
const result = await callOpenRouter(prompt, modelId);
// Verificare che il fallback funzioni
```

---

## Task 9: Documentazione e Testing

### 9.1 Documentazione API
**File:** `docs/api/agents.md`

#### Task 9.1.1: Documentare Funzioni
- Documentare tutte le funzioni CRUD
- Esempi di utilizzo
- Schema database

#### Task 9.1.2: Documentare Template Engine
- Guida sintassi template
- Esempi variabili
- Best practices

### 9.2 Test Unitari
**File:** `tests/agents.test.ts`

#### Task 9.2.1: Test Database
```typescript
// Test funzioni CRUD
test('createAgent creates agent correctly', async () => {
  const agent = await createAgent(agentData);
  expect(agent.name).toBe(agentData.name);
});
```

#### Task 9.2.2: Test Template Engine
```typescript
// Test template engine
test('TemplateEngine renders variables correctly', () => {
  const result = TemplateEngine.renderTemplate(template, variables);
  expect(result).toBe(expected);
});
```

---

## Cronologia Implementazione

### Settimana 1: Setup e Migrazione
- [ ] Task 1.1: Verifica schema database
- [ ] Task 1.2: Generazione API Convex
- [ ] Task 2.1: Esecuzione migrazione agenti
- [ ] Task 2.2: Sistema verifica stato

### Settimana 2: Core Engine
- [ ] Task 3.1: Integrazione DynamicAgentService
- [ ] Task 3.2: Test Template Engine
- [ ] Task 4.1: Test OpenRouter
- [ ] Task 4.2: Integrazione sistema dinamico

### Settimana 3: Validazione e Frontend
- [ ] Task 5.1: Test validazione input
- [ ] Task 5.2: Test sistema permessi
- [ ] Task 6.1: Test hook React
- [ ] Task 6.2: Test migrazione frontend

### Settimana 4: Testing e Debug
- [ ] Task 7.1: Test end-to-end
- [ ] Task 7.2: Test compatibilità backward
- [ ] Task 8.1: Debug performance
- [ ] Task 8.2: Debug errori

---

## Criteri di Completamento Fase 2

### ✅ Database
- [ ] Schema funzionante e testato
- [ ] Migrazione agenti completata
- [ ] API Convex generate e funzionanti

### ✅ Core Engine
- [ ] Esecuzione agenti dinamici funzionante
- [ ] Template engine testato
- [ ] Integrazione OpenRouter verificata

### ✅ Validazione e Sicurezza
- [ ] Sistema validazione attivo
- [ ] Permessi funzionanti
- [ ] Gestione errori robusta

### ✅ Testing
- [ ] Test end-to-end completati
- [ ] Compatibilità backward verificata
- [ ] Performance ottimizzate

---

## Note Implementative

### Priorità Alta
1. **Migrazione Database** - Base per tutto il sistema
2. **Core Engine** - Cuore dell'esecuzione dinamica
3. **Test End-to-End** - Verifica funzionamento completo
4. **Compatibilità Backward** - Mantenere funzionalità esistenti

### Considerazioni Tecniche
- **Performance**: Monitoraggio tempi di esecuzione
- **Sicurezza**: Validazione input e controllo permessi
- **Robustezza**: Gestione errori e fallback
- **Manutenibilità**: Codice ben testato e documentato

### Rischi e Mitigazioni
- **Rischio**: Migrazione fallisce
- **Mitigazione**: Backup completo e rollback testato

- **Rischio**: Performance degradate
- **Mitigazione**: Monitoraggio e ottimizzazioni

- **Rischio**: Incompatibilità con frontend
- **Mitigazione**: Test di regressione e wrapper legacy
