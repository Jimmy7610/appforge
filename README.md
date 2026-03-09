# AppForge

AppForge is an AI-powered architecture studio and project generator that transforms a simple app idea into a structured system blueprint, technical explanation, visual diagram, version history, and a complete starter codebase.

> **Status:** Early-stage but functional AI architecture studio and project bootstrap tool.

## What AppForge Does

AppForge helps developers and product makers bridge the gap between a raw idea and a concrete technical implementation. It automates the "architecture phase" by generating structured plans and diagrams, then provides a one-click export to a production-ready Next.js starter project.

**The Pipeline:**
**Idea** → **Architecture Blueprint** → **Iteration/Improvement** → **Explanation** → **Mermaid Diagram** → **Version History** → **AI Chat** → **Full Project Generation**

---

## Core Features

- **Blueprint Generation**: Generate a full system architecture (features, tech stack, DB tables, API routes, roadmap) from a short description.
- **Blueprint Improvement**: Iteratively refine your architecture with natural-language instructions (e.g., "Add Redis for caching" or "Optimize for mobile").
- **Architecture Explanation**: AI identifies and explains the "why" behind design decisions and system components.
- **Architecture Diagram Generation**: Live Mermaid.js rendering of your system's architecture for visual clarity.
- **Diagram Export**: Download your architecture diagrams as high-resolution **SVG** or **PNG** files.
- **Blueprint Diffing**: Visually review exactly what changed between iterations (Added/Removed items).
- **Version History**: Automatically track every improvement. Compare and restore historical versions of your blueprint.
- **Architecture Chat**: "Ask the Architect" — ask follow-up questions grounded in your specific blueprint.
- **Blueprint Library**: Save, manage, and revisit multiple projects in a local dashboard.
- **Full Project Generation**: One-click generation of a complete Next.js starter bundle including API routes, database schemas, and README.
- **Ollama Integration**: Support for local LLMs via Ollama with auto-model discovery.

---

## Example User Flow

1. **Ideation**: Enter a project idea (e.g., "A SaaS for managing community gardens").
2. **Generation**: Receive a structured blueprint covering features, database tables, and API routes.
3. **Refinement**: Instruct the AI to "Add a premium subscription tier with Stripe" — see the diff of what changed.
4. **Visualization**: Click "Generate Diagram" to see a live visual representation of the system.
5. **Consultation**: Use "Ask the Architect" to ask "What are the biggest scaling risks for this garden app?".
6. **Bootstrap**: Hit "Generate Full Project" to download a ZIP containing a structured Next.js codebase.

---

## Tech Stack

### Frontend & UI
- **Framework**: Next.js (App Router)
- **Library**: React, TailwindCSS
- **Visuals**: Mermaid.js, Lucide Icons
- **Utility**: JSZip (for project bundling)

### AI Infrastructure
- **OpenAI**: GPT-4o / GPT-4o-mini
- **Ollama**: Local model support (Llama 3, Mistral, etc.)
- **Fallback**: Local deterministic fallback for offline/low-resource use.

### Storage
- **Local-First**: Uses browser `localStorage` for project and settings persistence.
  - `appforge_blueprints`: Project and version data.
  - `appforge_ai_settings`: AI provider and model configurations.

---

## Internal Architecture

AppForge uses a clean **Task/Provider** architecture to decouple AI logic from UI and provider-specific SDKs.

### Task Layer
Encapsulates prompt engineering and response parsing for specific AI operations:
- `generateBlueprint`: Strategic system design.
- `improveBlueprint`: Delta-based architecture refinement.
- `explainBlueprint`: Technical analysis and documentation.
- `generateArchitectureDiagram`: Mermaid source code generation.
- `architectureChat`: Context-aware follow-up Q&A.

### Provider Layer
Abstracts the execution of tasks across different LLM backends:
- **OpenAI**: High-performance cloud execution.
- **Ollama**: Local, private, and cost-free execution.
- **Local**: Deterministic fallback behavior.

**Execution Pipeline:**
`UI` → `Logic Wrapper` → `Task Handler` → `Provider Execution` → `Defensive Parsing` → `UI Update`

---

## Project Structure

```text
app/            # Next.js pages, layouts, and route handlers
components/     # Reusable UI components (shadcn/vanilla)
lib/
  ai/           # AI Task/Provider system and prompt logic
  export/       # Code generators and project bundlers
  projects/     # Versioning and storage helpers
  utils/        # Common utilities
public/         # Static assets and icons
docs/           # Project-internal documentation
types/          # Shared TypeScript definitions
```

---

## Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Jimmy7610/appforge.git
cd appforge
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. AI Setup
- **OpenAI**: Enter your API key in the **Settings** page within the app.
- **Ollama**: Ensure Ollama is running (`ollama run llama3`). The settings page will auto-discover your local models.

---

## Roadmap

- [ ] **Architecture Critique**: Automatic identification of bottlenecks and security risks.
- [ ] **GitHub Repo Export**: Direct push to a new GitHub repository.
- [ ] **Infrastructure Diagram Generation**: Terraform/Pulumi structure generation.
- [ ] **Blueprint Timeline**: Visual timeline of project evolution.
- [ ] **Multi-model Comparison**: Compare the same idea across different LLMs simultaneously.

## License

MIT License

## Credits

Created by **Jimmy Eliasson**.
