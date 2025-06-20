import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { OmniFocusClient } from './omnifocus/client.js';

/**
 * MCP Server for OmniFocus integration
 * Provides a clean, extensible interface for OmniFocus automation
 */
export class OmniFocusMCPServer {
  private server: Server;
  private client: OmniFocusClient;

  constructor() {
    this.server = new Server(
      {
        name: 'omnifocus',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.client = new OmniFocusClient();
    
    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_active_tasks',
            description: "Call this tool to get a list of all active (uncompleted) tasks from the user's OmniFocus. Use it when the user asks for their 'active tasks', 'current tasks', or 'open tasks'.",
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_all_tasks',
            description: "Call this tool to get a list of all tasks from OmniFocus, including completed ones. Use it when the user explicitly asks for 'all tasks' or 'completed tasks'.",
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_active_projects',
            description: "Call this tool to get a list of all active (not completed or dropped) projects from OmniFocus. Use it when the user asks for their 'active projects' or 'current projects'.",
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_all_projects',
            description: "Call this tool to get a list of all projects from OmniFocus, including completed and dropped ones. Use it when the user explicitly asks for 'all projects'.",
            inputSchema: { type: 'object', properties: {} }
          },
        ]
      };
    });

    // Execute tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;
        switch (name) {
          case 'get_active_tasks':
            result = await this.client.getActiveTasks();
            break;
          case 'get_all_tasks':
            result = await this.client.getAllTasks();
            break;
          case 'get_active_projects':
            result = await this.client.getActiveProjects();
            break;
          case 'get_all_projects':
            result = await this.client.getAllProjects();
            break;
          default:
            throw new Error(`Unknown tool: ${name}.`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                error: errorMessage,
                tool: name,
                timestamp: new Date().toISOString()
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('OmniFocus MCP Server started and ready for connections');
  }

  /**
   * Get server instance for testing
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Health check - verify OmniFocus connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.client.checkConnection();
    } catch {
      return false;
    }
  }
}