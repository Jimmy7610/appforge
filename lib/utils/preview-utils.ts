export interface FileNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: FileNode[];
    content?: string;
}

/**
 * Converts a flat Record of file paths and contents into a hierarchical tree structure.
 * @param files A record where the key is the relative file path and values are content.
 */
export function buildFileTree(files: Record<string, string>): FileNode[] {
    const root: FileNode[] = [];

    // Temporary map to keep track of folder nodes by their full path
    const folderMap: Record<string, FileNode> = {};

    // Sort paths to ensure we process parent folders before their children
    const paths = Object.keys(files).sort();

    for (const filePath of paths) {
        const parts = filePath.split("/");
        let currentPath = "";

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (isLast) {
                // It's a file
                const fileNode: FileNode = {
                    name: part,
                    path: currentPath,
                    type: "file",
                    content: files[filePath]
                };

                if (parentPath && folderMap[parentPath]) {
                    folderMap[parentPath].children = folderMap[parentPath].children || [];
                    folderMap[parentPath].children!.push(fileNode);
                } else {
                    root.push(fileNode);
                }
            } else {
                // It's a folder
                if (!folderMap[currentPath]) {
                    const folderNode: FileNode = {
                        name: part,
                        path: currentPath,
                        type: "folder",
                        children: []
                    };
                    folderMap[currentPath] = folderNode;

                    if (parentPath && folderMap[parentPath]) {
                        folderMap[parentPath].children = folderMap[parentPath].children || [];
                        folderMap[parentPath].children!.push(folderNode);
                    } else {
                        root.push(folderNode);
                    }
                }
            }
        }
    }

    // Secondary sort to ensure folders appear before files in each level
    const sortNodes = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
        for (const node of nodes) {
            if (node.children) {
                sortNodes(node.children);
            }
        }
    };

    sortNodes(root);
    return root;
}
