
import { useState, useEffect, useCallback } from 'react';
import { Project } from '../types';

const STORAGE_KEY = 'docugenius_projects';

export const useProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAndSave = useCallback((updateFn: (prev: Project[]) => Project[]) => {
      setProjects(prevProjects => {
          const newProjects = updateFn(prevProjects);
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
          } catch (error) {
              console.error("Failed to save projects to localStorage", error);
          }
          return newProjects;
      });
  }, []);

  const addProject = useCallback((name: string) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: name,
      idea: '',
      documents: [],
      createdAt: now,
      updatedAt: now,
    };
    updateAndSave(prevProjects => [newProject, ...prevProjects]);
    return newProject.id;
  }, [updateAndSave]);

  const updateProject = useCallback((updatedProject: Project) => {
    const now = new Date().toISOString();
    updateAndSave(prevProjects => 
      prevProjects.map(p => 
        p.id === updatedProject.id ? { ...updatedProject, updatedAt: now } : p
      )
    );
  }, [updateAndSave]);

  const deleteProject = useCallback((projectId: string) => {
    updateAndSave(prevProjects => prevProjects.filter(p => p.id !== projectId));
  }, [updateAndSave]);
  
  const getProject = useCallback((projectId: string | null) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId) || null;
  }, [projects]);


  return { projects, loading, addProject, updateProject, deleteProject, getProject };
};
