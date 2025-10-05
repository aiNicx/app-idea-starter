import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Agent, Workflow } from '../types/agents';

/**
 * Hook semplificato per gestire agenti e workflow
 */
export const useDynamicAgents = (userId: string | null) => {
  const agents = useQuery(
    api.agents.getAllAgentsForUser,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  const workflows = useQuery(
    api.workflows.getWorkflowsByUser,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  const createAgentMutation = useMutation(api.agents.createAgent);
  const updateAgentMutation = useMutation(api.agents.updateAgent);
  const deleteAgentMutation = useMutation(api.agents.deleteAgent);
  
  const createWorkflowMutation = useMutation(api.workflows.createWorkflow);
  const updateWorkflowMutation = useMutation(api.workflows.updateWorkflow);
  const deleteWorkflowMutation = useMutation(api.workflows.deleteWorkflow);

  const createAgent = async (agent: Partial<Agent>) => {
    if (!userId) return null;

    return await createAgentMutation({
      userId: userId as Id<"users">,
      name: agent.name!,
      description: agent.description!,
      systemPrompt: agent.systemPrompt!,
      modelId: agent.modelId!,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      order: agent.order
    });
  };

  const updateAgent = async (agentId: Id<"agents">, updates: Partial<Agent>) => {
    return await updateAgentMutation({
      agentId,
      name: updates.name,
      description: updates.description,
      systemPrompt: updates.systemPrompt,
      modelId: updates.modelId,
      temperature: updates.temperature,
      maxTokens: updates.maxTokens,
      isActive: updates.isActive,
      order: updates.order
    });
  };

  const deleteAgent = async (agentId: Id<"agents">) => {
    return await deleteAgentMutation({ agentId });
  };

  const createWorkflow = async (workflow: Partial<Workflow>) => {
    if (!userId) return null;

    return await createWorkflowMutation({
      userId: userId as Id<"users">,
      name: workflow.name!,
      description: workflow.description!,
      steps: workflow.steps!
    });
  };

  const updateWorkflow = async (workflowId: Id<"workflows">, updates: Partial<Workflow>) => {
    if (!userId) return;

    return await updateWorkflowMutation({
      workflowId,
      name: updates.name,
      description: updates.description,
      steps: updates.steps,
      isActive: updates.isActive
    });
  };

  const deleteWorkflow = async (workflowId: Id<"workflows">) => {
    if (!userId) return;

    return await deleteWorkflowMutation({ workflowId });
  };

  const executeWorkflow = useCallback(async (workflow: Workflow, userInput: string) => {
    if (!userId) return null;

    try {
      const { WorkflowEngine } = await import('../services/workflowEngine');
      const result = await WorkflowEngine.executeWorkflow(
        workflow,
        agents || [],
        userInput,
        'it' // Default language, potrebbe essere passato come parametro
      );

      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }, [userId, agents]);

  return {
    agents: agents || [],
    workflows: workflows || [],
    createAgent,
    updateAgent,
    deleteAgent,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    isLoading: agents === undefined || workflows === undefined
  };
};