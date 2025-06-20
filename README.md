# OmniFocus MCP Server

A Model Context Protocol (MCP) server for integrating OmniFocus with Claude Desktop. This server provides Claude with access to your OmniFocus tasks and projects, enabling AI-powered task management and weekly reviews.

## Features

- 🎯 **OmniFocus Integration** - Access tasks and projects from OmniFocus
- 🔧 **Active Task Filtering** - Get only uncompleted tasks, excluding templates and system items
- 🚀 **TypeScript + MCP SDK** - Type-safe and maintainable
- 🔒 **Secure Automation** - Uses official Omni Automation JavaScript API
- 📱 **Claude Desktop Ready** - Works seamlessly with Claude Desktop

## Current Tools

### `omnifocus:get_all_tasks`
Retrieve all tasks from OmniFocus with filtering options:
- **`includeCompleted`** (boolean) - Include completed tasks (default: false)
- **`limit`** (number) - Maximum number of tasks to return (default: 100)

### `omnifocus:get_active_tasks`
Retrieve only active (uncompleted) tasks, automatically filtering out:
- Tasks from "Templates" folders
- Tasks containing template placeholders (`«`, `»`)
- Tasks with synced preferences markers (`⚙️`)

### `omnifocus:get_projects`
Retrieve all active projects from OmniFocus.

## Prerequisites

- **macOS** with OmniFocus installed
- **Node.js 23.10.0** or higher
- **Claude Desktop** application
- **Automation permissions** for OmniFocus

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mdoel/omnifocus-mcp
   cd omnifocus-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Configure Claude Desktop:**
   
   Add this to your Claude Desktop MCP configuration:
   ```json
   {
     "mcpServers": {
       "omnifocus": {
         "command": "/path/to/omnifocus/run-server.sh",
         "args": []
       }
     }
   }
   ```
   
   **Important:** Replace `/path/to/omnifocus/` with the actual path to your project directory.

5. **Grant automation permissions:**
   
   The first time you run the server, macOS will prompt you to grant automation permissions for OmniFocus. Click "Allow" when prompted.
   
   **Note:** If you encounter permission issues, you may need to temporarily uncomment the `osascript` lines in `run-server.sh` to trigger the permission dialog. After granting permissions, comment those lines out again to avoid the dialog on every startup.

6. **Restart Claude Desktop** to load the new MCP server.

## Usage

Once configured, you can ask Claude to:

- "Get all my active tasks from OmniFocus"
- "Show me my projects"
- "What tasks do I have for today?"
- "Help me with my weekly review"

## Architecture

### Core Components

- **`OmniFocusClient`** - Handles communication with OmniFocus via Omni Automation
- **`OmniFocusJXA`** - Utility for building and executing JXA scripts
- **`OmniFocusMCPServer`** - Main MCP server implementation

### Directory Structure

```
src/
├── index.ts              # Main entry point
├── server.ts             # MCP server implementation
├── omnifocus/
│   ├── client.ts         # OmniFocus automation client
│   └── omnifocus-jxa.ts  # JXA script utilities
└── types/
    └── omnifocus.ts      # TypeScript definitions
```

## Development

### Building

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev
```

### Testing

You can test the server locally:

```bash
# Test with command line arguments
node dist/index.js all        # Get all tasks
node dist/index.js active     # Get active tasks only
node dist/index.js projects   # Get projects only
```

### Testing OmniFocus Automation

Test OmniFocus automation directly:

```bash
# Test basic connection
osascript -l JavaScript -e "Application('OmniFocus').running()"

# Test task retrieval
osascript -l JavaScript -e "
const app = Application('OmniFocus');
const doc = app.defaultDocument;
const tasks = doc.flattenedTasks();
console.log('Found ' + tasks.length + ' tasks');
"
```

## Troubleshooting

### Server Connection Issues

If Claude Desktop can't connect to the server:

1. **Check the script path** in your Claude Desktop configuration
2. **Verify permissions** - ensure the `run-server.sh` script is executable:
   ```bash
   chmod +x run-server.sh
   ```
3. **Check Node.js installation** - ensure Node.js 23.10.0+ is installed
4. **Review logs** - check Claude Desktop's MCP server logs for error messages

### Permission Issues

If you get automation permission errors:

1. Open **System Preferences > Security & Privacy > Privacy**
2. Select **Automation** from the left sidebar
3. Find your terminal/shell and check **OmniFocus**
4. Restart your terminal and try again

### OmniFocus Not Found

- Ensure OmniFocus is installed and running
- Verify the app name is "OmniFocus" (not "OmniFocus 3" or something similar)
- Check that OmniFocus is not in the trash or disabled

### Performance Issues

If the server is slow or times out:

- The server may take time to process large OmniFocus databases
- Consider using the `limit` parameter to reduce the number of tasks returned
- Ensure OmniFocus is not performing other operations

## Contributing

This project is designed to be extensible. To add new functionality:

1. **Add new tools** in the `src/omnifocus/` directory
2. **Update the server** to register new tools
3. **Test thoroughly** with your OmniFocus data
4. **Submit a pull request** with clear documentation

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the Claude Desktop MCP documentation
- Open an issue in this repository