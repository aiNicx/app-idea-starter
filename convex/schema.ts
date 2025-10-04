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
    description: v.string(),
    persona: v.string(),
    icon: v.string(), // Nome dell'icona (es. "WandIcon")
    promptTemplate: v.string(),
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
    agentSequence: v.array(v.object({
      agentId: v.id("agents"),
      order: v.number(),
      isActive: v.boolean(),
      conditions: v.optional(v.string()), // JSON string per logica condizionale
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "isActive"]),

  // Tabella configurazioni per agenti
  agentConfigurations: defineTable({
    userId: v.id("users"),
    agentId: v.id("agents"),
    customPrompt: v.optional(v.string()),
    modelId: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_agent", ["agentId"])
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "isActive"]),
});
