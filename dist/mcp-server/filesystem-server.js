#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const server = new index_js_1.Server({
    name: 'filesystem-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});

let baseDirectory = process.env.MCP_FILESYSTEM_BASE_DIR || './uploads';

async function ensureBaseDirectory() {
    try {
        await fs.access(baseDirectory);
    }
    catch {
        await fs.mkdir(baseDirectory, { recursive: true });
    }
}

function securePath(filePath) {
    const resolvedPath = path.resolve(baseDirectory, filePath);
    const resolvedBase = path.resolve(baseDirectory);
    if (!resolvedPath.startsWith(resolvedBase)) {
        throw new Error('Path traversal attempt detected');
    }
    return resolvedPath;
}

server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'createFile',
                description: 'Create a new file with specified content',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Path to the file to create (relative to base directory)',
                        },
                        content: {
                            type: 'string',
                            description: 'Content to write to the file',
                        },
                    },
                    required: ['filePath', 'content'],
                },
            },
            {
                name: 'editFile',
                description: 'Edit an existing file by replacing its content or appending to it',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Path to the file to edit (relative to base directory)',
                        },
                        content: {
                            type: 'string',
                            description: 'New content for the file',
                        },
                        mode: {
                            type: 'string',
                            enum: ['replace', 'append'],
                            description: 'Edit mode: replace entire content or append to existing content',
                            default: 'replace',
                        },
                    },
                    required: ['filePath', 'content'],
                },
            },
            {
                name: 'deleteFile',
                description: 'Delete a file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Path to the file to delete (relative to base directory)',
                        },
                    },
                    required: ['filePath'],
                },
            },
            {
                name: 'listFiles',
                description: 'List files and directories in a specified directory',
                inputSchema: {
                    type: 'object',
                    properties: {
                        directoryPath: {
                            type: 'string',
                            description: 'Path to the directory to list (relative to base directory)',
                            default: '.',
                        },
                        recursive: {
                            type: 'boolean',
                            description: 'Whether to list files recursively',
                            default: false,
                        },
                    },
                },
            },
            {
                name: 'readFile',
                description: 'Read the contents of a file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Path to the file to read (relative to base directory)',
                        },
                    },
                    required: ['filePath'],
                },
            },
            {
                name: 'setBaseDirectory',
                description: 'Set the base directory for file operations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        directory: {
                            type: 'string',
                            description: 'Path to the new base directory',
                        },
                    },
                    required: ['directory'],
                },
            },
        ],
    };
});

server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        await ensureBaseDirectory();
        switch (name) {
            case 'createFile': {
                const { filePath, content } = args;
                const fullPath = securePath(filePath);
               
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                
                try {
                    await fs.access(fullPath);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: File '${filePath}' already exists. Use editFile to modify existing files.`,
                            },
                        ],
                    };
                }
                catch {
                }
                await fs.writeFile(fullPath, content, 'utf8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Successfully created file '${filePath}' with ${content.length} characters.`,
                        },
                    ],
                };
            }
            case 'editFile': {
                const { filePath, content, mode = 'replace' } = args;
                const fullPath = securePath(filePath);
                try {
                    await fs.access(fullPath);
                }
                catch {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: File '${filePath}' does not exist. Use createFile to create new files.`,
                            },
                        ],
                    };
                }
                if (mode === 'append') {
                    await fs.appendFile(fullPath, content, 'utf8');
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully appended ${content.length} characters to '${filePath}'.`,
                            },
                        ],
                    };
                }
                else {
                    await fs.writeFile(fullPath, content, 'utf8');
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully replaced content of '${filePath}' with ${content.length} characters.`,
                            },
                        ],
                    };
                }
            }
            case 'deleteFile': {
                const { filePath } = args;
                const fullPath = securePath(filePath);
                try {
                    await fs.unlink(fullPath);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully deleted file '${filePath}'.`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error deleting file '${filePath}': ${error.message}`,
                            },
                        ],
                    };
                }
            }
            case 'listFiles': {
                const { directoryPath = '.', recursive = false } = args;
                const fullPath = securePath(directoryPath);
                async function listDirectory(dirPath, isRecursive, prefix = '') {
                    const items = [];
                    try {
                        const entries = await fs.readdir(dirPath, { withFileTypes: true });
                        for (const entry of entries) {
                            const itemPath = path.join(prefix, entry.name);
                            if (entry.isDirectory()) {
                                items.push(`📁 ${itemPath}/`);
                                if (isRecursive) {
                                    const subItems = await listDirectory(path.join(dirPath, entry.name), isRecursive, itemPath);
                                    items.push(...subItems.map(item => `  ${item}`));
                                }
                            }
                            else {
                                const stats = await fs.stat(path.join(dirPath, entry.name));
                                items.push(`📄 ${itemPath} (${stats.size} bytes)`);
                            }
                        }
                    }
                    catch (error) {
                        items.push(`Error reading directory: ${error.message}`);
                    }
                    return items;
                }
                const items = await listDirectory(fullPath, recursive);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Contents of '${directoryPath}':\n${items.join('\n')}`,
                        },
                    ],
                };
            }
            case 'readFile': {
                const { filePath } = args;
                const fullPath = securePath(filePath);
                try {
                    const content = await fs.readFile(fullPath, 'utf8');
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Content of '${filePath}':\n\n${content}`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error reading file '${filePath}': ${error.message}`,
                            },
                        ],
                    };
                }
            }
            case 'setBaseDirectory': {
                const { directory } = args;
                try {
                    const resolvedDir = path.resolve(directory);
                    await fs.access(resolvedDir);
                    baseDirectory = resolvedDir;
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully set base directory to '${baseDirectory}'.`,
                            },
                        ],
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error setting base directory: ${error.message}`,
                            },
                        ],
                    };
                }
            }
            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown tool: ${name}`,
                        },
                    ],
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`,
                },
            ],
        };
    }
});

async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Filesystem MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
