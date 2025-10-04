import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

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

export const getWorkflowWithAgents = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const workflow = await ctx.db.get(workflowId);
    if (!workflow) {
      return null;
    }

    // Ottieni i dettagli degli agenti nel workflow
    const agentDetails = await Promise.all(
      workflow.agentSequence.map(async (step) => {
        const agent = await ctx.db.get(step.agentId);
        return {
          ...step,
          agent: agent,
        };
      })
    );

    return {
      ...workflow,
      agentSequence: agentDetails,
    };
  },
});

// === MUTATION FUNCTIONS ===

export const createWorkflow = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    agentSequence: v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      isActive: v.boolean(),
      conditions: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { userId, name, description, agentSequence }) => {
    const now = Date.now();

    // Verifica che tutti gli agenti esistano e siano accessibili dall'utente
    for (const step of agentSequence) {
      const agent = await ctx.db.get(step.agentId);
      if (!agent) {
        throw new Error(`Agent ${step.agentId} not found`);
      }
      
      // L'agente deve essere dell'utente o essere un agente di sistema
      if (agent.userId !== userId && !agent.isSystem) {
        throw new Error(`Agent ${step.agentId} not accessible`);
      }
    }

    return await ctx.db.insert("workflows", {
      userId,
      name,
      description,
      agentSequence,
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
    agentSequence: v.optional(v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      isActive: v.boolean(),
      conditions: v.optional(v.string()),
    }))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { workflowId, agentSequence, ...updates }) => {
    const existingWorkflow = await ctx.db.get(workflowId);
    if (!existingWorkflow) {
      throw new Error("Workflow not found");
    }

    // Se viene aggiornata la sequenza agenti, verifica che siano validi
    if (agentSequence) {
      for (const step of agentSequence) {
        const agent = await ctx.db.get(step.agentId);
        if (!agent) {
          throw new Error(`Agent ${step.agentId} not found`);
        }
        
        if (agent.userId !== existingWorkflow.userId && !agent.isSystem) {
          throw new Error(`Agent ${step.agentId} not accessible`);
        }
      }
    }

    return await ctx.db.patch(workflowId, {
      ...updates,
      ...(agentSequence && { agentSequence }),
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

    // Soft delete: imposta isActive a false
    return await ctx.db.patch(workflowId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

export const toggleWorkflowActive = mutation({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, { workflowId }) => {
    const existingWorkflow = await ctx.db.get(workflowId);
    if (!existingWorkflow) {
      throw new Error("Workflow not found");
    }

    return await ctx.db.patch(workflowId, {
      isActive: !existingWorkflow.isActive,
      updatedAt: Date.now(),
    });
  },
});

export const updateWorkflowSequence = mutation({
  args: {
    workflowId: v.id("workflows"),
    agentSequence: v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      isActive: v.boolean(),
      conditions: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { workflowId, agentSequence }) => {
    const existingWorkflow = await ctx.db.get(workflowId);
    if (!existingWorkflow) {
      throw new Error("Workflow not found");
    }

    // Verifica che tutti gli agenti siano validi
    for (const step of agentSequence) {
      const agent = await ctx.db.get(step.agentId);
      if (!agent) {
        throw new Error(`Agent ${step.agentId} not found`);
      }
      
      if (agent.userId !== existingWorkflow.userId && !agent.isSystem) {
        throw new Error(`Agent ${step.agentId} not accessible`);
      }
    }

    return await ctx.db.patch(workflowId, {
      agentSequence,
      updatedAt: Date.now(),
    });
  },
});

// Funzione per duplicare un workflow
export const duplicateWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    userId: v.id("users"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, { workflowId, userId, newName }) => {
    const originalWorkflow = await ctx.db.get(workflowId);
    if (!originalWorkflow) {
      throw new Error("Workflow not found");
    }

    const now = Date.now();
    const name = newName || `${originalWorkflow.name} (Copy)`;

    return await ctx.db.insert("workflows", {
      userId,
      name,
      description: originalWorkflow.description,
      agentSequence: originalWorkflow.agentSequence,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Funzione per aggiungere un agente a un workflow
export const addAgentToWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    agentId: v.id("agents"),
    order: v.optional(v.number()),
    conditions: v.optional(v.string()),
  },
  handler: async (ctx, { workflowId, agentId, order, conditions }) => {
    const workflow = await ctx.db.get(workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const agent = await ctx.db.get(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Verifica accesso all'agente
    if (agent.userId !== workflow.userId && !agent.isSystem) {
      throw new Error("Agent not accessible");
    }

    // Se non specificato, assegna l'ordine più alto
    let agentOrder = order;
    if (agentOrder === undefined) {
      const maxOrder = Math.max(...workflow.agentSequence.map(s => s.order), -1);
      agentOrder = maxOrder + 1;
    }

    const newSequence = [
      ...workflow.agentSequence,
      {
        agentId,
        order: agentOrder,
        isActive: true,
        conditions,
      }
    ].sort((a, b) => a.order - b.order);

    return await ctx.db.patch(workflowId, {
      agentSequence: newSequence,
      updatedAt: Date.now(),
    });
  },
});

// Funzione per rimuovere un agente da un workflow
export const removeAgentFromWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, { workflowId, agentId }) => {
    const workflow = await ctx.db.get(workflowId);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const newSequence = workflow.agentSequence.filter(step => step.agentId !== agentId);

    return await ctx.db.patch(workflowId, {
      agentSequence: newSequence,
      updatedAt: Date.now(),
    });
  },
});
