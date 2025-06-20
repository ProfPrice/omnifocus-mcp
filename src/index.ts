import { OmniFocusMCPServer } from './server.js';

/**
 * Main entry point for the OmniFocus MCP Server
 */
async function main() {
  try {
    const server = new OmniFocusMCPServer();
    
    // Perform health check before starting
    const isHealthy = await server.healthCheck();
    if (!isHealthy) {
      console.error('Warning: OmniFocus is not running or not accessible. Server will start but tools may fail.');
    } else {
      console.error('OmniFocus connection verified');
    }
    
    // Start the server
    await server.start();
    
  } catch (error) {
    console.error('Failed to start OmniFocus MCP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});