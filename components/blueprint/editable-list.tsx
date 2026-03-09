import { useState, useRef, useEffect } from "react";
import { Plus, X, Pencil, Check, GripVertical } from "lucide-react";

interface EditableListProps {
    title: string;
    items: string[];
    onItemsChange: (items: string[]) => void;
    placeholder?: string;
    mono?: boolean;
}

export function EditableList({ title, items = [], onItemsChange, placeholder = "Add new item...", mono = false }: EditableListProps) {
    const safeItems = Array.isArray(items) ? items : [];
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [newItemValue, setNewItemValue] = useState("");
    const [isAddingMsg, setIsAddingMsg] = useState(false); // just to show/hide add input
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing !== null && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSaveEdit = (idx: number) => {
        if (editValue.trim() === "") {
            handleDelete(idx);
        } else {
            const newItems = [...safeItems];
            newItems[idx] = editValue.trim();
            onItemsChange(newItems);
        }
        setIsEditing(null);
    };

    const handleDelete = (idx: number) => {
        const newItems = safeItems.filter((_, i) => i !== idx);
        onItemsChange(newItems);
        setIsEditing(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === "Enter") {
            handleSaveEdit(idx);
        } else if (e.key === "Escape") {
            setIsEditing(null);
        }
    };

    const handleAddNew = () => {
        if (newItemValue.trim()) {
            onItemsChange([...safeItems, newItemValue.trim()]);
            setNewItemValue("");
        }
    };

    const handleNewKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddNew();
        } else if (e.key === "Escape") {
            setNewItemValue("");
            setIsAddingMsg(false);
        }
    };

    return (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-5 flex flex-col h-full transition-all hover:bg-zinc-900/60 hover:border-white/10 group/section">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{title}</h3>
                <span className="text-[10px] text-zinc-600 font-medium opacity-0 group-hover/section:opacity-100 transition-opacity">
                    Editable
                </span>
            </div>

            <ul className={`space-y-2 flex-1 ${mono ? "font-mono text-sm" : ""}`}>
                {safeItems.map((item, idx) => (
                    <li key={idx} className="group flex items-start gap-2 rounded-lg p-1 -mx-1 hover:bg-white/5 transition-colors">
                        {isEditing === idx ? (
                            <div className="flex w-full items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, idx)}
                                    onBlur={() => handleSaveEdit(idx)}
                                    className={`w-full bg-zinc-950 border border-blue-500/50 rounded-md px-3 py-1.5 text-zinc-200 outline-none focus:ring-1 focus:ring-blue-500/50 text-sm ${mono ? "font-mono text-xs" : ""}`}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="mt-1 flex-shrink-0 text-zinc-600 opacity-0 group-hover:opacity-50 cursor-grab">
                                    <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 text-zinc-300 leading-relaxed py-0.5 break-words text-sm">
                                    {item}
                                </div>
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditValue(item);
                                            setIsEditing(idx);
                                        }}
                                        className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                                        title="Edit item"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(idx)}
                                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                                        title="Delete item"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}

                {safeItems.length === 0 && !isAddingMsg && (
                    <div className="text-zinc-600 text-sm italic py-2 px-1">No items yet.</div>
                )}
            </ul>

            <div className="mt-4 pt-4 border-t border-white/5">
                {isAddingMsg ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            autoFocus
                            value={newItemValue}
                            onChange={(e) => setNewItemValue(e.target.value)}
                            onKeyDown={handleNewKeyDown}
                            placeholder={placeholder}
                            className={`flex-1 bg-zinc-950 border border-blue-500/30 rounded-lg px-3 py-2 text-zinc-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-sm placeholder:text-zinc-600 ${mono ? "font-mono" : ""}`}
                        />
                        <button
                            onClick={handleAddNew}
                            disabled={!newItemValue.trim()}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 transition-all"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setIsAddingMsg(false);
                                setNewItemValue("");
                            }}
                            className="p-2 hover:bg-white/5 text-zinc-400 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingMsg(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors py-1 px-1 rounded-md hover:bg-white/5 w-full"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add item
                    </button>
                )}
            </div>
        </div>
    );
}
