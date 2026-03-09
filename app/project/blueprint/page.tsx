"use client";

import Link from "next/link";
import JSZip from "jszip";
import { downloadZip } from "@/lib/export/download-zip";
import { REFINE_PRESETS } from "@/lib/projects/refinePresets";
import { generateBlueprint, type Blueprint } from "@/lib/ai/generateBlueprint";
import { improveBlueprint } from "@/lib/ai/improveBlueprint";
import { explainBlueprint } from "@/lib/ai/explainBlueprint";
import { generateArchitectureDiagram } from "@/lib/ai/generateArchitectureDiagram";
import { architectureChat } from "@/lib/ai/architectureChat";
import { critiqueBlueprint } from "@/lib/ai/critiqueBlueprint";
import type { ExplainBlueprintResult, GenerateArchitectureDiagramResult, ArchitectureChatMessage, ArchitectureChatResult } from "@/lib/ai/tasks/types";
import { diffBlueprints, type BlueprintDiff, hasAnyChanges } from "@/lib/ai/diffBlueprints";
import { buildStarterPack, ExportInput } from "@/lib/export/buildStarterPack";
import { buildMarkdownFiles } from "@/lib/export/buildMarkdownFiles";
import { buildProjectBundle } from "@/lib/export/buildProjectBundle";
import { buildShareBlueprint } from "@/lib/export/buildShareBlueprint";
import { buildFullProject } from "@/lib/export/buildFullProject";
import { ErrorBoundary } from "react-error-boundary";
import { Sparkles, ArrowLeft } from "lucide-react";
import { MermaidDiagram } from "@/components/blueprint/mermaid-diagram";
import { ArchitectureCritique } from "@/components/blueprint/architecture-critique";
import { ArchitectureSuggestions } from "@/components/blueprint/architecture-suggestions";
import { RefinePresets } from "@/components/blueprint/refine-presets";
import { Project, BlueprintVersion, BlueprintCritique, ArchitectureSuggestionsResult } from "@/lib/ai/types";
import { suggestArchitectureImprovements } from "@/lib/ai/suggestArchitectureImprovements";
import {
    normalizeProjectVersions,
    createBlueprintVersion,
    appendBlueprintVersion,
    restoreBlueprintVersion
} from "@/lib/projects/versioning";
import { EditableList } from "@/components/blueprint/editable-list";
import { loadSavedProjects, saveProjects } from "@/lib/projects/storage";

function BlueprintContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const getParam = (key: string) => searchParams.get(key) || undefined;
    const idParam = getParam("id");

    const displayMap: Record<string, string | undefined> = {
        web: "Web App",
        mobile: "Mobile App",
        desktop: "Desktop App",
        free: "Free Tool",
        saas: "SaaS",
        marketplace: "Marketplace",
        internal: "Internal Tool"
    };

    const [idea, setIdea] = useState(getParam("idea"));
    const [platform, setPlatform] = useState(getParam("platform"));
    const [businessModel, setBusinessModel] = useState(getParam("businessModel"));
    const [targetUsers, setTargetUsers] = useState(getParam("targetUsers"));
    const [coreFeature, setCoreFeature] = useState(getParam("coreFeature"));
    const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
    const [projectNotFound, setProjectNotFound] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);

    // Versioning state
    const [project, setProject] = useState<Project | null>(null);
    const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
    const [restoreSuccess, setRestoreSuccess] = useState(false);

    // Improve UI state
    const [isImproving, setIsImproving] = useState(false);
    const [instructions, setInstructions] = useState("");
    const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
    const [diffResult, setDiffResult] = useState<BlueprintDiff | null>(null);

    // Explain UI state
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<ExplainBlueprintResult | null>(null);

    // Diagram UI state
    const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
    const [diagram, setDiagram] = useState<GenerateArchitectureDiagramResult | null>(null);
    const [renderedSvg, setRenderedSvg] = useState<string>("");

    // Chat UI state
    const [isChatting, setIsChatting] = useState(false);
    const [chatMessages, setChatMessages] = useState<ArchitectureChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [lastChatResult, setLastChatResult] = useState<ArchitectureChatResult | null>(null);

    // Critique UI state
    const [isCritiquing, setIsCritiquing] = useState(false);
    const [critique, setCritique] = useState<BlueprintCritique | null>(null);

    // Suggestions UI state
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<ArchitectureSuggestionsResult | null>(null);

    useEffect(() => {
        setMounted(true);
        const isImported = getParam("imported") === "true";

        if (idParam) {
            try {
                const blueprints = loadSavedProjects();
                if (blueprints.length > 0) {
                    const foundProject = blueprints.find((p: any) => p.id === idParam);
                    if (foundProject) {
                        const normalizedProject = normalizeProjectVersions(foundProject);
                        setProject(normalizedProject);

                        setIdea(normalizedProject.idea);
                        setPlatform(normalizedProject.platform);
                        setBusinessModel(normalizedProject.businessModel);
                        setTargetUsers(normalizedProject.targetUsers);
                        setCoreFeature(normalizedProject.coreFeature);

                        // Set the latest version as active
                        const latestVersion = normalizedProject.versions![normalizedProject.versions!.length - 1];
                        setBlueprint(latestVersion.blueprint);
                        setActiveVersionId(latestVersion.id);

                        // Restore auxiliary state from the latest version
                        if (latestVersion.explanation) {
                            setExplanation({ explanation: latestVersion.explanation, metadata: latestVersion.metadata || undefined });
                        }
                        if (latestVersion.diagram) {
                            setDiagram({ diagram: latestVersion.diagram, metadata: latestVersion.metadata || undefined });
                        }
                        if (latestVersion.critique) {
                            setCritique(latestVersion.critique);
                        }

                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to load project from localStorage", e);
            }
            setProjectNotFound(true);
        } else if (isImported) {
            try {
                const stored = sessionStorage.getItem("appforge_imported_blueprint");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setIdea(parsed.idea);
                    setPlatform(parsed.inputs.platform);
                    setBusinessModel(parsed.inputs.businessModel);
                    setTargetUsers(parsed.inputs.targetUsers);
                    setCoreFeature(parsed.inputs.coreFeature);
                    setBlueprint(parsed.blueprint);
                    if (parsed.explanation) {
                        setExplanation({
                            explanation: parsed.explanation,
                            metadata: parsed.metadata || undefined
                        });
                    }
                    setDiagram(null); // Reset diagram on import since it's not in the share schema yet
                    setImportSuccess(true);
                    setTimeout(() => setImportSuccess(false), 4000);
                    return;
                }
            } catch (e) {
                console.error("Failed to load imported blueprint", e);
            }
            setProjectNotFound(true);
        } else {
            setIsGenerating(true);
            generateBlueprint({
                idea: getParam("idea"),
                platform: getParam("platform"),
                businessModel: getParam("businessModel"),
                targetUsers: getParam("targetUsers"),
                coreFeature: getParam("coreFeature")
            }).then(bp => {
                setBlueprint(bp);
            }).catch(e => {
                console.error("Failed to generate blueprint", e);
                setProjectNotFound(true);
            }).finally(() => {
                setIsGenerating(false);
            });
        }
    }, [idParam, searchParams]);

    useEffect(() => {
        if (blueprint && !isSuggesting && !suggestions) {
            handleSuggest();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blueprint]);

    const handleSuggest = async () => {
        if (!blueprint) return;
        setIsSuggesting(true);
        try {
            const result = await suggestArchitectureImprovements(
                { idea, platform, businessModel, targetUsers, coreFeature },
                blueprint
            );
            setSuggestions(result);
        } catch (e) {
            console.error("Failed to generate suggestions", e);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleRegenerate = async () => {
        setIsGenerating(true);
        // Reset diff state since this is a full regeneration wrapper
        setDiffResult(null);
        setExplanation(null);
        setDiagram(null);
        setRenderedSvg("");
        setSuggestions(null);
        try {
            const bp = await generateBlueprint({ idea, platform, businessModel, targetUsers, coreFeature });
            setBlueprint(bp);
        } catch (e) {
            console.error("Failed to regenerate blueprint", e);
        } finally {
            setIsGenerating(false);
            setChatMessages([]);
            setLastChatResult(null);
        }
    };

    const handleImprove = async () => {
        if (!blueprint) return;
        setIsImproving(true);

        const customInstruction = instructions.trim();
        const hasPresets = selectedPresets.length > 0;

        if (!customInstruction && !hasPresets) {
            setIsImproving(false);
            return;
        }

        // Gather preset instructions
        const presetInstructions = selectedPresets
            .map(id => REFINE_PRESETS.find(p => p.id === id)?.instruction)
            .filter(Boolean)
            .join("\n- ");

        // Combine instructions for AI
        let combinedInstructions = customInstruction;
        if (hasPresets) {
            combinedInstructions = `Selected Architectural Presets to Apply:\n- ${presetInstructions}\n\nUser Custom Instructions:\n${customInstruction}`;
        }

        try {
            const bp = await improveBlueprint({
                originalInput: { idea, platform, businessModel, targetUsers, coreFeature },
                currentBlueprint: blueprint,
                instructions: combinedInstructions.trim()
            });
            const diff = diffBlueprints(blueprint, bp);
            setDiffResult(diff);
            setBlueprint(bp);
            setInstructions(""); // Clear input on success
            setSelectedPresets([]);
            window.alert("Blueprint architecture improved successfully based on selection.");
            setExplanation(null); // Clear previous explanation since architecture changed
            setDiagram(null); // Clear previous diagram since architecture changed
            setRenderedSvg(""); // Clear previous rendered SVG
            setCritique(null); // Clear previous critique since architecture changed
            setSuggestions(null); // Clear suggestions so they regenerate

            // Handle Versioning
            if (project) {
                const newVersion = createBlueprintVersion(project, bp, null, null, null, bp.metadata || null);
                const updatedProject = appendBlueprintVersion(project, newVersion);
                setProject(updatedProject);
                setActiveVersionId(newVersion.id);

                // Auto-update if it's a saved project
                if (idParam) {
                    const blueprints = loadSavedProjects();
                    const idx = blueprints.findIndex((p: any) => p.id === idParam);
                    if (idx !== -1) {
                        blueprints[idx] = updatedProject;
                        saveProjects(blueprints);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to improve blueprint", e);
            window.alert("Failed to improve blueprint. Check console for details.");
        } finally {
            setIsImproving(false);
            setChatMessages([]);
            setLastChatResult(null);
        }
    };

    const handleRestore = (versionId: string) => {
        if (!project) return;
        const version = restoreBlueprintVersion(versionId, project);
        if (!version) return;

        setBlueprint(version.blueprint);
        setExplanation(version.explanation ? { explanation: version.explanation, metadata: version.metadata || undefined } : null);
        setDiagram(version.diagram ? { diagram: version.diagram, metadata: version.metadata || undefined } : null);
        setCritique(version.critique || null);
        setSuggestions(null); // Refresh suggestions for the restored version
        setRenderedSvg("");
        setActiveVersionId(version.id);

        // Update inputs if they are different (v1 assumes same inputs for now but let's be safe)
        // In v1, we mostly care about the blueprint content

        setRestoreSuccess(true);
        setTimeout(() => setRestoreSuccess(false), 3000);

        // Auto-update localStorage if it's a saved project
        // Note: we don't change the version history, we just change which one is "current"
        // in terms of the generatedBlueprint field for compatibility
        if (idParam) {
            const blueprints = loadSavedProjects();
            const idx = blueprints.findIndex((p: any) => p.id === idParam);
            if (idx !== -1) {
                const updatedProject: Project = {
                    ...project,
                    generatedBlueprint: version.blueprint
                };
                blueprints[idx] = updatedProject;
                saveProjects(blueprints);
                setProject(updatedProject);
            }
        }
    };

    const handleExplain = async () => {
        if (!blueprint) return;
        setIsExplaining(true);
        try {
            const exp = await explainBlueprint({
                originalInput: { idea, platform, businessModel, targetUsers, coreFeature },
                currentBlueprint: blueprint
            });
            setExplanation(exp);
        } catch (e) {
            console.error("Failed to explain blueprint", e);
            window.alert("Failed to explain architecture. Check console for details.");
        } finally {
            setIsExplaining(false);
        }
    };

    const handleGenerateDiagram = async () => {
        if (!blueprint) return;
        setIsGeneratingDiagram(true);
        setRenderedSvg("");
        try {
            const diag = await generateArchitectureDiagram({
                originalInput: { idea, platform, businessModel, targetUsers, coreFeature },
                currentBlueprint: blueprint
            });
            setDiagram(diag);
        } catch (e) {
            console.error("Failed to generate diagram", e);
            window.alert("Failed to generate architecture diagram. Check console for details.");
        } finally {
            setIsGeneratingDiagram(false);
        }
    };

    const handleCritique = async () => {
        if (!blueprint) return;
        setIsCritiquing(true);
        try {
            const crit = await critiqueBlueprint(
                { idea, platform, businessModel, targetUsers, coreFeature },
                blueprint
            );
            setCritique(crit);

            // Auto-update localStorage if it's a saved project
            if (idParam && project && activeVersionId) {
                const blueprints = loadSavedProjects();
                const pIdx = blueprints.findIndex((p: any) => p.id === idParam);
                if (pIdx !== -1) {
                    const updatedVersions = project.versions?.map(v =>
                        v.id === activeVersionId ? { ...v, critique: crit } : v
                    );
                    const updatedProject = { ...project, versions: updatedVersions };
                    blueprints[pIdx] = updatedProject;
                    saveProjects(blueprints);
                    setProject(updatedProject);
                }
            }
        } catch (e) {
            console.error("Failed to critique blueprint", e);
            window.alert("Failed to critique architecture. Check console for details.");
        } finally {
            setIsCritiquing(false);
        }
    };

    const handleDownloadSVG = () => {
        if (!renderedSvg) return;
        const blob = new Blob([renderedSvg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const slug = (idea || "architecture").toLowerCase().replace(/[^a-z0-0]+/g, "-").replace(/^-+|-+$/g, "");
        link.href = url;
        link.download = `${slug}-architecture.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPNG = () => {
        if (!renderedSvg) return;

        const svgData = renderedSvg;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // Increase resolution for better quality
            const scale = 2;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Draw background for non-transparent PNG
            ctx.fillStyle = "#09090b"; // zinc-950 (matching AppForge theme)
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);

            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            const slug = (idea || "architecture").toLowerCase().replace(/[^a-z0-0]+/g, "-").replace(/^-+|-+$/g, "");
            link.href = pngUrl;
            link.download = `${slug}-architecture.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        img.onerror = (e) => {
            console.error("PNG conversion failed", e);
            window.alert("Failed to export PNG. Try SVG export instead.");
        };

        img.src = url;
    };

    const handleChat = async (overrideInput?: string) => {
        const inputToUser = overrideInput || chatInput;
        if (!blueprint || !inputToUser.trim()) return;

        const userMsg: ArchitectureChatMessage = { role: "user", content: inputToUser };
        const newMessages = [...chatMessages, userMsg];

        setChatMessages(newMessages);
        setChatInput("");
        setIsChatting(true);

        try {
            const result = await architectureChat({
                originalInput: { idea, platform, businessModel, targetUsers, coreFeature },
                currentBlueprint: blueprint,
                explanation: explanation?.explanation,
                diagram: diagram?.diagram,
                messages: newMessages
            });

            const assistantMsg: ArchitectureChatMessage = { role: "assistant", content: result.reply };
            setChatMessages(prev => [...prev, assistantMsg]);
            setLastChatResult(result);
        } catch (e) {
            console.error("Failed to chat with architect", e);
            const errorMsg: ArchitectureChatMessage = { role: "assistant", content: "I'm sorry, I encountered an error while processing your request. Please try again." };
            setChatMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsChatting(false);
        }
    };

    const handleUpdateBlueprintField = (field: keyof Blueprint, values: string[]) => {
        if (!blueprint) return;

        const updatedBlueprint = { ...blueprint, [field]: values };
        setBlueprint(updatedBlueprint);

        if (idParam && project && activeVersionId) {
            const blueprints = loadSavedProjects();
            const pIdx = blueprints.findIndex((p: any) => p.id === idParam);
            if (pIdx !== -1) {
                const updatedVersions = project.versions?.map(v =>
                    v.id === activeVersionId ? { ...v, blueprint: updatedBlueprint } : v
                );
                const updatedProject = {
                    ...project,
                    versions: updatedVersions,
                    generatedBlueprint: activeVersionId === (project.versions?.[project.versions.length - 1]?.id) ? updatedBlueprint : project.generatedBlueprint
                };
                blueprints[pIdx] = updatedProject;
                saveProjects(blueprints);
                setProject(updatedProject);
            }
        }
    };

    const handleSave = () => {
        if (!blueprint) return;

        const baseProject: Project = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            idea: idea || "",
            platform: platform || "",
            businessModel: businessModel || "",
            targetUsers: targetUsers || "",
            coreFeature: coreFeature || "",
            generatedBlueprint: blueprint
        };

        const newProject = normalizeProjectVersions(baseProject);

        try {
            const blueprints = loadSavedProjects();
            blueprints.push(newProject);
            saveProjects(blueprints);

            if (!idParam) {
                router.push("/dashboard");
            } else {
                window.alert("Blueprint saved as a new copy!");
                router.push("/dashboard");
            }
        } catch (e) {
            console.error("Failed to save blueprint", e);
        }
    };

    const handleUpdate = () => {
        if (!idParam || !blueprint) return;

        try {
            const blueprints = loadSavedProjects();
            if (blueprints.length === 0) {
                window.alert("Project could not be updated.");
                return;
            }

            const index = blueprints.findIndex((p: any) => p.id === idParam);

            if (index === -1) {
                window.alert("Project could not be updated.");
                return;
            }

            const existing = blueprints[index];
            const updatedProject: Project = project ? {
                ...project,
                idea: idea || "",
                platform: platform || "",
                businessModel: businessModel || "",
                targetUsers: targetUsers || "",
                coreFeature: coreFeature || "",
                generatedBlueprint: blueprint
            } : normalizeProjectVersions({
                ...existing,
                idea: idea || "",
                platform: platform || "",
                businessModel: businessModel || "",
                targetUsers: targetUsers || "",
                coreFeature: coreFeature || "",
                generatedBlueprint: blueprint
            });

            blueprints[index] = updatedProject;
            saveProjects(blueprints);
            setProject(updatedProject);

            window.alert("Project updated successfully.");
        } catch (e) {
            console.error("Failed to update blueprint", e);
            window.alert("Project could not be updated.");
        }
    };

    const handleExport = () => {
        if (!blueprint) return;
        const starterPack = buildStarterPack({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const exportData = {
            idea: idea || "",
            platform: platform || "",
            businessModel: businessModel || "",
            targetUsers: targetUsers || "",
            coreFeature: coreFeature || "",
            generatedBlueprint: blueprint,
            starterPack
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "appforge-starter-pack.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShareExport = () => {
        if (!blueprint) return;

        const sharePayload = buildShareBlueprint({
            idea,
            inputs: { platform, businessModel, targetUsers, coreFeature },
            blueprint,
            explanation: explanation || undefined
        });

        const blob = new Blob([JSON.stringify(sharePayload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "appforge-blueprint-share.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportMarkdown = () => {
        if (!blueprint) return;
        const files = buildMarkdownFiles({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        files.forEach(file => {
            const blob = new Blob([file.content], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    const handleExportBundle = () => {
        if (!blueprint) return;
        const bundleData = buildProjectBundle({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "appforge-project-bundle.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportZip = async () => {
        if (!blueprint) return;
        const bundleData = buildProjectBundle({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });

        const zip = new JSZip();

        zip.file("README.md", bundleData.files["README.md"]);

        const docs = zip.folder("docs");
        docs?.file("PROJECT_SPEC.md", bundleData.files["docs/PROJECT_SPEC.md"]);
        docs?.file("DATABASE_SCHEMA.md", bundleData.files["docs/DATABASE_SCHEMA.md"]);
        docs?.file("API_ROUTES.md", bundleData.files["docs/API_ROUTES.md"]);
        docs?.file("TASKS.md", bundleData.files["docs/TASKS.md"]);

        const app = zip.folder("app");
        app?.file("globals.css", bundleData.files["app/globals.css"]);
        app?.file("page.tsx", bundleData.files["app/page.tsx"]);
        app?.file("layout.tsx", bundleData.files["app/layout.tsx"]);

        const dashboard = app?.folder("dashboard");
        dashboard?.file("page.tsx", bundleData.files["app/dashboard/page.tsx"]);

        const projectsFolder = app?.folder("projects");
        projectsFolder?.file("page.tsx", bundleData.files["app/projects/page.tsx"]);

        const settingsFolder = app?.folder("settings");
        settingsFolder?.file("page.tsx", bundleData.files["app/settings/page.tsx"]);

        const api = app?.folder("api");
        // Dynamically add all generated API routes
        for (const [path, content] of Object.entries(bundleData.files)) {
            if (path.startsWith("app/api/") && path.endsWith("/route.ts")) {
                const slug = path.replace("app/api/", "").replace("/route.ts", "");
                const folder = api?.folder(slug);
                folder?.file("route.ts", content);
            }
        }

        const components = zip.folder("components");
        const ui = components?.folder("ui");
        ui?.file("button.tsx", bundleData.files["components/ui/button.tsx"]);
        const dashboardComponents = components?.folder("dashboard");
        dashboardComponents?.file("stat-card.tsx", bundleData.files["components/dashboard/stat-card.tsx"]);

        const lib = zip.folder("lib");
        lib?.file("types.ts", bundleData.files["lib/types.ts"]);
        lib?.file("mock-data.ts", bundleData.files["lib/mock-data.ts"]);
        if (bundleData.files["lib/db/schema.ts"]) {
            const db = lib?.folder("db");
            db?.file("schema.ts", bundleData.files["lib/db/schema.ts"]);
        }
        if (bundleData.files["lib/generated/resources.ts"]) {
            const generated = lib?.folder("generated");
            generated?.file("resources.ts", bundleData.files["lib/generated/resources.ts"]);
        }

        // Conditional feature-based pages
        if (bundleData.files["app/profile/page.tsx"]) {
            const profileFolder = app?.folder("profile");
            profileFolder?.file("page.tsx", bundleData.files["app/profile/page.tsx"]);
        }
        if (bundleData.files["app/activity/page.tsx"]) {
            const activityFolder = app?.folder("activity");
            activityFolder?.file("page.tsx", bundleData.files["app/activity/page.tsx"]);
        }
        if (bundleData.files["app/team/page.tsx"]) {
            const teamFolder = app?.folder("team");
            teamFolder?.file("page.tsx", bundleData.files["app/team/page.tsx"]);
        }

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "appforge-starter-pack.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFullExport = async () => {
        if (!blueprint) return;

        try {
            const files = buildFullProject({ idea, platform, businessModel, targetUsers, coreFeature, blueprint, displayMap });
            const zip = new JSZip();

            // Generic file map to ZIP conversion
            for (const [path, content] of Object.entries(files)) {
                zip.file(path, content);
            }

            const slug = (idea || "appforge-app")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}-starter-project.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            window.alert("Full project generated and downloaded successfully!");
        } catch (e) {
            console.error("Failed to generate full project", e);
            window.alert("Failed to generate full project. Check console for details.");
        }
    };

    if (!mounted || isGenerating || isImproving || (idParam && !projectNotFound && !blueprint)) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white"></div>
                <div className="text-zinc-400">{isGenerating ? "Generating your blueprint..." : isImproving ? "Improving blueprint..." : "Loading..."}</div>
            </div>
        );
    }

    if (projectNotFound) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Project not found</h2>
                <p className="text-zinc-400 mb-8">The requested blueprint could not be found or has been deleted.</p>
                <Link
                    href="/dashboard"
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95"
                >
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    if (!blueprint) {
        return null;
    }

    const { features, techStack, databaseTables, apiRoutes, roadmap, metadata } = blueprint;

    return (
        <>
            {/* Import Success Toast */}
            {importSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 shadow-xl backdrop-blur-md text-sm font-semibold text-emerald-400 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Blueprint imported successfully
                </div>
            )}

            {/* Restore Success Toast */}
            {restoreSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 shadow-xl backdrop-blur-md text-sm font-semibold text-blue-400 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Restored blueprint version successfully
                </div>
            )}

            {/* Header section */}
            <div className="mb-8">
                <BackToDashboard />
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-2">Project: {idea || "New Project"}</div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                            Blueprint Preview
                        </h1>
                        <p className="text-lg text-zinc-400">
                            Here is the first structured blueprint for your project idea.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                        <div className="hidden xl:block relative group">
                            <button
                                onClick={handleShareExport}
                                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/20 active:scale-95"
                            >
                                Share Blueprint
                            </button>
                            <div className="absolute -bottom-10 right-0 w-max max-w-xs scale-0 rounded bg-zinc-800 px-3 py-2 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 pointer-events-none shadow-xl z-10 border border-white/10">
                                Export a shareable blueprint file that can be imported into another AppForge instance.
                            </div>
                        </div>
                        <button
                            onClick={handleExportZip}
                            className="hidden rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 xl:block"
                        >
                            Export ZIP (Docs)
                        </button>
                        <Link
                            href={`/project/blueprint/preview?id=${idParam || ""}`}
                            className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-6 py-2.5 text-sm font-semibold text-indigo-400 transition-all hover:bg-indigo-500/20 active:scale-95 sm:block"
                        >
                            Preview Project
                        </Link>
                        <button
                            onClick={handleFullExport}
                            className="hidden rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-2.5 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/20 active:scale-95 sm:block"
                        >
                            Generate Full Project
                        </button>
                        <button
                            onClick={handleExportBundle}
                            className="hidden rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95 xl:block"
                        >
                            Export Project Bundle
                        </button>
                        <button
                            onClick={handleExportMarkdown}
                            className="hidden rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95 lg:block"
                        >
                            Export Markdown Files
                        </button>
                        <button
                            onClick={handleExport}
                            className="hidden rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95 sm:block"
                        >
                            Export Starter Pack
                        </button>
                        <button
                            onClick={handleRegenerate}
                            className="hidden rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95 sm:block"
                        >
                            Regenerate Blueprint
                        </button>
                        {idParam && (
                            <button
                                onClick={handleUpdate}
                                className="hidden rounded-full border border-white/20 bg-zinc-800 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 active:scale-95 sm:block"
                            >
                                Update Project
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:shadow-white/20 active:scale-95 sm:block"
                        >
                            Save Blueprint
                        </button>
                    </div>
                </div>
            </div>

            {/* Split layout for Architecture Playground */}
            <div className="xl:grid xl:grid-cols-12 xl:gap-8 flex flex-col gap-8 mb-8">
                {/* LEFT COLUMN */}
                <div className="xl:col-span-7 flex flex-col gap-8">
                    {/* User Input Summary Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                        <div className="space-y-8">
                            {idParam && (
                                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200">
                                    You are editing a saved project preview. Saving will create a new blueprint entry.
                                </div>
                            )}
                            {/* App Idea Section */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">App Idea</h3>
                                <textarea
                                    value={idea || ""}
                                    onChange={(e) => setIdea(e.target.value)}
                                    className="w-full rounded-xl bg-zinc-900/50 p-4 border border-white/10 text-zinc-200 leading-relaxed outline-none focus:border-white/30 transition-colors resize-none min-h-[100px]"
                                    placeholder="Enter your app idea..."
                                />
                            </div>

                            {/* Grid for Platform & Business Model */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Platform</h3>
                                    <select
                                        value={platform || ""}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        className="w-full h-[56px] rounded-xl bg-zinc-900/50 px-4 border border-white/10 text-zinc-200 outline-none focus:border-white/30 transition-colors appearance-none font-sans"
                                    >
                                        <option value="" disabled>Select platform</option>
                                        <option value="web">Web App</option>
                                        <option value="mobile">Mobile App</option>
                                        <option value="desktop">Desktop App</option>
                                    </select>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Business Model</h3>
                                    <select
                                        value={businessModel || ""}
                                        onChange={(e) => setBusinessModel(e.target.value)}
                                        className="w-full h-[56px] rounded-xl bg-zinc-900/50 px-4 border border-white/10 text-zinc-200 outline-none focus:border-white/30 transition-colors appearance-none font-sans"
                                    >
                                        <option value="" disabled>Select business model</option>
                                        <option value="free">Free Tool</option>
                                        <option value="saas">SaaS</option>
                                        <option value="marketplace">Marketplace</option>
                                        <option value="internal">Internal Tool</option>
                                    </select>
                                </div>
                            </div>

                            {/* Target Users */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Target Users</h3>
                                <textarea
                                    value={targetUsers || ""}
                                    onChange={(e) => setTargetUsers(e.target.value)}
                                    className="w-full rounded-xl bg-zinc-900/50 p-4 border border-white/10 text-zinc-200 leading-relaxed outline-none focus:border-white/30 transition-colors resize-none min-h-[80px]"
                                    placeholder="Who will use this app?"
                                />
                            </div>

                            {/* Core Feature */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">Core Feature</h3>
                                <textarea
                                    value={coreFeature || ""}
                                    onChange={(e) => setCoreFeature(e.target.value)}
                                    className="w-full rounded-xl bg-zinc-900/50 p-4 border border-white/10 text-zinc-200 leading-relaxed outline-none focus:border-white/30 transition-colors resize-none min-h-[80px]"
                                    placeholder="What is the main feature?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Editable Generated Architecture Card */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-semibold tracking-tight text-white">
                                Generated Architecture
                            </h2>
                            {diagram && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Modifications detect: reload diagram & critique</span>
                                </div>
                            )}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                            <div className="space-y-8">
                                {/* Features */}
                                <EditableList title="Features" items={blueprint.features || []} onItemsChange={items => handleUpdateBlueprintField('features', items)} />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Tech Stack */}
                                    <EditableList title="Tech Stack" items={blueprint.techStack || []} onItemsChange={items => handleUpdateBlueprintField('techStack', items)} />

                                    {/* Database Tables */}
                                    <EditableList title="Database Tables" items={blueprint.databaseTables || []} mono onItemsChange={items => handleUpdateBlueprintField('databaseTables', items)} />
                                </div>

                                {/* API Routes */}
                                <EditableList title="API Routes" items={blueprint.apiRoutes || []} mono onItemsChange={items => handleUpdateBlueprintField('apiRoutes', items)} />

                                {/* Development Roadmap */}
                                <EditableList title="Development Roadmap" items={blueprint.roadmap || []} onItemsChange={items => handleUpdateBlueprintField('roadmap', items)} />
                            </div>

                            {/* AI Source Metadata */}
                            {metadata && (
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">
                                        <span className={`h-1.5 w-1.5 rounded-full ${metadata.usedFallback || metadata.provider === "local" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                                        Generated using: {metadata.sourceLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                </div> {/* End Left Column */}

                {/* RIGHT COLUMN */}
                <div className="xl:col-span-5 flex flex-col gap-8">

                    {/* Redesigned Refine Architecture Card */}
                    <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
                        <div className="px-6 py-6 sm:px-10 sm:py-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold tracking-tight text-white mb-2">Refine Architecture</h3>
                                <p className="text-sm text-zinc-400">
                                    Ask the AI to improve, restructure, or expand upon the current blueprint.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Row 1: Full-width Instruction Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        placeholder="e.g. Add authentication, Optimize for mobile users, Make it more scalable..."
                                        className="w-full rounded-xl bg-zinc-900 border border-white/10 p-4 pr-12 text-sm text-zinc-200 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-600 shadow-inner"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                const hasContent = instructions.trim().length > 0 || selectedPresets.length > 0;
                                                if (hasContent) {
                                                    handleImprove();
                                                }
                                            }
                                        }}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Refine Presets Integration */}
                                <RefinePresets
                                    onTogglePreset={(id) => {
                                        setSelectedPresets(prev =>
                                            prev.includes(id)
                                                ? prev.filter(p => p !== id)
                                                : [...prev, id]
                                        );
                                    }}
                                    selectedPresetIds={selectedPresets}
                                    isApplying={isImproving || isGenerating || isExplaining || isGeneratingDiagram || isCritiquing || isSuggesting}
                                />

                                {/* Row 2: Action Buttons */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-wrap gap-3 order-2 lg:order-1">
                                        <button
                                            onClick={handleGenerateDiagram}
                                            disabled={isGeneratingDiagram}
                                            className="flex min-w-[160px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 h-11 px-6 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
                                        >
                                            {isGeneratingDiagram ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white"></div>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                                                </svg>
                                            )}
                                            {diagram ? "Regenerate Diagram (Live Sync)" : "Generate Diagram"}
                                        </button>
                                        <button
                                            onClick={handleExplain}
                                            disabled={isExplaining}
                                            className="flex min-w-[160px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 h-11 px-6 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
                                        >
                                            {isExplaining ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white"></div>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                                </svg>
                                            )}
                                            Explain Architecture
                                        </button>
                                        <button
                                            onClick={handleCritique}
                                            disabled={isCritiquing}
                                            className="flex min-w-[160px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 h-11 px-6 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
                                        >
                                            {isCritiquing ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white"></div>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            Critique Architecture
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleImprove}
                                        disabled={isImproving || (!instructions.trim() && selectedPresets.length === 0)}
                                        className="flex order-1 lg:order-2 min-w-[200px] w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 h-11 px-8 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isImproving ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                </svg>
                                                Improve Blueprint
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div >

                    {/* Architecture Suggestions UI */}
                    {
                        suggestions && (
                            <ArchitectureSuggestions
                                result={suggestions}
                                onSelectSuggestion={(instruction) => {
                                    setInstructions(instruction);
                                    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" }); // scroll slightly up towards refine panel
                                }}
                                isApplying={isImproving}
                            />
                        )
                    }

                    {/* Diff Summary UI */}
                    {
                        diffResult && hasAnyChanges(diffResult) && (
                            <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                <h3 className="text-lg font-semibold tracking-tight text-white mb-2 ml-1">Changes from previous blueprint</h3>
                                <p className="text-sm text-zinc-400 mb-6 ml-1">Here is a structural summary of the improvements.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {Object.entries(diffResult).map(([sectionKey, diff]) => {
                                        if (diff.added.length === 0 && diff.removed.length === 0) return null;
                                        const titleMap: Record<string, string> = {
                                            features: "Features",
                                            techStack: "Tech Stack",
                                            databaseTables: "Database Tables",
                                            apiRoutes: "API Routes",
                                            roadmap: "Roadmap"
                                        };
                                        return (
                                            <div key={sectionKey} className="rounded-xl bg-zinc-900/50 p-5 border border-white/5">
                                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">{titleMap[sectionKey] || sectionKey}</h4>
                                                <ul className="space-y-2 text-sm">
                                                    {diff.added.map((item: string, i: number) => (
                                                        <li key={`add-${i}`} className="flex items-start text-emerald-400">
                                                            <span className="mr-2 font-mono mt-0.5">+</span>
                                                            <span className="leading-relaxed">{item}</span>
                                                        </li>
                                                    ))}
                                                    {diff.removed.map((item: string, i: number) => (
                                                        <li key={`rm-${i}`} className="flex items-start text-rose-400 opacity-80">
                                                            <span className="mr-2 font-mono mt-0.5">-</span>
                                                            <span className="leading-relaxed line-through">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }
                    {
                        diffResult && !hasAnyChanges(diffResult) && (
                            <div className="mb-8 rounded-2xl border border-zinc-500/20 bg-zinc-900/50 p-6 shadow-xl backdrop-blur-sm sm:p-8 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-zinc-500"></div>
                                <p className="text-sm text-zinc-300">No structural changes detected from this improvement pass.</p>
                            </div>
                        )
                    }

                    {/* Architecture Explanation UI */}
                    {
                        explanation && (
                            <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                <h3 className="text-lg font-semibold tracking-tight text-emerald-400 mb-4 ml-1">Architecture Explanation</h3>
                                <div className="rounded-xl bg-zinc-900/50 p-6 border border-emerald-500/10">
                                    <div className="prose prose-invert prose-emerald max-w-none prose-sm sm:prose-base leading-relaxed text-zinc-300">
                                        {explanation.explanation.split('\n').map((paragraph, i) => {
                                            // Simple line break rendering instead of a full markdown parser to keep dependencies low
                                            if (paragraph.trim().startsWith('- ')) {
                                                return <li key={i} className="ml-4 list-disc">{paragraph.replace('- ', '')}</li>;
                                            }
                                            if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                                                return <p key={i} className="font-semibold text-zinc-200 mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</p>;
                                            }
                                            if (paragraph.trim().startsWith('###')) {
                                                return <h4 key={i} className="text-lg font-semibold text-emerald-300 mt-6 mb-3">{paragraph.replace(/###/g, '').trim()}</h4>;
                                            }
                                            return <p key={i} className="mb-4">{paragraph}</p>;
                                        })}
                                    </div>
                                </div>
                                {explanation.metadata && (
                                    <div className="mt-4 flex items-center justify-end">
                                        <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">
                                            <span className={`h-1.5 w-1.5 rounded-full ${explanation.metadata.usedFallback || explanation.metadata.provider === "local" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                                            Explained via: {explanation.metadata.sourceLabel}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* Architecture Diagram UI */}
                    {
                        diagram && (
                            <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                <div className="mb-4 flex items-center justify-between ml-1">
                                    <h3 className="text-lg font-semibold tracking-tight text-blue-400">Architecture Diagram (Mermaid)</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDownloadSVG}
                                            disabled={!renderedSvg}
                                            className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Download SVG
                                        </button>
                                        <button
                                            onClick={handleDownloadPNG}
                                            disabled={!renderedSvg}
                                            className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Download PNG
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(diagram.diagram);
                                                window.alert("Mermaid code copied to clipboard!");
                                            }}
                                            className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                                        >
                                            Copy Mermaid
                                        </button>
                                    </div>
                                </div>

                                {/* Live Diagram Preview */}
                                <div className="mb-6">
                                    <MermaidDiagram
                                        source={diagram.diagram}
                                        onRender={(svg) => setRenderedSvg(svg)}
                                    />
                                </div>

                                <div className="mb-3 flex items-center justify-between ml-1">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Mermaid Source</h4>
                                    <span className="text-[10px] text-zinc-500 italic">Rendered via Mermaid.js</span>
                                </div>

                                <div className="rounded-xl bg-zinc-900/80 p-6 border border-blue-500/10 font-mono text-sm overflow-x-auto whitespace-pre leading-relaxed text-blue-100/90">
                                    {diagram.diagram}
                                </div>


                                <p className="mt-4 text-xs text-zinc-500 italic ml-1">
                                    Note: Exports are generated from the live rendered Mermaid preview above. You can also copy the source for external editors.
                                </p>

                                {/* TODO: transparent PNG export depth */}
                                {/* TODO: higher resolution PNG export (custom scale) */}
                                {/* TODO: PDF export integration */}
                                {/* TODO: theme selection for exports */}
                                {/* TODO: batch export (All formats) */}

                                {diagram.metadata && (
                                    <div className="mt-4 flex items-center justify-end">
                                        <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">
                                            <span className={`h-1.5 w-1.5 rounded-full ${diagram.metadata.usedFallback || diagram.metadata.provider === "local" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                                            Generated via: {diagram.metadata.sourceLabel}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* Architecture Critique UI */}
                    {
                        critique && (
                            <div className="mb-8">
                                <ArchitectureCritique critique={critique} />
                            </div>
                        )
                    }

                    {/* Blueprint Versions UI */}
                    {
                        project && project.versions && project.versions.length > 0 && (
                            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold tracking-tight text-white">Blueprint Versions</h3>
                                    <p className="text-sm text-zinc-500">Track and restore historical versions of this blueprint.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {[...project.versions].reverse().map((v) => (
                                        <div
                                            key={v.id}
                                            className={`relative flex flex-col rounded-xl border p-4 transition-all ${v.id === activeVersionId
                                                ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20"
                                                : "border-white/10 bg-zinc-900/50 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className={`text-sm font-bold ${v.id === activeVersionId ? "text-blue-400" : "text-zinc-400"}`}>
                                                    {v.label}
                                                </span>
                                                {v.id === activeVersionId && (
                                                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <span className="mb-4 text-[10px] text-zinc-600 font-medium">
                                                {new Date(v.createdAt).toLocaleString()}
                                            </span>

                                            {v.id !== activeVersionId && (
                                                <button
                                                    onClick={() => handleRestore(v.id)}
                                                    className="mt-auto w-full rounded-lg bg-white/5 py-2 text-xs font-semibold text-zinc-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                                                >
                                                    Restore Version
                                                </button>
                                            )}
                                            {v.id === activeVersionId && (
                                                <div className="mt-auto py-2 text-center text-[10px] font-medium text-zinc-500 italic">
                                                    Currently viewing
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* TODO: compare any two versions */}
                                {/* TODO: version notes/comments */}
                                {/* TODO: auto-save checkpoints */}
                                {/* TODO: branching and forks */}
                                {/* TODO: pin favorite versions */}
                                {/* TODO: interactive timeline view */}
                            </div>
                        )
                    }

                    {/* Ask the Architect (Chat) UI */}
                    {
                        blueprint && (
                            <div className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold tracking-tight text-indigo-400">Ask the Architect</h3>
                                    <p className="text-sm text-indigo-300/60">Ask follow-up questions about this blueprint architecture.</p>
                                </div>

                                {/* Chat History */}
                                <div className="mb-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                                            <div className="mb-3 rounded-full bg-indigo-500/10 p-4 text-indigo-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.023c.09-.457.133-.925.133-1.393A8.814 8.814 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium">No messages yet.</p>
                                            <p className="mt-1 text-xs">How can I help refine your architecture?</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                                                    : "bg-zinc-900 border border-indigo-500/10 text-zinc-300"
                                                    }`}>
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {isChatting && (
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-zinc-900 border border-indigo-500/10 text-zinc-300">
                                                <div className="flex gap-1">
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500"></span>
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.2s]"></span>
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.4s]"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Suggestion Chips */}
                                {!isChatting && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {[
                                            "Should this use Redis caching?",
                                            "How would I scale this system?",
                                            "How should authentication work?"
                                        ].map((tip, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleChat(tip)}
                                                className="rounded-full bg-indigo-500/5 border border-indigo-500/20 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all font-medium"
                                            >
                                                {tip}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Chat Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ask a question..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isChatting && handleChat()}
                                        className="w-full rounded-xl bg-zinc-900 border border-indigo-500/10 p-4 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/30 transition-all"
                                    />
                                    <button
                                        onClick={() => !isChatting && handleChat()}
                                        disabled={isChatting || !chatInput.trim()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        {isChatting ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {lastChatResult?.metadata && (
                                    <div className="mt-4 flex items-center justify-end">
                                        <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[10px] font-medium text-zinc-500">
                                            <span className={`h-1 w-1 rounded-full ${lastChatResult.metadata.usedFallback || lastChatResult.metadata.provider === "local" ? "bg-amber-500" : "bg-indigo-500"}`}></span>
                                            Last reply via: {lastChatResult.metadata.sourceLabel}
                                        </span>
                                    </div>
                                )}

                                {/* TODO: streaming replies */}
                                {/* TODO: multi-turn persistence */}
                                {/* TODO: architecture critique mode */}
                                {/* TODO: code-level follow-up generation */}
                                {/* TODO: section-specific chat */}
                                {/* TODO: save chat with blueprint */}
                            </div>
                        )
                    }

                </div>{/* End Right Column */}
            </div>{/* End Grid */}

            {/* Mobile Save Button */}
            <div className="mt-8 flex flex-col gap-3 sm:hidden">
                <button
                    onClick={handleShareExport}
                    className="w-full rounded-full border border-blue-500/30 bg-blue-500/10 px-8 py-4 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/20 active:scale-95"
                >
                    Share Blueprint
                </button>
                <div className="text-center w-full text-xs text-zinc-500 max-w-xs mx-auto mb-2">
                    Export a shareable blueprint file that can be imported into another AppForge instance.
                </div>
                <button
                    onClick={() => router.push(`/project/blueprint/preview?id=${idParam || ""}`)}
                    className="w-full rounded-full border border-indigo-500/30 bg-indigo-500/10 px-8 py-4 text-sm font-semibold text-indigo-400 transition-all hover:bg-indigo-500/20 active:scale-95"
                >
                    Preview Project
                </button>
                <button
                    onClick={handleExportZip}
                    className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                    Export ZIP (Docs)
                </button>
                <button
                    onClick={handleExportBundle}
                    className="w-full rounded-full border border-white/20 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Export Project Bundle
                </button>
                <button
                    onClick={handleExportMarkdown}
                    className="w-full rounded-full border border-white/20 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Export Markdown Files
                </button>
                <button
                    onClick={handleExport}
                    className="w-full rounded-full bg-white/10 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
                >
                    Export Starter Pack
                </button>
                <button
                    onClick={handleRegenerate}
                    className="w-full rounded-full border border-white/20 bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-95"
                >
                    Regenerate Blueprint
                </button>
                {idParam && (
                    <button
                        onClick={handleUpdate}
                        className="w-full rounded-full border border-white/20 bg-zinc-800 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-zinc-700 active:scale-95"
                    >
                        Update Project
                    </button>
                )}
                <button
                    onClick={handleSave}
                    className="w-full rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 active:scale-95"
                >
                    Save Blueprint
                </button>
            </div>
        </>
    );
}

export default function BlueprintPreview() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32">
                {/* Header */}
                <header className="mb-12">
                    <ErrorBoundary fallback={<div className="p-8 text-center text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-lg backdrop-blur-sm mt-8"><p className="font-bold mb-2">Something went wrong.</p><p className="text-sm">An error occurred while rendering the blueprint. Please try refreshing the page or loading a different project.</p></div>}>
                        <Suspense fallback={<div className="text-zinc-500">Loading Blueprint...</div>}>
                            <BlueprintContent />
                        </Suspense>
                    </ErrorBoundary>
                </header>
            </div>
        </div>
    );
}
