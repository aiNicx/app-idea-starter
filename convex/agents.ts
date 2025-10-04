import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// === QUERY FUNCTIONS ===

export const getAgentsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const getSystemAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_system", (q) => q.eq("isSystem", true))
      .order("asc")
      .collect();
  },
});

export const getAgentById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    return await ctx.db.get(agentId);
  },
});

export const getActiveAgentsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .order("asc")
      .collect();
  },
});

export const getAllAgentsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Ottiene sia agenti personalizzati che predefiniti
    const [userAgents, systemAgents] = await Promise.all([
      ctx.db
        .query("agents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("asc")
        .collect(),
      ctx.db
        .query("agents")
        .withIndex("by_system", (q) => q.eq("isSystem", true))
        .order("asc")
        .collect(),
    ]);

    return [...userAgents, ...systemAgents].sort((a, b) => a.order - b.order);
  },
});

// === MUTATION FUNCTIONS ===

export const createAgent = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    persona: v.string(),
    icon: v.string(),
    promptTemplate: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { userId, name, description, persona, icon, promptTemplate, order }) => {
    const now = Date.now();
    
    // Se non specificato, assegna l'ordine più alto
    let agentOrder = order;
    if (agentOrder === undefined) {
      const lastAgent = await ctx.db
        .query("agents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .first();
      agentOrder = lastAgent ? lastAgent.order + 1 : 0;
    }

    return await ctx.db.insert("agents", {
      userId,
      name,
      description,
      persona,
      icon,
      promptTemplate,
      isActive: true,
      isSystem: false,
      order: agentOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    persona: v.optional(v.string()),
    icon: v.optional(v.string()),
    promptTemplate: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isSystem: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { agentId, ...updates }) => {
    const existingAgent = await ctx.db.get(agentId);
    if (!existingAgent) {
      throw new Error("Agent not found");
    }

    // Non permettere modifiche agli agenti di sistema, tranne per isSystem durante la migrazione
    if (existingAgent.isSystem && !updates.hasOwnProperty('isSystem')) {
      throw new Error("Cannot modify system agents");
    }

    return await ctx.db.patch(agentId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    const existingAgent = await ctx.db.get(agentId);
    if (!existingAgent) {
      throw new Error("Agent not found");
    }

    // Non permettere eliminazione degli agenti di sistema
    if (existingAgent.isSystem) {
      throw new Error("Cannot delete system agents");
    }

    // Soft delete: imposta isActive a false
    return await ctx.db.patch(agentId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

export const toggleAgentActive = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    const existingAgent = await ctx.db.get(agentId);
    if (!existingAgent) {
      throw new Error("Agent not found");
    }

    return await ctx.db.patch(agentId, {
      isActive: !existingAgent.isActive,
      updatedAt: Date.now(),
    });
  },
});

export const reorderAgents = mutation({
  args: {
    userId: v.id("users"),
    agentOrders: v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
    })),
  },
  handler: async (ctx, { userId, agentOrders }) => {
    // Verifica che tutti gli agenti appartengano all'utente
    for (const { agentId } of agentOrders) {
      const agent = await ctx.db.get(agentId);
      if (!agent || agent.userId !== userId) {
        throw new Error(`Agent ${agentId} not found or not owned by user`);
      }
    }

    // Aggiorna gli ordini
    const updatePromises = agentOrders.map(({ agentId, order }) =>
      ctx.db.patch(agentId, {
        order,
        updatedAt: Date.now(),
      })
    );

    await Promise.all(updatePromises);
    return { success: true };
  },
});

// Funzione per duplicare un agente
export const duplicateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    userId: v.id("users"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, { agentId, userId, newName }) => {
    const originalAgent = await ctx.db.get(agentId);
    if (!originalAgent) {
      throw new Error("Agent not found");
    }

    const now = Date.now();
    const name = newName || `${originalAgent.name} (Copy)`;

    // Trova il prossimo ordine disponibile
    const lastAgent = await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    const nextOrder = lastAgent ? lastAgent.order + 1 : 0;

    return await ctx.db.insert("agents", {
      userId,
      name,
      description: originalAgent.description,
      persona: originalAgent.persona,
      icon: originalAgent.icon,
      promptTemplate: originalAgent.promptTemplate,
      isActive: true,
      isSystem: false,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});
