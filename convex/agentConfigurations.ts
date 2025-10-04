import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// === QUERY FUNCTIONS ===

export const getConfigurationsByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    return await ctx.db
      .query("agentConfigurations")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .order("desc")
      .collect();
  },
});

export const getConfigurationsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("agentConfigurations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getActiveConfigurationByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    return await ctx.db
      .query("agentConfigurations")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

export const getActiveConfigurationsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("agentConfigurations")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .order("desc")
      .collect();
  },
});

export const getConfigurationById = query({
  args: { configurationId: v.id("agentConfigurations") },
  handler: async (ctx, { configurationId }) => {
    return await ctx.db.get(configurationId);
  },
});

export const getConfigurationWithAgent = query({
  args: { configurationId: v.id("agentConfigurations") },
  handler: async (ctx, { configurationId }) => {
    const configuration = await ctx.db.get(configurationId);
    if (!configuration) {
      return null;
    }

    const agent = await ctx.db.get(configuration.agentId);
    return {
      ...configuration,
      agent,
    };
  },
});

// === MUTATION FUNCTIONS ===

export const createConfiguration = mutation({
  args: {
    userId: v.id("users"),
    agentId: v.id("agents"),
    customPrompt: v.optional(v.string()),
    modelId: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
  },
  handler: async (ctx, { userId, agentId, customPrompt, modelId, temperature, maxTokens }) => {
    // Verifica che l'agente esista e sia accessibile
    const agent = await ctx.db.get(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    if (agent.userId !== userId && !agent.isSystem) {
      throw new Error("Agent not accessible");
    }

    // Verifica che non ci sia già una configurazione attiva per questo agente
    const existingActiveConfig = await ctx.db
      .query("agentConfigurations")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingActiveConfig) {
      throw new Error("Agent already has an active configuration");
    }

    const now = Date.now();

    return await ctx.db.insert("agentConfigurations", {
      userId,
      agentId,
      customPrompt,
      modelId,
      temperature,
      maxTokens,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateConfiguration = mutation({
  args: {
    configurationId: v.id("agentConfigurations"),
    customPrompt: v.optional(v.string()),
    modelId: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { configurationId, ...updates }) => {
    const existingConfiguration = await ctx.db.get(configurationId);
    if (!existingConfiguration) {
      throw new Error("Configuration not found");
    }

    return await ctx.db.patch(configurationId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteConfiguration = mutation({
  args: { configurationId: v.id("agentConfigurations") },
  handler: async (ctx, { configurationId }) => {
    const existingConfiguration = await ctx.db.get(configurationId);
    if (!existingConfiguration) {
      throw new Error("Configuration not found");
    }

    // Soft delete: imposta isActive a false
    return await ctx.db.patch(configurationId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

export const setActiveConfiguration = mutation({
  args: { configurationId: v.id("agentConfigurations") },
  handler: async (ctx, { configurationId }) => {
    const configuration = await ctx.db.get(configurationId);
    if (!configuration) {
      throw new Error("Configuration not found");
    }

    // Disattiva tutte le altre configurazioni per lo stesso agente
    const otherConfigurations = await ctx.db
      .query("agentConfigurations")
      .withIndex("by_agent", (q) => q.eq("agentId", configuration.agentId))
      .filter((q) => q.neq(q.field("_id"), configurationId))
      .collect();

    const deactivatePromises = otherConfigurations.map(config =>
      ctx.db.patch(config._id, {
        isActive: false,
        updatedAt: Date.now(),
      })
    );

    await Promise.all(deactivatePromises);

    // Attiva la configurazione selezionata
    return await ctx.db.patch(configurationId, {
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});

export const toggleConfigurationActive = mutation({
  args: { configurationId: v.id("agentConfigurations") },
  handler: async (ctx, { configurationId }) => {
    const existingConfiguration = await ctx.db.get(configurationId);
    if (!existingConfiguration) {
      throw new Error("Configuration not found");
    }

    // Se stiamo attivando, disattiva le altre configurazioni per lo stesso agente
    if (!existingConfiguration.isActive) {
      const otherConfigurations = await ctx.db
        .query("agentConfigurations")
        .withIndex("by_agent", (q) => q.eq("agentId", existingConfiguration.agentId))
        .filter((q) => q.neq(q.field("_id"), configurationId))
        .collect();

      const deactivatePromises = otherConfigurations.map(config =>
        ctx.db.patch(config._id, {
          isActive: false,
          updatedAt: Date.now(),
        })
      );

      await Promise.all(deactivatePromises);
    }

    return await ctx.db.patch(configurationId, {
      isActive: !existingConfiguration.isActive,
      updatedAt: Date.now(),
    });
  },
});

// Funzione per duplicare una configurazione
export const duplicateConfiguration = mutation({
  args: {
    configurationId: v.id("agentConfigurations"),
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, { configurationId, userId, agentId }) => {
    const originalConfiguration = await ctx.db.get(configurationId);
    if (!originalConfiguration) {
      throw new Error("Configuration not found");
    }

    const targetAgentId = agentId || originalConfiguration.agentId;
    
    // Verifica che l'agente target sia accessibile
    const agent = await ctx.db.get(targetAgentId);
    if (!agent) {
      throw new Error("Target agent not found");
    }

    if (agent.userId !== userId && !agent.isSystem) {
      throw new Error("Target agent not accessible");
    }

    const now = Date.now();

    return await ctx.db.insert("agentConfigurations", {
      userId,
      agentId: targetAgentId,
      customPrompt: originalConfiguration.customPrompt,
      modelId: originalConfiguration.modelId,
      temperature: originalConfiguration.temperature,
      maxTokens: originalConfiguration.maxTokens,
      isActive: false, // Duplicato non attivo di default
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Funzione per ottenere la configurazione attiva per un agente specifico
export const getActiveConfigurationForAgent = query({
  args: { 
    agentId: v.id("agents"),
    userId: v.id("users"),
  },
  handler: async (ctx, { agentId, userId }) => {
    // Prima cerca configurazioni personalizzate dell'utente
    const userConfig = await ctx.db
      .query("agentConfigurations")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    if (userConfig) {
      return userConfig;
    }

    // Se non trova configurazioni personalizzate, cerca configurazioni di sistema
    const systemConfig = await ctx.db
      .query("agentConfigurations")
      .withIndex("by_agent", (q) => q.eq("agentId", agentId))
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    return systemConfig;
  },
});
