import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabella utenti per autenticazione
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    language: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // Tabella progetti (con relazione user)
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    idea: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Tabella documenti (con relazione project)
  documents: defineTable({
    projectId: v.id("projects"),
    category: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // === SISTEMA AGENTI MODULARE ===
  
  // Tabella agenti personalizzati e predefiniti
  agents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(), // Descrizione dell'agente
    systemPrompt: v.string(), // System prompt dell'agente
    modelId: v.string(), // Modello LLM da usare
    temperature: v.optional(v.number()), // Default 0.7
    maxTokens: v.optional(v.number()), // Default 2000
    isActive: v.boolean(),
    isSystem: v.boolean(), // true per agenti predefiniti
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "isActive"])
  .index("by_system", ["isSystem"]),

  // Tabella workflow per sequenze di agenti
  workflows: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    steps: v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      executeInParallel: v.boolean(), // true = esegue in parallelo con step successivi dello stesso order
      useOutputFrom: v.optional(v.number()), // order dello step da cui prendere l'output
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "isActive"]),
});
