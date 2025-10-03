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
});
