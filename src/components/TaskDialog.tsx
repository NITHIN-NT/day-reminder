'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    description?: string;
    remind_at?: string;
    is_active: boolean;
}

interface TaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    initialTask?: Task | null;
}

export default function TaskDialog({ isOpen, onClose, onSave, initialTask }: TaskDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [remindAt, setRemindAt] = useState('');

    useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title);
            setDescription(initialTask.description || '');
            setRemindAt(initialTask.remind_at || '');
        } else {
            setTitle('');
            setDescription('');
            setRemindAt('');
        }
    }, [initialTask, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            description,
            remind_at: remindAt || undefined,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-50">
                            <h2 className="text-xl font-medium text-gray-900">
                                {initialTask ? 'Edit Task' : 'New Task'}
                            </h2>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="E.g., Leetcode Daily"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-light"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional details..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-light resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Reminder Time (WhatsApp)</label>
                                    <input
                                        type="time"
                                        value={remindAt}
                                        onChange={(e) => setRemindAt(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-light"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 rounded-2xl font-medium hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-all active:scale-[0.98]"
                                >
                                    {initialTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
