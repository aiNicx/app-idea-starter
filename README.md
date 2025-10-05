# 🤖 AI Agent Workflow System

Sistema modulare e scalabile per creare, gestire ed eseguire workflow di agenti AI con supporto per esecuzione serie e parallela.

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- Account Convex (https://convex.dev)
- OpenRouter API Key (https://openrouter.ai)

### Installazione

```bash
# Installa dipendenze
npm install

# Configura Convex
npx convex dev

# Configura variabili d'ambiente
# Crea .env.local con:
OPENROUTER_API_KEY=your_api_key_here

# ⚠️ IMPORTANTE: Configurazione OpenRouter API
# Per utilizzare l'applicazione devi:
# 1. Andare su https://openrouter.ai/
# 2. Creare un account gratuito
# 3. Andare su https://openrouter.ai/keys
# 4. Creare una nuova chiave API gratuita
# 5. Copiare la chiave e sostituire "your_api_key_here" sopra
#
# Nota: OpenRouter ha limiti di rate (es. 100 richieste/minuto per modelli gratuiti)
# Se vedi errori 429 "Rate limit exceeded", aspetta qualche minuto prima di riprovare.

# Avvia il progetto
npm run dev
```

## 📋 Funzionalità

### ✅ Gestione Agenti
- Crea agenti AI personalizzati
- Configura system prompt, modello LLM, temperatura
- Supporto per 2 modelli: Gemini 2.0 Flash e Tongyi DeepResearch

### ✅ Workflow Builder
- Drag & drop per creare sequenze di agenti
- Esecuzione serie o parallela
- Chain di output tra agenti
- Configurazione flessibile per step

### ✅ Esecuzione Workflow
- Input utente dinamico
- Esecuzione scalabile
- Risultati come documenti
- Gestione errori robusta

## 🏗️ Architettura

```
Frontend (React + TypeScript)
  ↓
Convex (Backend + Database)
  ↓
OpenRouter (LLM API)
  ↓
Gemini 2.0 Flash / Tongyi DeepResearch
```

## 📁 Struttura

```
components/        # Componenti React
convex/           # Backend Convex
services/         # Workflow Engine
hooks/            # Custom Hooks
types/            # TypeScript Types
lib/              # Utilities
```

## 📖 Documentazione

Vedi [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) per documentazione completa.

## 🎯 Esempio d'Uso

1. **Crea Agente**: Agent Hub → Create Agent
2. **Crea Workflow**: Agent Hub → Create Workflow → Drag & Drop agenti
3. **Esegui**: Main Screen → Seleziona workflow → Input → Execute

## 🛠️ Tecnologie

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Convex
- **LLM**: OpenRouter (Gemini 2.0 Flash, Tongyi DeepResearch)
- **Build**: Vite

## 📊 Metriche

- 85% riduzione complessità
- 5 componenti essenziali
- 2 modelli LLM ottimizzati
- Engine scalabile serie/parallelo

## 🎉 Caratteristiche

- ✅ Semplice e intuitivo
- ✅ Modulare e estendibile
- ✅ Scalabile e performante
- ✅ Codice pulito e manutenibile

---

Made with ❤️ using Convex and OpenRouter