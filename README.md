# AI Filesystem Manager

A Next.js web application that uses an AI assistant to manage local files through a chat interface. It leverages the Model-Context Protocol (MCP) to securely let the AI interact with a sandboxed filesystem.

## Core Features

-   **File & Folder Uploads**: Upload files and folders using Server Actions.
-   **AI Chat Interface**: Use natural language to create, read, list, and delete files.
-   **Automatic Updates**: The file browser automatically refreshes after any operation.
-   **Modern Stack**: Built with Next.js App Router, Server Actions, and Tailwind CSS.

## Getting Started

### Prerequisites

-   Node.js (v18 or newer)
-   npm or yarn

### Setup

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/jayan110105/File-System-MCP.git
    cd File-System-MCP
    npm install
    ```

2.  **Set API Key**:
    Create a `.env.local` file and add your Google Gemini API key:
    ```
    GOOGLE_GENERATIVE_AI_API_KEY="your_api_key_here"
    ```
    Get your key from [Google AI Studio](https://aistudio.google.com/apikey).

3.  **Build & Run**:
    ```bash
    # This also compiles the required MCP server
    npm run build

    # Start the development server
    npm run dev
    ```
    The app will be running at `http://localhost:3000`.

## How to Use

1.  Go to the **Upload Files** tab to add files/folders.
2.  Switch to the **Chat Assistant** tab to issue commands.
3.  View your files in the **File Browser** tab.

#### Example Commands

-   "List all the files."
-   "Create a file named `report.txt` with the content 'This is a test report.'"
-   "Read the contents of `package.json`."
-   "Delete `report.txt`."

## Project Structure

```
assignment/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── completion/route.ts    # Gemini + MCP integration
│   │   ├── actions.ts                 # Server Actions for file operations
│   │   ├── page.tsx                   # Server Component for the main page
│   │   └── layout.tsx                 # App layout
│   ├── components/
│   │   ├── HomeClient.tsx            # Client component for the main page
│   │   ├── FileUpload.tsx            # File upload component
│   │   ├── ChatInterface.tsx         # Chat interface
│   │   └── FileBrowser.tsx           # File browser
│   ├── mcp-server/
│   │   └── filesystem-server.ts      # MCP server implementation
├── dist/mcp-server/                  # Compiled MCP server
├── uploads/                          # Uploaded files directory
└── package.json
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Model Context Protocol SDK** - MCP integration
- **AI SDK** - AI model integration
- **Google Gemini API** - Language model
