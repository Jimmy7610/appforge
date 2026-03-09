"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen } from "lucide-react";
import { FileNode } from "@/lib/utils/preview-utils";

interface BrowserTreeProps {
    nodes: FileNode[];
    onSelect: (node: FileNode) => void;
    activePath?: string;
}

export function BrowserTree({ nodes, onSelect, activePath }: BrowserTreeProps) {
    return (
        <div className="space-y-1 select-none font-mono text-sm">
            {nodes.map((node) => (
                <TreeNode
                    key={node.path}
                    node={node}
                    onSelect={onSelect}
                    activePath={activePath}
                    depth={0}
                />
            ))}
        </div>
    );
}

interface TreeNodeProps {
    node: FileNode;
    onSelect: (node: FileNode) => void;
    activePath?: string;
    depth: number;
}

function TreeNode({ node, onSelect, activePath, depth }: TreeNodeProps) {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === "folder";
    const isActive = activePath === node.path;

    const handleClick = () => {
        if (isFolder) {
            setIsOpen(!isOpen);
        } else {
            onSelect(node);
        }
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isActive
                        ? "bg-blue-500/10 text-blue-400 font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {isFolder ? (
                    <>
                        <span className="w-4 h-4 flex items-center justify-center">
                            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </span>
                        <span className="w-4 h-4 text-blue-500/60">
                            {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="w-4 h-4" />
                        <span className="w-4 h-4 text-zinc-500">
                            <FileCode className="w-4 h-4" />
                        </span>
                    </>
                )}
                <span className="truncate">{node.name}</span>
            </div>

            {isFolder && isOpen && node.children && (
                <div className="mt-0.5">
                    {node.children.map((child) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            onSelect={onSelect}
                            activePath={activePath}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
