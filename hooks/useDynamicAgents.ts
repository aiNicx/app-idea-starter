import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Agent, Workflow, AgentConfiguration, AgentExecutionContext, WorkflowExecutionContext } from '../types/agents';
import { Document } from '../types';
import { DynamicAgentService } from '../services/dynamicAgentService';

/**
 * Hook per inizializzare il DynamicAgentService
 */
export const useDynamicAgentService = (convexUrl: string) => {
  useEffect(() => {
    DynamicAgentService.initializeConvex(convexUrl);
  }, [convexUrl]);
};

/**
 * Hook per gestire gli agenti di un utente
 */
export const useAgents = (userId: Id<"users">) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const agents = useQuery("agents:getAgentsByUser" as any, { userId });
  const systemAgents = useQuery("agents:getSystemAgents" as any);
  const allAgents = useQuery("agents:getAllAgentsForUser" as any, { userId });
  const activeAgents = useQuery("agents:getActiveAgentsByUser" as any, { userId });

  const createAgent = useMutation("agents:createAgent" as any);
  const updateAgent = useMutation("agents:updateAgent" as any);
  const deleteAgent = useMutation("agents:deleteAgent" as any);
  const toggleAgentActive = useMutation("agents:toggleAgentActive" as any);
  const reorderAgents = useMutation("agents:reorderAgents" as any);
  const duplicateAgent = useMutation("agents:duplicateAgent" as any);

  const handleCreateAgent = useCallback(async (agentData: {
    name: string;
    description: string;
    persona: string;
    icon: string;
    promptTemplate: string;
    order?: number;
  }) => {
    try {
      return await createAgent({
        userId,
        ...agentData,
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }, [createAgent, userId]);

  const handleUpdateAgent = useCallback(async (agentId: Id<"agents">, updates: {
    name?: string;
    description?: string;
    persona?: string;
    icon?: string;
    promptTemplate?: string;
    isActive?: boolean;
    order?: number;
  }) => {
    try {
      return await updateAgent({
        agentId,
        ...updates,
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }, [updateAgent]);

  const handleDeleteAgent = useCallback(async (agentId: Id<"agents">) => {
    try {
      return await deleteAgent({ agentId });
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }, [deleteAgent]);

  const handleToggleAgentActive = useCallback(async (agentId: Id<"agents">) => {
    try {
      return await toggleAgentActive({ agentId });
    } catch (error) {
      console.error('Error toggling agent active:', error);
      throw error;
    }
  }, [toggleAgentActive]);

  const handleReorderAgents = useCallback(async (agentOrders: Array<{
    agentId: Id<"agents">;
    order: number;
  }>) => {
    try {
      return await reorderAgents({ userId, agentOrders });
    } catch (error) {
      console.error('Error reordering agents:', error);
      throw error;
    }
  }, [reorderAgents, userId]);

  const handleDuplicateAgent = useCallback(async (agentId: Id<"agents">, newName?: string) => {
    try {
      return await duplicateAgent({ agentId, userId, newName });
    } catch (error) {
      console.error('Error duplicating agent:', error);
      throw error;
    }
  }, [duplicateAgent, userId]);

  return {
    agents: agents || [],
    systemAgents: systemAgents || [],
    allAgents: allAgents || [],
    activeAgents: activeAgents || [],
    selectedAgent,
    setSelectedAgent,
    createAgent: handleCreateAgent,
    updateAgent: handleUpdateAgent,
    deleteAgent: handleDeleteAgent,
    toggleAgentActive: handleToggleAgentActive,
    reorderAgents: handleReorderAgents,
    duplicateAgent: handleDuplicateAgent,
    isLoading: agents === undefined,
  };
};

/**
 * Hook per gestire i workflow di un utente
 */
export const useWorkflows = (userId: Id<"users">) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  const workflows = useQuery("workflows:getWorkflowsByUser" as any, { userId });
  const activeWorkflows = useQuery("workflows:getActiveWorkflowsByUser" as any, { userId });

  const createWorkflow = useMutation("workflows:createWorkflow" as any);
  const updateWorkflow = useMutation("workflows:updateWorkflow" as any);
  const deleteWorkflow = useMutation("workflows:deleteWorkflow" as any);
  const toggleWorkflowActive = useMutation("workflows:toggleWorkflowActive" as any);
  const updateWorkflowSequence = useMutation("workflows:updateWorkflowSequence" as any);
  const duplicateWorkflow = useMutation("workflows:duplicateWorkflow" as any);
  const addAgentToWorkflow = useMutation("workflows:addAgentToWorkflow" as any);
  const removeAgentFromWorkflow = useMutation("workflows:removeAgentFromWorkflow" as any);

  const handleCreateWorkflow = useCallback(async (workflowData: {
    name: string;
    description: string;
    agentSequence: Array<{
      agentId: Id<"agents">;
      order: number;
      isActive: boolean;
      conditions?: string;
    }>;
  }) => {
    try {
      return await createWorkflow({
        userId,
        ...workflowData,
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }, [createWorkflow, userId]);

  const handleUpdateWorkflow = useCallback(async (workflowId: Id<"workflows">, updates: {
    name?: string;
    description?: string;
    agentSequence?: Array<{
      agentId: Id<"agents">;
      order: number;
      isActive: boolean;
      conditions?: string;
    }>;
    isActive?: boolean;
  }) => {
    try {
      return await updateWorkflow({
        workflowId,
        ...updates,
      });
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }, [updateWorkflow]);

  const handleDeleteWorkflow = useCallback(async (workflowId: Id<"workflows">) => {
    try {
      return await deleteWorkflow({ workflowId });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }, [deleteWorkflow]);

  const handleToggleWorkflowActive = useCallback(async (workflowId: Id<"workflows">) => {
    try {
      return await toggleWorkflowActive({ workflowId });
    } catch (error) {
      console.error('Error toggling workflow active:', error);
      throw error;
    }
  }, [toggleWorkflowActive]);

  const handleUpdateWorkflowSequence = useCallback(async (workflowId: Id<"workflows">, agentSequence: Array<{
    agentId: Id<"agents">;
    order: number;
    isActive: boolean;
    conditions?: string;
  }>) => {
    try {
      return await updateWorkflowSequence({ workflowId, agentSequence });
    } catch (error) {
      console.error('Error updating workflow sequence:', error);
      throw error;
    }
  }, [updateWorkflowSequence]);

  const handleDuplicateWorkflow = useCallback(async (workflowId: Id<"workflows">, newName?: string) => {
    try {
      return await duplicateWorkflow({ workflowId, userId, newName });
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      throw error;
    }
  }, [duplicateWorkflow, userId]);

  const handleAddAgentToWorkflow = useCallback(async (workflowId: Id<"workflows">, agentId: Id<"agents">, order?: number, conditions?: string) => {
    try {
      return await addAgentToWorkflow({ workflowId, agentId, order, conditions });
    } catch (error) {
      console.error('Error adding agent to workflow:', error);
      throw error;
    }
  }, [addAgentToWorkflow]);

  const handleRemoveAgentFromWorkflow = useCallback(async (workflowId: Id<"workflows">, agentId: Id<"agents">) => {
    try {
      return await removeAgentFromWorkflow({ workflowId, agentId });
    } catch (error) {
      console.error('Error removing agent from workflow:', error);
      throw error;
    }
  }, [removeAgentFromWorkflow]);

  return {
    workflows: workflows || [],
    activeWorkflows: activeWorkflows || [],
    selectedWorkflow,
    setSelectedWorkflow,
    createWorkflow: handleCreateWorkflow,
    updateWorkflow: handleUpdateWorkflow,
    deleteWorkflow: handleDeleteWorkflow,
    toggleWorkflowActive: handleToggleWorkflowActive,
    updateWorkflowSequence: handleUpdateWorkflowSequence,
    duplicateWorkflow: handleDuplicateWorkflow,
    addAgentToWorkflow: handleAddAgentToWorkflow,
    removeAgentFromWorkflow: handleRemoveAgentFromWorkflow,
    isLoading: workflows === undefined,
  };
};

/**
 * Hook per gestire le configurazioni degli agenti
 */
export const useAgentConfigurations = (userId: Id<"users">) => {
  const [selectedConfiguration, setSelectedConfiguration] = useState<AgentConfiguration | null>(null);
  
  const configurations = useQuery("agentConfigurations:getConfigurationsByUser" as any, { userId });
  const activeConfigurations = useQuery("agentConfigurations:getActiveConfigurationsByUser" as any, { userId });

  const createConfiguration = useMutation("agentConfigurations:createConfiguration" as any);
  const updateConfiguration = useMutation("agentConfigurations:updateConfiguration" as any);
  const deleteConfiguration = useMutation("agentConfigurations:deleteConfiguration" as any);
  const setActiveConfiguration = useMutation("agentConfigurations:setActiveConfiguration" as any);
  const toggleConfigurationActive = useMutation("agentConfigurations:toggleConfigurationActive" as any);
  const duplicateConfiguration = useMutation("agentConfigurations:duplicateConfiguration" as any);

  const handleCreateConfiguration = useCallback(async (configurationData: {
    agentId: Id<"agents">;
    customPrompt?: string;
    modelId: string;
    temperature: number;
    maxTokens: number;
  }) => {
    try {
      return await createConfiguration({
        userId,
        ...configurationData,
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw error;
    }
  }, [createConfiguration, userId]);

  const handleUpdateConfiguration = useCallback(async (configurationId: Id<"agentConfigurations">, updates: {
    customPrompt?: string;
    modelId?: string;
    temperature?: number;
    maxTokens?: number;
    isActive?: boolean;
  }) => {
    try {
      return await updateConfiguration({
        configurationId,
        ...updates,
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }, [updateConfiguration]);

  const handleDeleteConfiguration = useCallback(async (configurationId: Id<"agentConfigurations">) => {
    try {
      return await deleteConfiguration({ configurationId });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      throw error;
    }
  }, [deleteConfiguration]);

  const handleSetActiveConfiguration = useCallback(async (configurationId: Id<"agentConfigurations">) => {
    try {
      return await setActiveConfiguration({ configurationId });
    } catch (error) {
      console.error('Error setting active configuration:', error);
      throw error;
    }
  }, [setActiveConfiguration]);

  const handleToggleConfigurationActive = useCallback(async (configurationId: Id<"agentConfigurations">) => {
    try {
      return await toggleConfigurationActive({ configurationId });
    } catch (error) {
      console.error('Error toggling configuration active:', error);
      throw error;
    }
  }, [toggleConfigurationActive]);

  const handleDuplicateConfiguration = useCallback(async (configurationId: Id<"agentConfigurations">, agentId?: Id<"agents">) => {
    try {
      return await duplicateConfiguration({ configurationId, userId, agentId });
    } catch (error) {
      console.error('Error duplicating configuration:', error);
      throw error;
    }
  }, [duplicateConfiguration, userId]);

  return {
    configurations: configurations || [],
    activeConfigurations: activeConfigurations || [],
    selectedConfiguration,
    setSelectedConfiguration,
    createConfiguration: handleCreateConfiguration,
    updateConfiguration: handleUpdateConfiguration,
    deleteConfiguration: handleDeleteConfiguration,
    setActiveConfiguration: handleSetActiveConfiguration,
    toggleConfigurationActive: handleToggleConfigurationActive,
    duplicateConfiguration: handleDuplicateConfiguration,
    isLoading: configurations === undefined,
  };
};

/**
 * Hook per eseguire agenti e workflow
 */
export const useAgentExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<{
    currentStep: number;
    totalSteps: number;
    currentAgent?: string;
    status: 'idle' | 'running' | 'completed' | 'error';
  }>({
    currentStep: 0,
    totalSteps: 0,
    status: 'idle',
  });

  const executeAgent = useCallback(async (
    agent: Agent,
    context: AgentExecutionContext
  ): Promise<string> => {
    setIsExecuting(true);
    setExecutionProgress({
      currentStep: 1,
      totalSteps: 1,
      currentAgent: agent.name,
      status: 'running',
    });

    try {
      const result = await DynamicAgentService.executeAgent(agent, context);
      
      setExecutionProgress(prev => ({
        ...prev,
        status: 'completed',
      }));
      
      return result;
    } catch (error) {
      setExecutionProgress(prev => ({
        ...prev,
        status: 'error',
      }));
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const executeWorkflow = useCallback(async (
    workflow: Workflow,
    context: WorkflowExecutionContext
  ): Promise<Document[]> => {
    setIsExecuting(true);
    setExecutionProgress({
      currentStep: 0,
      totalSteps: workflow.agentSequence.filter(step => step.isActive).length,
      status: 'running',
    });

    try {
      const documents = await DynamicAgentService.executeWorkflow(workflow, context);
      
      setExecutionProgress(prev => ({
        ...prev,
        status: 'completed',
      }));
      
      return documents;
    } catch (error) {
      setExecutionProgress(prev => ({
        ...prev,
        status: 'error',
      }));
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const resetExecution = useCallback(() => {
    setExecutionProgress({
      currentStep: 0,
      totalSteps: 0,
      status: 'idle',
    });
  }, []);

  return {
    isExecuting,
    executionProgress,
    executeAgent,
    executeWorkflow,
    resetExecution,
  };
};

/**
 * Hook per la migrazione degli agenti predefiniti
 */
export const useMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);

  const runMigration = useMutation("migrations:runFullMigration" as any);
  const checkStatus = useMutation("migrations:checkMigrationStatus" as any);
  const rollbackMigration = useMutation("migrations:rollbackMigration" as any);

  const handleRunMigration = useCallback(async () => {
    setIsMigrating(true);
    try {
      const result = await runMigration({});
      setMigrationStatus(result);
      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      setIsMigrating(false);
    }
  }, [runMigration]);

  const handleCheckStatus = useCallback(async () => {
    try {
      const status = await checkStatus({});
      setMigrationStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check migration status:', error);
      throw error;
    }
  }, [checkStatus]);

  const handleRollback = useCallback(async () => {
    setIsMigrating(true);
    try {
      const result = await rollbackMigration({});
      setMigrationStatus(result);
      return result;
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    } finally {
      setIsMigrating(false);
    }
  }, [rollbackMigration]);

  return {
    isMigrating,
    migrationStatus,
    runMigration: handleRunMigration,
    checkStatus: handleCheckStatus,
    rollbackMigration: handleRollback,
  };
};
