'use client';

import { useState } from 'react';
import { Check, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    description?: string;
    remind_at?: string;
    is_active: boolean;
}

interface TaskCardProps {
    task: Task;
    isCompleted: boolean;
    onToggle: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export default function TaskCard({ task, isCompleted, onToggle, onEdit, onDelete }: TaskCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "group relative flex items-center p-5 bg-white border border-gray-100 rounded-2xl transition-all hover:shadow-sm",
                isCompleted && "bg-gray-50/50"
            )}
        >
            <button
                onClick={() => onToggle(task.id)}
                className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-200 hover:border-blue-400"
                )}
            >
                {isCompleted && <Check size={18} />}
            </button>

            <div className="ml-4 flex-grow">
                <h3 className={cn(
                    "text-lg font-normal transition-all duration-300",
                    isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                )}>
                    {task.title}
                </h3>
                {task.description && (
                    <p className={cn(
                        "text-sm font-light mt-0.5 transition-all duration-300",
                        isCompleted ? "text-gray-300" : "text-gray-500"
                    )}>
                        {task.description}
                    </p>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={() => { onEdit(task); setShowMenu(false); }}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Edit2 size={14} className="mr-2" /> Edit
                            </button>
                            <button
                                onClick={() => { onDelete(task.id); setShowMenu(false); }}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={14} className="mr-2" /> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
