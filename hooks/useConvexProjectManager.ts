import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Project, Document } from '../types';
import { Id } from '../convex/_generated/dataModel';

export const useConvexProjectManager = (userId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Query per ottenere i progetti dell'utente
  const projectsData = useQuery(
    api.projects.listProjects,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  // Mutations
  const createProjectMutation = useMutation(api.projects.createProject);
  const updateProjectMutation = useMutation(api.projects.updateProject);
  const deleteProjectMutation = useMutation(api.projects.deleteProject);
  const createDocumentMutation = useMutation(api.projects.createDocument);

  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData);
      setLoading(false);
    }
  }, [projectsData]);

  const addProject = useCallback(async (name: string) => {
    if (!userId) return null;
    
    try {
      const projectId = await createProjectMutation({
        userId: userId as Id<"users">,
        name,
        idea: '', // Progetto vuoto
      });
      
      // Ricarica i progetti dopo la creazione
      // Il query si aggiornerà automaticamente grazie a Convex
      
      return projectId;
    } catch (error) {
      console.error("Failed to create project:", error);
      return null;
    }
  }, [userId, createProjectMutation]);

  const updateProject = useCallback(async (updatedProject: Project) => {
    if (!userId) return;
    
    try {
      await updateProjectMutation({
        projectId: updatedProject.id as Id<"projects">,
        userId: userId as Id<"users">,
        name: updatedProject.name,
        idea: updatedProject.idea,
      });
      
      // Il query si aggiornerà automaticamente
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  }, [userId, updateProjectMutation]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!userId) return;
    
    try {
      await deleteProjectMutation({
        projectId: projectId as Id<"projects">,
        userId: userId as Id<"users">,
      });
      
      // Il query si aggiornerà automaticamente
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  }, [userId, deleteProjectMutation]);

  const getProject = useCallback((projectId: string | null) => {
    if (!projectId || !userId) return null;
    return projects.find(p => p.id === projectId) || null;
  }, [projects, userId]);

  // Funzione per aggiungere documenti a un progetto
  const addDocumentsToProject = useCallback(async (
    projectId: string,
    documents: Document[]
  ) => {
    if (!userId) return;
    
    try {
      for (const doc of documents) {
        await createDocumentMutation({
          projectId: projectId as Id<"projects">,
          userId: userId as Id<"users">,
          category: doc.category,
          content: doc.content,
        });
      }
    } catch (error) {
      console.error("Failed to add documents:", error);
    }
  }, [userId, createDocumentMutation]);

  return { 
    projects, 
    loading, 
    addProject, 
    updateProject, 
    deleteProject, 
    getProject,
    addDocumentsToProject
  };
};
