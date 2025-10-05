# Spiegazione dei File del Progetto DocuGenius

## COMPONENTI (React Components)

### AgentEditor.tsx
**Responsabilità**: Editor per creare e modificare agenti AI
- Fornisce interfaccia grafica per configurare agenti con nome, descrizione, system prompt, modello AI, temperatura e token massimi
- Gestisce la validazione dei form e l'invio dei dati
- Supporta sia la creazione che la modifica di agenti esistenti
- Utilizza traduzioni multilingua per l'interfaccia utente

### AuthForms.tsx
**Responsabilità**: Gestione dell'autenticazione utente
- **LoginForm**: Form di accesso con email/password
- **RegisterForm**: Form di registrazione con conferma password
- **UserProfile**: Gestione profilo utente e cambio password
- Integra con Convex per l'autenticazione lato server
- Gestisce errori e stati di caricamento

### DocumentCard.tsx
**Responsabilità**: Visualizzazione documenti generati
- Mostra anteprima dei documenti con titolo, categoria e contenuto parziale
- Fornisce azioni per copiare contenuto negli appunti
- Permette download come file .md
- Utilizza icone categorizzate per tipi documento diversi (Frontend, Backend, CSS, DB Schema)

### icons.tsx
**Responsabilità**: Raccolta di icone SVG riutilizzabili
- Definisce componenti icona per tutta l'applicazione
- Include icone per operazioni comuni (plus, copy, download, settings, etc.)
- Supporta personalizzazione tramite props
- Include icone specifiche per categorie documenti e lingue

### Sidebar.tsx
**Responsabilità**: Barra laterale di navigazione principale
- Mostra lista progetti utente con possibilità di selezione
- Pulsante creazione nuovo progetto
- Selettore lingua (Italiano/Inglese)
- Navigazione tra vista editor e Agent Hub
- Supporta modalità compressa per schermi piccoli

### SimpleAgentHub.tsx
**Responsabilità**: Hub centrale per gestione agenti e workflow
- Visualizza lista agenti e workflow esistenti
- Fornisce ricerca e filtri
- Pulsanti azioni rapide per creare nuovi elementi
- Gestisce navigazione tra viste diverse
- Implementa logica di editing in-place

### SimpleMainScreen.tsx
**Responsabilità**: Schermata principale dell'editor progetti
- Mostra informazioni progetto selezionato
- Include executor workflow per generazione documenti
- Visualizza documenti generati come card
- Gestisce salvataggio automatico progetti
- Mostra stati di caricamento ed errore

### SimpleWorkflowExecutor.tsx
**Responsabilità**: Esecuzione workflow con input utente
- Selettore workflow con descrizione dettagliata
- Area input per descrizione idea utente
- Gestione errori con messaggi informativi
- Pulsante esecuzione con stato loading
- Validazione input prima dell'esecuzione

### Spinner.tsx
**Responsabilità**: Componente indicatore caricamento
- Mostra animazione rotante durante operazioni asincrone
- Testo personalizzabile per contesto operazione
- Design consistente con tema applicazione

### WorkflowBuilder.tsx
**Responsabilità**: Costruttore visuale workflow
- Interfaccia drag-and-drop per costruire workflow
- Pannello agenti disponibili da aggiungere
- Configurazione proprietà step (parallelo, ordine esecuzione)
- Anteprima struttura workflow in tempo reale
- Gestione ordinamento e rimozione step

## CONVEX (Backend Database & API)

### convex.config.ts
**Responsabilità**: Configurazione Convex
- Definizione configurazione applicazione Convex
- Setup ambiente sviluppo/produzione

### agents.ts
**Responsabilità**: Operazioni database per agenti AI
- Query per ottenere agenti utente e sistema
- Mutazioni creazione, aggiornamento, eliminazione agenti
- Gestione ordinamento e proprietà agenti
- Separazione logica agenti utente vs sistema

### projects.ts
**Responsabilità**: Gestione progetti utente
- CRUD completo progetti (crea, leggi, aggiorna, elimina)
- Associazione documenti ai progetti
- Query ottimizzate con indici per performance
- Gestione relazioni progetto-documento

### workflows.ts
**Responsabilità**: Operazioni workflow
- Gestione workflow utente con step configurazione
- Query workflow attivi e per utente
- Mutazioni creazione, modifica, eliminazione
- Supporto esecuzione parallela step

## SERVIZI (Business Logic)

### openRouterService.ts
**Responsabilità**: Integrazione API OpenRouter
- Configurazione modelli AI disponibili
- Gestione chiamate API con retry automatico
- Gestione errori rate limiting e autenticazione
- Supporto modelli gratuiti e a pagamento

### workflowEngine.ts
**Responsabilità**: Motore esecuzione workflow
- Esecuzione sequenziale e parallela step
- Gestione contesto e output tra step
- Integrazione con OpenRouter per chiamate AI
- Gestione errori e timeout tra chiamate

## TIPI (TypeScript Types)

### agents.ts
**Responsabilità**: Definizioni TypeScript
- Interfacce Agent, Workflow, WorkflowStep
- Tipi esecuzione e risultati workflow
- Garanzia type safety tra frontend e backend
- Documentazione struttura dati applicazione

## FILE BUNDLE COMPILATI

### index-Bxjv9pkQ.js
Questo file è il **bundle principale** dell'applicazione compilato da Vite/build tools. Contiene:
- Codice JavaScript minimizzato di tutti i componenti React
- Dipendenze esterne (React, Convex client, etc.)
- Traduzioni e configurazioni
- Logica applicazione principale

### workflowEngine-Vf2kCN4d.js
Questo file è un **chunk separato** contenente:
- Classe WorkflowEngine per esecuzione workflow
- Logica business per processamento AI
- Codice separato per ottimizzazione caricamento

**A cosa servono**: Questi file sono generati automaticamente durante il processo di build e servono per distribuire l'applicazione in produzione. Non dovrebbero essere modificati manualmente ma rigenerati tramite `npm run build`.
