import { action } from "./_generated/server";
import { v } from "convex/values";
import { agentProfiles } from "../lib/agentPrompts";

/**
 * Migra gli agenti predefiniti da agentPrompts.ts al database
 */
export const migrateDefaultAgents = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration of default agents...");

    // Verifica se gli agenti di sistema sono già stati migrati
    const existingSystemAgents = await ctx.runQuery("agents:getSystemAgents" as any);
    
    if (existingSystemAgents.length > 0) {
      console.log("System agents already migrated, skipping...");
      return { success: true, message: "Agents already migrated" };
    }

    const now = Date.now();
    const systemUserId = "system" as any; // ID speciale per agenti di sistema

    try {
      // Migra ogni agente predefinito
      const agentIds: string[] = [];
      
      for (let i = 0; i < agentProfiles.length; i++) {
        const profile = agentProfiles[i];
        
        const agentId = await ctx.runMutation("agents:createAgent" as any, {
          userId: systemUserId,
          name: profile.name,
          description: profile.description({ 
            productManager: "Product Manager",
            orchestrator: "Orchestrator",
            frontendDev: "Frontend Developer", 
            uiUxDesigner: "UI/UX Designer",
            backendArchitect: "Backend Architect",
            dbAdmin: "Database Administrator"
          } as any),
          persona: profile.persona({ 
            productManager: "Product Manager",
            orchestrator: "Orchestrator",
            frontendDev: "Frontend Developer", 
            uiUxDesigner: "UI/UX Designer",
            backendArchitect: "Backend Architect",
            dbAdmin: "Database Administrator"
          } as any),
          icon: profile.icon.name,
          promptTemplate: profile.getPrompt({
            idea: "{{idea}}",
            langInstruction: "{{langInstruction}}",
            frontendDoc: "{{frontendDoc}}",
            backendDoc: "{{backendDoc}}",
          }),
          order: i,
        });

        // Aggiorna l'agente per impostarlo come sistema
        await ctx.runMutation("agents:updateAgent" as any, {
          agentId,
          isSystem: true,
        });

        agentIds.push(agentId);
        console.log(`Migrated agent: ${profile.name}`);
      }

      // Crea il workflow predefinito che replica il flusso attuale
      const defaultWorkflowId = await ctx.runMutation("workflows:createWorkflow" as any, {
        userId: systemUserId,
        name: "Default Documentation Workflow",
        description: "Standard workflow for generating app documentation",
        agentSequence: [
          {
            agentId: agentIds[0], // ideaEnhancerAgent
            order: 0,
            isActive: true,
          },
          {
            agentId: agentIds[2], // generateFrontendDoc
            order: 1,
            isActive: true,
          },
          {
            agentId: agentIds[3], // generateCssSpec
            order: 2,
            isActive: true,
          },
          {
            agentId: agentIds[4], // generateBackendDoc
            order: 3,
            isActive: true,
          },
          {
            agentId: agentIds[5], // generateDbSchema
            order: 4,
            isActive: true,
          },
        ],
      });

      // Aggiorna il workflow per impostarlo come sistema
      await ctx.runMutation("workflows:updateWorkflow" as any, {
        workflowId: defaultWorkflowId,
        isSystem: true,
      });

      console.log("Migration completed successfully!");
      return { 
        success: true, 
        message: "Default agents and workflow migrated successfully",
        agentIds,
        workflowId: defaultWorkflowId,
      };

    } catch (error) {
      console.error("Migration failed:", error);
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Crea configurazioni di default per gli agenti di sistema
 */
export const createDefaultConfigurations = action({
  args: {},
  handler: async (ctx) => {
    console.log("Creating default configurations...");

    const systemAgents = await ctx.runQuery("agents:getSystemAgents" as any);
    
    if (systemAgents.length === 0) {
      throw new Error("No system agents found. Run migrateDefaultAgents first.");
    }

    const systemUserId = "system" as any;
    const now = Date.now();

    try {
      for (const agent of systemAgents) {
        // Crea una configurazione di default per ogni agente di sistema
        await ctx.runMutation("agentConfigurations:createConfiguration" as any, {
          userId: systemUserId,
          agentId: agent._id,
          modelId: "google/gemini-2.0-flash-exp:free",
          temperature: 0.7,
          maxTokens: 4000,
        });

        console.log(`Created default configuration for agent: ${agent.name}`);
      }

      return { 
        success: true, 
        message: "Default configurations created successfully",
        count: systemAgents.length,
      };

    } catch (error) {
      console.error("Failed to create default configurations:", error);
      throw new Error(`Failed to create default configurations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Esegue la migrazione completa
 */
export const runFullMigration = action({
  args: {},
  handler: async (ctx) => {
    console.log("Running full migration...");

    try {
      // 1. Migra agenti predefiniti
      const agentsResult = await ctx.runAction("migrations:migrateDefaultAgents" as any);
      console.log("Agents migration:", agentsResult);

      // 2. Crea configurazioni di default
      const configsResult = await ctx.runAction("migrations:createDefaultConfigurations" as any);
      console.log("Configurations creation:", configsResult);

      return {
        success: true,
        message: "Full migration completed successfully",
        results: {
          agents: agentsResult,
          configurations: configsResult,
        },
      };

    } catch (error) {
      console.error("Full migration failed:", error);
      throw new Error(`Full migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Verifica lo stato della migrazione
 */
export const checkMigrationStatus = action({
  args: {},
  handler: async (ctx) => {
    try {
      const systemAgents = await ctx.runQuery("agents:getSystemAgents" as any);
      const systemConfigurations = await ctx.runQuery("agentConfigurations:getConfigurationsByUser" as any, {
        userId: "system" as any,
      });
      const systemWorkflows = await ctx.runQuery("workflows:getWorkflowsByUser" as any, {
        userId: "system" as any,
      });

      return {
        agents: {
          count: systemAgents.length,
          expected: 6,
          migrated: systemAgents.length > 0,
        },
        configurations: {
          count: systemConfigurations.length,
          expected: 6,
          created: systemConfigurations.length > 0,
        },
        workflows: {
          count: systemWorkflows.length,
          expected: 1,
          created: systemWorkflows.length > 0,
        },
        fullyMigrated: systemAgents.length > 0 && systemConfigurations.length > 0 && systemWorkflows.length > 0,
      };

    } catch (error) {
      console.error("Failed to check migration status:", error);
      throw new Error(`Failed to check migration status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

/**
 * Rollback della migrazione (rimuove tutti gli agenti di sistema)
 */
export const rollbackMigration = action({
  args: {},
  handler: async (ctx) => {
    console.log("Rolling back migration...");

    try {
      const systemAgents = await ctx.runQuery("agents:getSystemAgents" as any);
      const systemConfigurations = await ctx.runQuery("agentConfigurations:getConfigurationsByUser" as any, {
        userId: "system" as any,
      });
      const systemWorkflows = await ctx.runQuery("workflows:getWorkflowsByUser" as any, {
        userId: "system" as any,
      });

      // Rimuovi configurazioni
      for (const config of systemConfigurations) {
        await ctx.runMutation("agentConfigurations:deleteConfiguration" as any, {
          configurationId: config._id,
        });
      }

      // Rimuovi workflow
      for (const workflow of systemWorkflows) {
        await ctx.runMutation("workflows:deleteWorkflow" as any, {
          workflowId: workflow._id,
        });
      }

      // Rimuovi agenti
      for (const agent of systemAgents) {
        await ctx.runMutation("agents:deleteAgent" as any, {
          agentId: agent._id,
        });
      }

      console.log("Rollback completed successfully!");
      return {
        success: true,
        message: "Migration rollback completed successfully",
        removed: {
          agents: systemAgents.length,
          configurations: systemConfigurations.length,
          workflows: systemWorkflows.length,
        },
      };

    } catch (error) {
      console.error("Rollback failed:", error);
      throw new Error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
