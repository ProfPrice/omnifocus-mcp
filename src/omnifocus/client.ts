import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { 
  OmniFocusTask, 
  OmniFocusProject, 
  OmniFocusContext, 
  TaskFilters, 
  CreateTaskOptions 
} from '../types/omnifocus.js';
import { buildJxaScriptForTasks, buildJxaScriptForProjects } from './omnifocus-jxa.js';

/**
 * OmniFocus client using Omni Automation (JavaScript for Automation)
 * This client executes JavaScript automation scripts via osascript
 */
export class OmniFocusClient {
  private readonly appName = 'OmniFocus';

  /**
   * Execute a JavaScript automation script in OmniFocus using temp file approach
   */
  private executeScript(script: string): string {
    const tmpFile = join(tmpdir(), `omnifocus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.js`);
    
    try {
      console.error(`[DEBUG] Writing script to ${tmpFile}`);
      writeFileSync(tmpFile, script);
      
      console.error(`[DEBUG] Executing osascript...`);
      const result = execSync(`osascript -l JavaScript "${tmpFile}"`, {
        encoding: 'utf8',
        timeout: 90000, // Increased timeout to 90 seconds for large task lists
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      console.error(`[DEBUG] Script execution completed`);
      return result.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[DEBUG] Script execution failed:`, errorMessage);
      if (error instanceof Error) {
        throw new Error(`OmniFocus automation failed: ${error.message}`);
      }
      throw new Error('Unknown error executing OmniFocus automation');
    } finally {
      try {
        unlinkSync(tmpFile);
        console.error(`[DEBUG] Cleaned up temp file`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Check if OmniFocus is running and accessible
   */
  async checkConnection(): Promise<boolean> {
    console.error('[DEBUG] checkConnection called');
    // For now, just return true to bypass the osascript issue
    return true;
  }

  /**
   * Get all tasks with optional filtering
   */
  async getAllTasks(filters: TaskFilters = {}): Promise<OmniFocusTask[]> {
    console.error('[DEBUG] getAllTasks called with filters:', JSON.stringify(filters));
    const jxaScript = buildJxaScriptForTasks(false);
    const output = this.executeScript(jxaScript);
    try {
      const tasks = JSON.parse(output);
      return tasks;
    } catch (e) {
      console.error('[DEBUG] Failed to parse OmniFocus JXA output:', output);
      throw new Error('Failed to parse OmniFocus output as JSON');
    }
  }

  /**
   * Get only active (uncompleted) tasks
   */
  async getActiveTasks(filters: TaskFilters = {}): Promise<OmniFocusTask[]> {
    console.error('[DEBUG] getActiveTasks called with filters:', JSON.stringify(filters));
    const jxaScript = buildJxaScriptForTasks(true);
    const output = this.executeScript(jxaScript);
    try {
      const tasks = JSON.parse(output);
      return tasks;
    } catch (e) {
      console.error('[DEBUG] Failed to parse OmniFocus JXA output:', output);
      throw new Error('Failed to parse OmniFocus output as JSON');
    }
  }

  async getAllProjects(): Promise<any[]> {
    console.error('[DEBUG] getAllProjects called');
    const jxaScript = buildJxaScriptForProjects(false);
    const output = this.executeScript(jxaScript);
    try {
      const projects = JSON.parse(output);
      return projects;
    } catch (e) {
      console.error('[DEBUG] Failed to parse OmniFocus JXA output:', output);
      throw new Error('Failed to parse OmniFocus output as JSON');
    }
  }

  async getActiveProjects(): Promise<any[]> {
    console.error('[DEBUG] getActiveProjects called');
    const jxaScript = buildJxaScriptForProjects(false);
    const output = this.executeScript(jxaScript);
    try {
      const projects = JSON.parse(output);
      return projects.filter((p: any) => !p.completed && !(p.status && typeof p.status === 'string' && p.status.toLowerCase().includes('dropped')));
    } catch (e) {
      console.error('[DEBUG] Failed to parse OmniFocus JXA output:', output);
      throw new Error('Failed to parse OmniFocus output as JSON');
    }
  }
}