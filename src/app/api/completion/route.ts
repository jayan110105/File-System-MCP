import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { prompt, baseDirectory }: { prompt: string; baseDirectory?: string } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transport = new Experimental_StdioMCPTransport({
      command: 'node',
      args: ['dist/mcp-server/filesystem-server.js'],
      env: baseDirectory ? { MCP_FILESYSTEM_BASE_DIR: baseDirectory } : undefined,
    });

    const mcpClient = await experimental_createMCPClient({
      transport,
    });

    const tools = await mcpClient.tools();

    const systemPrompt = `You are a helpful assistant that can perform filesystem operations. 
    You have access to tools that can create, edit, delete, list, and read files.
    
    Available tools:
    - createFile: Create a new file with content
    - editFile: Edit existing files (replace or append content)
    - deleteFile: Delete files
    - listFiles: List directory contents (with optional recursive listing)
    - readFile: Read file contents
    - setBaseDirectory: Set the working directory for operations
    
    When the user asks to perform file operations:
    1. First, understand what they want to do
    2. Use the appropriate tools to accomplish the task
    3. Provide clear feedback about what was done
    4. If there are errors, explain them clearly
    
    Always be helpful and provide clear explanations of the operations performed.`;

    const response = await streamText({
      model: google('gemini-2.0-flash'),
      tools,
      system: systemPrompt,
      prompt,
      onFinish: async () => {
        revalidatePath('/');
        await mcpClient.close();
      },
      onError: async (error) => {
        console.error('Stream error:', error);
        await mcpClient.close();
      },
      maxSteps: 10,
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error('API error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 