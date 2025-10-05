import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// === QUERY FUNCTIONS ===

export const getAllAgentsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
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

export const getAgentById = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    return await ctx.db.get(agentId);
  },
});

// === MUTATION FUNCTIONS ===

export const createAgent = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    modelId: v.string(),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    let agentOrder = args.order;
    if (agentOrder === undefined) {
      const lastAgent = await ctx.db
        .query("agents")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .first();
      agentOrder = lastAgent ? lastAgent.order + 1 : 0;
    }

    return await ctx.db.insert("agents", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      systemPrompt: args.systemPrompt,
      modelId: args.modelId,
      temperature: args.temperature ?? 0.7,
      maxTokens: args.maxTokens ?? 2000,
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
    systemPrompt: v.optional(v.string()),
    modelId: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { agentId, ...updates }) => {
    const existingAgent = await ctx.db.get(agentId);
    if (!existingAgent) {
      throw new Error("Agent not found");
    }

    if (existingAgent.isSystem) {
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

    if (existingAgent.isSystem) {
      throw new Error("Cannot delete system agents");
    }

    await ctx.db.delete(agentId);
  },
});