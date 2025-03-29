
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads environment variables from a file and merges them with process.env
 * @param {string} filePath - Path to the .env file
 * @returns {Record<string, string>} - Combined environment variables
 */
function loadEnv(filePath: string): Record<string, string> {
    let envConfig = {};
    if (fs.existsSync(filePath)) {
        envConfig = dotenv.parse(fs.readFileSync(filePath));
    }
    return { ...envConfig, ...process.env };
}

// Load environment variables, providing defaults if not found
const myEnv = loadEnv(path.join(__dirname, ".env"));
           // Default API key

// Initialize the MCP server with identification info
const server = new McpServer({
    name: "MCP Server",
    version: "1.0.1"
});


const data = [
    {
        "name": "John",
        "age": 30,
        "city": "New York"
    },
    {
        "name": "Jane",
        "age": 25,
        "city": "Los Angeles"
    },
    
]

// Tool to retrieve user data
server.tool(
    "get_users",
    `Retrieve and return a list of all users.`,
    async () => {
        try {
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
           
            return { content: [{ type: "text", text: `Error: ${JSON.stringify(error, null, 2)}` }], isError: true };
        }
    }
);


// Tool to retrieve a user data
server.tool(
    "get_user",
    `Retrieve and return a user from the connected database.`,
    { user: z.string() },
    async ({ user }) => {   
        try {
            return { content: [{ type: "text", text: JSON.stringify(data.find(u => u.name === user), null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error: ${JSON.stringify(error, null, 2)}` }], isError: true };
        }
    }
);

// Create a server transport mechanism using standard input/output
const transport = new StdioServerTransport();

// Wrap the server initialization in an async main function
async function main() {
    await server.connect(transport);
}

// Start the server
main().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});