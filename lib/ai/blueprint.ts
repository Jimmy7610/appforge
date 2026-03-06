import { Blueprint } from "@/types/blueprint"

export async function generateBlueprint(idea: string): Promise<Blueprint> {

  // Tillfällig mock-data tills vi kopplar riktiga AI-API:er
  const mockBlueprint: Blueprint = {
    description: `An application based on the idea: ${idea}`,

    features: [
      "User authentication",
      "Dashboard",
      "Project management",
      "Analytics"
    ],

    pages: [
      "Landing page",
      "Dashboard",
      "Project page",
      "Settings"
    ],

    database: [
      "Users",
      "Projects",
      "Tasks"
    ],

    apiRoutes: [
      "POST /projects",
      "GET /projects",
      "POST /tasks"
    ],

    tasks: [
      "Setup project",
      "Create authentication",
      "Build dashboard",
      "Add CRUD functionality"
    ],

    roadmap: [
      "Phase 1: Core features",
      "Phase 2: User improvements",
      "Phase 3: Scaling"
    ]
  }

  return mockBlueprint
}