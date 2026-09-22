# 🔍 RepoLens

> [!IMPORTANT]
> **Instructions for Anuj (Backend Integration):**
> Hi Anuj! The frontend code has been pushed to this branch. To connect your backend with this frontend:
> 1. Make sure your backend API is running locally (e.g. on port 3000).
> 2. Open `vite.config.ts` and set up the proxy to point to your backend URL (or configure CORS on your backend and set the `.env.local` `VITE_API_BASE_URL`).
> 3. You may need to review the frontend API fetch calls to match your backend endpoints.
> 4. To merge these frontend changes into your main branch, you can create a Pull Request from the `anuj` branch to your main backend branch, or manually pull this branch into yours using `git pull origin anuj`.
**RepoLens** is an intelligent code repository analysis and visualization tool powered by AI. It provides deep insights into your codebase through advanced static analysis, multi-agent code reviews, impact analysis, and an AI-powered coding assistant.

![RepoLens](https://img.shields.io/badge/Version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-React-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏠 Repository Overview
Get a comprehensive dashboard view of your codebase with:
- **Code Statistics**: Lines of code, file counts, and language distribution
- **Dependency Analysis**: Visualize and analyze project dependencies
- **Repository Health**: Code quality metrics and health indicators
- **Recent Activity**: Track commits, branches, and contributors
- **Language Breakdown**: Visual pie charts showing language composition

### 🔎 Code Explorer
Navigate and explore your repository with advanced features:
- **File Tree Navigation**: Hierarchical view of your entire codebase
- **Monaco Code Editor**: Full-featured code viewing with syntax highlighting
- **Symbol Extraction**: Automatic detection of functions, classes, and methods
- **Multi-Language Support**: TypeScript, JavaScript, Python, Java, and more
- **Code Search**: Fast full-text search across your repository
- **Lazy Loading**: Fetch file content on-demand from GitHub

### 🤖 Multi-Agent Code Review
AI-powered code review system with five specialized agents:
- **Security Agent**: Identifies vulnerabilities, authentication issues, and security risks
- **Performance Agent**: Analyzes efficiency, database queries, and optimization opportunities
- **Architecture Agent**: Reviews system design, patterns, and code structure
- **Quality Agent**: Checks code quality, testing, and maintainability
- **DevOps Agent**: Examines CI/CD, deployment configs, and infrastructure

**Review Capabilities:**
- Parallel analysis by all agents simultaneously
- Agent debate system with challenge/response cycles
- Consensus building and conflict resolution
- Severity-based issue categorization (Critical, High, Medium, Low, Info)
- Auto-fix suggestions with code diffs
- Audio briefings via text-to-speech
- Orchestrator-generated summary reports

### 💬 AI Copilot Chat
Unified conversational AI assistant for your repository:
- **Context-Aware Responses**: Understands your entire codebase
- **RAG-Powered Search**: Retrieves relevant code snippets automatically
- **Multi-Turn Conversations**: Maintains conversation history
- **Code Navigation**: Jump to files, functions, and specific lines
- **Voice Input**: Microphone support for hands-free queries
- **Multiple LLM Support**: Compatible with OpenAI, Anthropic, Google Gemini
- **Smart Jump Actions**: Quick navigation to findings, conflicts, and code sections

### 🎯 Impact Analysis
Visualize and predict the blast radius of code changes:
- **Interactive Dependency Graph**: Powered by React Flow
- **File-Level Impact**: See which files are affected by changes
- **Function-Level Dependencies**: Track cross-file function calls
- **Change Risk Assessment**: Predict potential breaking changes
- **Visual Node Types**: Different colors for modules, files, and functions
- **Change Assistant**: AI-generated step-by-step change plans

### 🔀 Branch Comparison & Merge Conflicts
Intelligent branch comparison and conflict resolution:
- **Branch Diff Analysis**: Compare any two branches
- **Conflict Detection**: Identify merge conflicts before merging
- **Semantic Conflict Detection**: Find conflicts beyond textual mismatches
- **3-Way Merge View**: See base, ours, and theirs side-by-side
- **AI-Powered Resolution**: Get merge suggestions from AI
- **Resolution Strategies**: Choose ours, theirs, AI suggestion, or custom
- **Function-Level Changes**: Track API changes, database schema modifications

### 📊 Git History
Comprehensive commit history visualization:
- **Commit Timeline**: Chronological view of all commits
- **Author Tracking**: See who made which changes
- **Diff Viewer**: Side-by-side comparison of changes
- **Branch Filtering**: View history for specific branches
- **Commit Search**: Find commits by message, author, or file

### 🎙️ Voice Features
Built-in voice interaction capabilities:
- **Voice Input**: Ask questions using your microphone
- **Text-to-Speech**: Hear agent responses and code reviews
- **Multi-Agent Audio Debate**: Listen to agent discussions
- **Adjustable Settings**: Control rate, pitch, and volume
- **Auto-Play Mode**: Automatically play responses

### ⚙️ Settings & Configuration
Flexible configuration options:
- **LLM Provider Selection**: Choose between OpenAI, Anthropic, or Google Gemini
- **API Key Management**: Securely store your API keys in `.env.local`
- **Voice Settings**: Customize TTS voice, rate, pitch, and volume
- **Theme Support**: Dark mode optimized UI
- **Keyboard Shortcuts**: Command palette with `Ctrl+K` / `Cmd+K`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git installed on your system
- API key for your chosen LLM provider (OpenAI, Anthropic, or Google Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/palakmalhotra2007-jpg/repolens.git
   cd repolens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   # LLM Provider API Keys (choose one or more)
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
   VITE_GEMINI_API_KEY=your-google-gemini-api-key
   
   # Optional: GitHub Personal Access Token for private repos
   VITE_GITHUB_TOKEN=your-github-token
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   ```
   http://localhost:5173
   ```

## 🎮 Usage

### Connecting a Repository

1. Click the **"Connect Repository"** button in the top navigation
2. Enter a GitHub repository URL (e.g., `https://github.com/owner/repo`)
3. Or use the built-in demo repository to explore features

### Running a Code Review

1. Navigate to the **Review** tab in the sidebar
2. Click **"Run 5-Agent Review"**
3. Watch as five AI agents analyze your code in parallel
4. View findings categorized by severity
5. Listen to the orchestrator's audio summary
6. Explore individual findings with code context

### Using the AI Copilot

1. Open the right panel by clicking the chat icon
2. Type your question or click the microphone for voice input
3. Ask about architecture, specific files, or request analysis
4. Use jump actions to navigate to referenced code
5. Continue multi-turn conversations for deeper insights

### Analyzing Impact

1. Go to the **Impact Graph** view
2. Click on any node to see dependencies
3. Use the Change Assistant to plan modifications
4. Enter a change description to get AI-generated impact analysis
5. Review the blast radius before making changes

### Comparing Branches

1. Navigate to the **Merge** view
2. Select base and target branches
3. View diff statistics and changed files
4. Review merge conflicts (if any)
5. Use AI-powered resolution for complex conflicts

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Code Editor**: Monaco Editor (VS Code engine)
- **Graph Visualization**: React Flow (xyflow)
- **AI Integration**: OpenAI API, Anthropic Claude API, Google Gemini API
- **Icons**: Lucide React
- **State Management**: React Context API
- **Code Analysis**: Custom AST parsing and pattern matching

## 📁 Project Structure

```
repolens/
├── src/
│   ├── components/       # React components
│   │   ├── chat/         # AI Copilot views
│   │   ├── common/       # Reusable components
│   │   ├── explore/      # Code explorer
│   │   ├── git/          # Git history
│   │   ├── impact/       # Impact analysis
│   │   ├── layout/       # Layout components
│   │   ├── merge/        # Merge conflict resolution
│   │   ├── modals/       # Modal dialogs
│   │   ├── overview/     # Repository overview
│   │   └── review/       # Multi-agent review
│   ├── config/           # Configuration files
│   ├── data/             # Mock data for demo
│   ├── services/         # Business logic
│   │   ├── llm/          # LLM provider integrations
│   │   ├── agentOrchestrator.ts
│   │   ├── githubFetcher.ts
│   │   ├── impactGraphBuilder.ts
│   │   └── ragService.ts
│   ├── store/            # State management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── README.md             # This file
```

## 🔑 API Keys

RepoLens supports multiple LLM providers. Configure at least one:

### OpenAI
1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Add to `.env.local`: `VITE_OPENAI_API_KEY=sk-...`

### Anthropic Claude
1. Sign up at [Anthropic](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env.local`: `VITE_ANTHROPIC_API_KEY=sk-ant-...`

### Google Gemini
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local`: `VITE_GEMINI_API_KEY=...`

### GitHub (Optional)
For analyzing private repositories:
1. Generate a Personal Access Token at [GitHub Settings](https://github.com/settings/tokens)
2. Grant `repo` scope permissions
3. Add to `.env.local`: `VITE_GITHUB_TOKEN=ghp_...`

## 🧪 Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 🎨 Features in Detail

### RAG (Retrieval-Augmented Generation)
RepoLens implements a custom RAG system that:
- Indexes all files in your repository
- Extracts code symbols (functions, classes, methods)
- Performs semantic search based on user queries
- Retrieves relevant code snippets for AI context
- Supports multi-file context assembly

### Multi-Agent Architecture
The review system uses a sophisticated agent orchestration:
1. **Parallel Analysis**: All agents analyze simultaneously
2. **Debate Rounds**: Agents challenge each other's findings
3. **Consensus Building**: Cross-verification of issues
4. **Priority Ranking**: Severity-based issue sorting
5. **Final Orchestration**: Summary generation with health score

### Impact Graph Algorithm
The dependency graph is built by:
- Parsing import/export statements
- Tracking function calls across files
- Building a directed graph of dependencies
- Calculating transitive closure for blast radius
- Rendering with React Flow for interactivity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Powered by [OpenAI](https://openai.com/), [Anthropic](https://anthropic.com/), and [Google AI](https://ai.google.dev/)
- Code editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Flow diagrams by [React Flow](https://reactflow.dev/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.
