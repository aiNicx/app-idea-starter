import { Agent, Workflow, WorkflowStep, WorkflowExecutionResult } from '../types/agents';
import { callOpenRouter, OpenRouterModelId } from './openRouterService';

/**
 * Engine per l'esecuzione di workflow con supporto per esecuzione serie e parallela
 */
export class WorkflowEngine {
  /**
   * Esegue un workflow completo
   */
  static async executeWorkflow(
    workflow: Workflow,
    agents: Agent[],
    userInput: string,
    language: string
  ): Promise<WorkflowExecutionResult> {
    try {
      const outputs: Record<number, string> = {};
      const steps = [...workflow.steps].sort((a, b) => a.order - b.order);

      // Raggruppa gli step per order (per gestire esecuzione parallela)
      const stepGroups = this.groupStepsByOrder(steps);

      // Esegui ogni gruppo di step
      for (const group of stepGroups) {
        const groupOutputs = await this.executeStepGroup(group, agents, userInput, outputs, language);
        Object.assign(outputs, groupOutputs);
      }

      return {
        success: true,
        outputs
      };
    } catch (error) {
      console.error('Workflow execution error:', error);

      // Se è un errore di rate limiting, mantienilo così com'è per mostrare il messaggio corretto
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        return {
          success: false,
          outputs: {},
          error: error.message
        };
      }

      return {
        success: false,
        outputs: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Raggruppa gli step per order
   */
  private static groupStepsByOrder(steps: WorkflowStep[]): WorkflowStep[][] {
    const groups: Map<number, WorkflowStep[]> = new Map();

    for (const step of steps) {
      if (!groups.has(step.order)) {
        groups.set(step.order, []);
      }
      groups.get(step.order)!.push(step);
    }

    return Array.from(groups.values()).sort((a, b) => a[0].order - b[0].order);
  }

  /**
   * Esegue un gruppo di step (potenzialmente in parallelo)
   */
  private static async executeStepGroup(
    steps: WorkflowStep[],
    agents: Agent[],
    userInput: string,
    previousOutputs: Record<number, string>,
    language: string
  ): Promise<Record<number, string>> {
    const parallelSteps = steps.filter(s => s.executeInParallel);
    const serialSteps = steps.filter(s => !s.executeInParallel);

    const outputs: Record<number, string> = {};

    // Esegui step in parallelo
    if (parallelSteps.length > 0) {
      const parallelPromises = parallelSteps.map(step =>
        this.executeStep(step, agents, userInput, previousOutputs, language)
      );
      
      const parallelResults = await Promise.all(parallelPromises);
      parallelSteps.forEach((step, index) => {
        outputs[step.order] = parallelResults[index];
      });
    }

    // Esegui step in serie CON DELAY per rispettare rate limit
    for (let i = 0; i < serialSteps.length; i++) {
      const step = serialSteps[i];
      
      // Aggiungi delay tra le chiamate (tranne per il primo step)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondi di delay
      }
      
      const output = await this.executeStep(step, agents, userInput, { ...previousOutputs, ...outputs }, language);
      outputs[step.order] = output;
    }

    return outputs;
  }

  /**
   * Esegue un singolo step
   */
  private static async executeStep(
    step: WorkflowStep,
    agents: Agent[],
    userInput: string,
    previousOutputs: Record<number, string>,
    language: string
  ): Promise<string> {
    const agent = agents.find(a => a._id === step.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agentId}`);
    }

    // Determina l'input per questo step
    let stepInput: string;
    if (step.useOutputFrom !== undefined && previousOutputs[step.useOutputFrom]) {
      stepInput = previousOutputs[step.useOutputFrom];
    } else {
      stepInput = userInput;
    }

    // Costruisci il prompt completo
    const systemPrompt = agent.systemPrompt.replace(/\{\{input\}\}/g, stepInput);
    const fullPrompt = `${systemPrompt}\n\nUser input: ${stepInput}`;

    // Esegui la chiamata all'LLM
    const response = await callOpenRouter(
      fullPrompt,
      agent.modelId as OpenRouterModelId
    );

    return response;
  }

  /**
   * Ottiene l'output finale del workflow (ultimo step eseguito)
   */
  static getFinalOutput(result: WorkflowExecutionResult): string {
    if (!result.success || Object.keys(result.outputs).length === 0) {
      return '';
    }

    const maxOrder = Math.max(...Object.keys(result.outputs).map(Number));
    return result.outputs[maxOrder];
  }

  /**
   * Ottiene tutti gli output del workflow
   */
  static getAllOutputs(result: WorkflowExecutionResult): string[] {
    if (!result.success) {
      return [];
    }

    return Object.entries(result.outputs)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([_, output]) => output);
  }
}
