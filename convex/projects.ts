import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Tipi per compatibilità con l'interfaccia esistente
export interface Project {
  id: string;
  name: string;
  idea: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  category: string;
  content: string;
}

// Creare nuovo progetto
export const createProject = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    idea: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, name, idea } = args;
    const now = Date.now();
    
    const projectId = await ctx.db.insert("projects", {
      userId,
      name,
      idea,
      createdAt: now,
      updatedAt: now,
    });
    
    return projectId;
  },
});

// Lista progetti utente
export const listProjects = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    // Per ogni progetto, carica i documenti associati
    const projectsWithDocuments = await Promise.all(
      projects.map(async (project) => {
        const documents = await ctx.db
          .query("documents")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .order("asc")
          .collect();
        
        return {
          id: project._id,
          name: project.name,
          idea: project.idea,
          documents: documents.map(doc => ({
            id: doc._id,
            title: (doc as any).title,
            category: doc.category,
            content: doc.content,
          })),
          createdAt: new Date(project.createdAt).toISOString(),
          updatedAt: new Date(project.updatedAt).toISOString(),
        };
      })
    );
    
    return projectsWithDocuments;
  },
});

// Ottenere singolo progetto
export const getProject = query({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { projectId, userId } = args;
    
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) {
      return null;
    }
    
    // Carica documenti associati
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .order("asc")
      .collect();
    
    return {
      id: project._id,
      name: project.name,
      idea: project.idea,
      documents: documents.map(doc => ({
        id: doc._id,
        title: (doc as any).title,
        category: doc.category,
        content: doc.content,
      })),
      createdAt: new Date(project.createdAt).toISOString(),
      updatedAt: new Date(project.updatedAt).toISOString(),
    };
  },
});

// Aggiornare progetto
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    idea: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectId, userId, name, idea } = args;
    
    // Verifica proprietario
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (idea !== undefined) updateData.idea = idea;
    
    await ctx.db.patch(projectId, updateData);
    
    return { success: true };
  },
});

// Eliminare progetto
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { projectId, userId } = args;
    
    // Verifica proprietario
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    // Elimina tutti i documenti associati
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    
    for (const doc of documents) {
      await ctx.db.delete(doc._id);
    }
    
    // Elimina progetto
    await ctx.db.delete(projectId);
    
    return { success: true };
  },
});

// Creare documento
export const createDocument = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    category: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { projectId, userId, title, category, content } = args;
    
    // Verifica proprietario progetto
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    const now = Date.now();

    // Evita duplicati: se esiste già un documento con stesso titolo e contenuto per il progetto
    if (title) {
      const existing = await ctx.db
        .query("documents")
        .withIndex("by_project_title", (q) => q.eq("projectId", projectId).eq("title", title))
        .first();
      if (existing && existing.content === content) {
        return existing._id;
      }
    }

    const documentId = await ctx.db.insert("documents", {
      projectId,
      title,
      category,
      content,
      createdAt: now,
    });
    
    // Aggiorna timestamp progetto
    await ctx.db.patch(projectId, {
      updatedAt: now,
    });
    
    return documentId;
  },
});

// Aggiornare documento
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { documentId, userId, content } = args;
    
    // Verifica accesso al documento
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const project = await ctx.db.get(document.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Access denied");
    }
    
    // Aggiorna documento
    await ctx.db.patch(documentId, {
      content,
    });
    
    // Aggiorna timestamp progetto
    await ctx.db.patch(document.projectId, {
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Eliminare documento
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { documentId, userId } = args;
    
    // Verifica accesso al documento
    const document = await ctx.db.get(documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const project = await ctx.db.get(document.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Access denied");
    }
    
    // Elimina documento
    await ctx.db.delete(documentId);
    
    // Aggiorna timestamp progetto
    await ctx.db.patch(document.projectId, {
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
