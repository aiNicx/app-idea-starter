import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Verifica se un utente può accedere a un agente
 */
export const canUserAccessAgent = query({
  args: { 
    userId: v.id("users"), 
    agentId: v.id("agents") 
  },
  handler: async (ctx, { userId, agentId }) => {
    const agent = await ctx.db.get(agentId);
    
    if (!agent) {
      return false;
    }

    // L'utente può accedere se:
    // 1. È il proprietario dell'agente, O
    // 2. L'agente è di sistema (isSystem: true)
    return agent.userId === userId || agent.isSystem;
  },
});

/**
 * Verifica se un utente può modificare un agente
 */
export const canUserModifyAgent = mutation({
  args: { 
    userId: v.id("users"), 
    agentId: v.id("agents") 
  },
  handler: async (ctx, { userId, agentId }) => {
    const agent = await ctx.db.get(agentId);
    
    if (!agent) {
      return false;
    }

    // L'utente può modificare solo se:
    // 1. È il proprietario dell'agente, E
    // 2. L'agente NON è di sistema
    return agent.userId === userId && !agent.isSystem;
  },
});

/**
 * Verifica se un utente può accedere a un workflow
 */
export const canUserAccessWorkflow = query({
  args: { 
    userId: v.id("users"), 
    workflowId: v.id("workflows") 
  },
  handler: async (ctx, { userId, workflowId }) => {
    const workflow = await ctx.db.get(workflowId);
    
    if (!workflow) {
      return false;
    }

    // L'utente può accedere solo se è il proprietario del workflow
    return workflow.userId === userId;
  },
});

/**
 * Verifica se un utente può modificare un workflow
 */
export const canUserModifyWorkflow = mutation({
  args: { 
    userId: v.id("users"), 
    workflowId: v.id("workflows") 
  },
  handler: async (ctx, { userId, workflowId }) => {
    const workflow = await ctx.db.get(workflowId);
    
    if (!workflow) {
      return false;
    }

    // L'utente può modificare solo se è il proprietario del workflow
    return workflow.userId === userId;
  },
});

/**
 * Verifica se un utente può accedere a una configurazione
 */
export const canUserAccessConfiguration = query({
  args: { 
    userId: v.id("users"), 
    configurationId: v.id("agentConfigurations") 
  },
  handler: async (ctx, { userId, configurationId }) => {
    const configuration = await ctx.db.get(configurationId);
    
    if (!configuration) {
      return false;
    }

    // L'utente può accedere solo se è il proprietario della configurazione
    return configuration.userId === userId;
  },
});

/**
 * Verifica se un utente può modificare una configurazione
 */
export const canUserModifyConfiguration = mutation({
  args: { 
    userId: v.id("users"), 
    configurationId: v.id("agentConfigurations") 
  },
  handler: async (ctx, { userId, configurationId }) => {
    const configuration = await ctx.db.get(configurationId);
    
    if (!configuration) {
      return false;
    }

    // L'utente può modificare solo se è il proprietario della configurazione
    return configuration.userId === userId;
  },
});

/**
 * Verifica se un utente può eseguire un workflow
 */
export const canUserExecuteWorkflow = query({
  args: { 
    userId: v.id("users"), 
    workflowId: v.id("workflows") 
  },
  handler: async (ctx, { userId, workflowId }) => {
    const workflow = await ctx.db.get(workflowId);
    
    if (!workflow) {
      return false;
    }

    // L'utente può eseguire solo se:
    // 1. È il proprietario del workflow, E
    // 2. Il workflow è attivo
    return workflow.userId === userId && workflow.isActive;
  },
});

/**
 * Verifica se un utente può eseguire un agente
 */
export const canUserExecuteAgent = query({
  args: { 
    userId: v.id("users"), 
    agentId: v.id("agents") 
  },
  handler: async (ctx, { userId, agentId }) => {
    const agent = await ctx.db.get(agentId);
    
    if (!agent) {
      return false;
    }

    // L'utente può eseguire se:
    // 1. L'agente è attivo, E
    // 2. (È il proprietario dell'agente O l'agente è di sistema)
    return agent.isActive && (agent.userId === userId || agent.isSystem);
  },
});

/**
 * Verifica se un utente può creare agenti
 */
export const canUserCreateAgent = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Per ora tutti gli utenti autenticati possono creare agenti
    // In futuro si potrebbero aggiungere limiti basati su subscription, etc.
    return true;
  },
});

/**
 * Verifica se un utente può creare workflow
 */
export const canUserCreateWorkflow = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Per ora tutti gli utenti autenticati possono creare workflow
    return true;
  },
});

/**
 * Verifica se un utente può creare configurazioni
 */
export const canUserCreateConfiguration = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Per ora tutti gli utenti autenticati possono creare configurazioni
    return true;
  },
});

/**
 * Ottiene i permessi completi di un utente
 */
export const getUserPermissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return {
      canCreateAgent: await ctx.runQuery("permissions:canUserCreateAgent" as any, { userId }),
      canCreateWorkflow: await ctx.runQuery("permissions:canUserCreateWorkflow" as any, { userId }),
      canCreateConfiguration: await ctx.runQuery("permissions:canUserCreateConfiguration" as any, { userId }),
    };
  },
});

/**
 * Verifica se un utente può accedere a un progetto
 */
export const canUserAccessProject = query({
  args: { 
    userId: v.id("users"), 
    projectId: v.id("projects") 
  },
  handler: async (ctx, { userId, projectId }) => {
    const project = await ctx.db.get(projectId);
    
    if (!project) {
      return false;
    }

    // L'utente può accedere solo se è il proprietario del progetto
    return project.userId === userId;
  },
});

/**
 * Verifica se un utente può modificare un progetto
 */
export const canUserModifyProject = mutation({
  args: { 
    userId: v.id("users"), 
    projectId: v.id("projects") 
  },
  handler: async (ctx, { userId, projectId }) => {
    const project = await ctx.db.get(projectId);
    
    if (!project) {
      return false;
    }

    // L'utente può modificare solo se è il proprietario del progetto
    return project.userId === userId;
  },
});

/**
 * Verifica se un utente può accedere a un documento
 */
export const canUserAccessDocument = query({
  args: { 
    userId: v.id("users"), 
    documentId: v.id("documents") 
  },
  handler: async (ctx, { userId, documentId }) => {
    const document = await ctx.db.get(documentId);
    
    if (!document) {
      return false;
    }

    // Ottieni il progetto del documento
    const project = await ctx.db.get(document.projectId);
    
    if (!project) {
      return false;
    }

    // L'utente può accedere solo se è il proprietario del progetto
    return project.userId === userId;
  },
});

/**
 * Verifica se un utente può modificare un documento
 */
export const canUserModifyDocument = mutation({
  args: { 
    userId: v.id("users"), 
    documentId: v.id("documents") 
  },
  handler: async (ctx, { userId, documentId }) => {
    const document = await ctx.db.get(documentId);
    
    if (!document) {
      return false;
    }

    // Ottieni il progetto del documento
    const project = await ctx.db.get(document.projectId);
    
    if (!project) {
      return false;
    }

    // L'utente può modificare solo se è il proprietario del progetto
    return project.userId === userId;
  },
});

/**
 * Verifica se un utente può eseguire un'azione specifica
 */
export const canUserPerformAction = query({
  args: { 
    userId: v.id("users"), 
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, action, resourceType, resourceId }) => {
    // Mappa delle azioni possibili
    const actionMap: Record<string, (ctx: any, userId: string, resourceId?: string) => Promise<boolean>> = {
      'create_agent': () => ctx.runQuery("permissions:canUserCreateAgent" as any, { userId }),
      'create_workflow': () => ctx.runQuery("permissions:canUserCreateWorkflow" as any, { userId }),
      'create_configuration': () => ctx.runQuery("permissions:canUserCreateConfiguration" as any, { userId }),
      'read_agent': (ctx, userId, resourceId) => ctx.runQuery("permissions:canUserAccessAgent" as any, { userId, agentId: resourceId as Id<"agents"> }),
      'update_agent': (ctx, userId, resourceId) => ctx.runQuery("permissions:canUserModifyAgent" as any, { userId, agentId: resourceId as Id<"agents"> }),
      'read_workflow': (ctx, userId, resourceId) => ctx.runQuery("permissions:canUserAccessWorkflow" as any, { userId, workflowId: resourceId as Id<"workflows"> }),
      'update_workflow': (ctx, userId, resourceId) => ctx.runQuery("permissions:canUserModifyWorkflow" as any, { userId, workflowId: resourceId as Id<"workflows"> }),
      'execute_workflow': (ctx, userId, resourceId) => ctx.runQuery("permissions:canUserExecuteWorkflow" as any, { userId, workflowId: resourceId as Id<"workflows"> }),
      'execute_agent': (ctx, userId, resourceId) => ctx.runQuery("permissions:canUserExecuteAgent" as any, { userId, agentId: resourceId as Id<"agents"> }),
    };

    const actionKey = `${action}_${resourceType}`;
    const actionFunction = actionMap[actionKey];

    if (!actionFunction) {
      return false;
    }

    try {
      return await actionFunction(ctx, userId, resourceId);
    } catch (error) {
      console.error(`Error checking permission for action ${actionKey}:`, error);
      return false;
    }
  },
});
