import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// === QUERY FUNCTIONS ===

export const getWorkflowsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getWorkflowById = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    return await ctx.db.get(workflowId);
  },
});

export const getActiveWorkflowsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .order("desc")
      .collect();
  },
});

// === MUTATION FUNCTIONS ===

export const createWorkflow = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    steps: v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      executeInParallel: v.boolean(),
      useOutputFrom: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("workflows", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      steps: args.steps,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    steps: v.optional(v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      executeInParallel: v.boolean(),
      useOutputFrom: v.optional(v.number()),
    }))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { workflowId, ...updates }) => {
    const existingWorkflow = await ctx.db.get(workflowId);
    if (!existingWorkflow) {
      throw new Error("Workflow not found");
    }

    return await ctx.db.patch(workflowId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteWorkflow = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const existingWorkflow = await ctx.db.get(workflowId);
    if (!existingWorkflow) {
      throw new Error("Workflow not found");
    }

    await ctx.db.delete(workflowId);
  },
});