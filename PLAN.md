# Piano di Modularizzazione del Sistema Agenti

## Obiettivo
Trasformare il sistema di agenti da statico a completamente modulare, permettendo agli utenti di creare, modificare e gestire agenti personalizzati e flussi di lavoro custom.

## Analisi Attuale
- **Agenti fissi**: 6 agenti predefiniti in `agentPrompts.ts`
- **Flusso fisso**: Sequenza hardcoded in `openRouterService.ts`
- **Configurazione statica**: Prompt e logica non modificabili
- **UI limitata**: Solo visualizzazione in `AgentHub.tsx`

## Architettura Proposta

### 1. Database Schema Esteso
```
agents: {
  id, userId, name, description, persona, icon, 
  promptTemplate, isActive, isSystem, order, 
  createdAt, updatedAt
}

workflows: {
  id, userId, name, description, 
  agentSequence: [agentId, order, isActive],
  isActive, createdAt, updatedAt
}

agentConfigurations: {
  id, userId, agentId, customPrompt, 
  modelId, temperature, maxTokens,
  isActive, createdAt, updatedAt
}
```

### 2. Sistema di Template
- **Prompt Template Engine**: Sistema di placeholder dinamici
- **Variable System**: `{{idea}}`, `{{frontendDoc}}`, `{{langInstruction}}`
- **Conditional Logic**: Supporto per logica condizionale nei prompt
- **Validation**: Validazione template e variabili

### 3. Workflow Engine
- **Sequential Execution**: Esecuzione sequenziale con dipendenze
- **Parallel Execution**: Supporto per esecuzione parallela
- **Conditional Branches**: Flussi condizionali basati su risultati
- **Error Handling**: Gestione errori e retry logic
- **Progress Tracking**: Monitoraggio stato esecuzione

### 4. UI/UX Modulare

#### AgentHub Esteso
- **Agent Manager**: CRUD per agenti personalizzati
- **Workflow Designer**: Drag & drop per creare flussi
- **Template Editor**: Editor visuale per prompt
- **Configuration Panel**: Settings per modelli e parametri
- **Preview System**: Anteprima risultati in tempo reale

#### Componenti UI
- `AgentEditor`: Creazione/modifica agenti
- `WorkflowDesigner`: Designer visuale flussi
- `PromptTemplateEditor`: Editor avanzato prompt
- `AgentLibrary`: Libreria agenti disponibili
- `WorkflowRunner`: Esecutore flussi con monitoraggio

## Fasi di Implementazione

### Fase 1: Database e Backend
1. **Estendere schema Convex**
   - Aggiungere tabelle `agents`, `workflows`, `agentConfigurations`
   - Creare funzioni CRUD per ogni entità
   - Implementare validazione e permessi

2. **Sistema di Template**
   - Engine per placeholder dinamici
   - Validazione template e variabili
   - Supporto per logica condizionale

3. **API Backend**
   - Funzioni per gestione agenti personalizzati
   - Sistema di esecuzione workflow
   - Integrazione con OpenRouter

### Fase 2: Core Engine
1. **Workflow Engine**
   - Parser per sequenze agenti
   - Sistema di dipendenze
   - Gestione errori e retry
   - Progress tracking

2. **Agent Execution System**
   - Esecutore dinamico agenti
   - Sistema di configurazione
   - Integrazione con template engine

3. **Migration System**
   - Migrazione agenti esistenti
   - Compatibilità backward
   - Sistema di versioning

### Fase 3: UI/UX
1. **AgentHub Rinnovato**
   - Layout modulare
   - Gestione agenti personalizzati
   - Libreria agenti predefiniti

2. **Editor Avanzati**
   - AgentEditor con preview
   - WorkflowDesigner drag & drop
   - PromptTemplateEditor con syntax highlighting

3. **Sistema di Configurazione**
   - Panel settings per modelli
   - Gestione parametri avanzati
   - Sistema di import/export

### Fase 4: Funzionalità Avanzate
1. **Workflow Designer**
   - Drag & drop interface
   - Visualizzazione dipendenze
   - Testing e debugging

2. **Sistema di Condivisione**
   - Pubblicazione agenti
   - Import/export configurazioni
   - Sistema di rating e commenti

3. **Analytics e Monitoring**
   - Metriche di utilizzo
   - Performance tracking
   - Error reporting

## Vantaggi dell'Architettura

### Modularità
- **Agenti indipendenti**: Ogni agente è un modulo separato
- **Workflow flessibili**: Combinazioni infinite di agenti
- **Template riutilizzabili**: Prompt condivisibili e modificabili

### Scalabilità
- **Database ottimizzato**: Indici per performance
- **Caching intelligente**: Cache per template e configurazioni
- **Lazy loading**: Caricamento on-demand

### Usabilità
- **UI intuitiva**: Drag & drop e editor visuali
- **Preview in tempo reale**: Anteprima risultati
- **Documentazione integrata**: Help contextuale

### Estensibilità
- **Plugin system**: Supporto per estensioni future
- **API pubbliche**: Integrazione con servizi esterni
- **Webhook support**: Notifiche e integrazioni

## Considerazioni Tecniche

### Performance
- **Lazy loading**: Caricamento agenti solo quando necessario
- **Caching**: Cache per template e configurazioni
- **Batch operations**: Operazioni in batch per efficienza

### Sicurezza
- **Validazione input**: Sanitizzazione template e configurazioni
- **Permessi granulari**: Controllo accessi per agente
- **Audit trail**: Log di tutte le modifiche

### Manutenibilità
- **Codice modulare**: Separazione responsabilità
- **Testing**: Test unitari e di integrazione
- **Documentazione**: Documentazione completa API

## Risultato Finale
Un sistema completamente modulare che permette agli utenti di:
- Creare agenti personalizzati con prompt custom
- Disegnare workflow complessi con logica condizionale
- Condividere e importare configurazioni
- Monitorare performance e debug
- Estendere il sistema con nuove funzionalità

Il sistema mantiene la semplicità d'uso attuale mentre offre potenza e flessibilità per utenti avanzati.
