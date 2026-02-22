'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart2, LogOut, CheckCircle2, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TaskCard from '@/components/TaskCard';
import TaskDialog from '@/components/TaskDialog';
import Statistics from '@/components/Statistics';
import CalendarView from '@/components/CalendarView';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    description?: string;
    remind_at?: string;
    is_active: boolean;
}

interface Completion {
    task_id: string;
    completed_at: string;
}

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completions, setCompletions] = useState<Record<string, boolean>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);

    const today = formatDate(new Date());

    useEffect(() => {
        fetchTasks();
        fetchCompletions();

        // Set up real-time subscription
        const tasksSubscription = supabase
            .channel('tasks-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                fetchTasks();
            })
            .subscribe();

        const completionsSubscription = supabase
            .channel('completions-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, (payload) => {
                fetchCompletions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(tasksSubscription);
            supabase.removeChannel(completionsSubscription);
        };
    }, []);

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (data) setTasks(data);
        setLoading(false);
    };

    const fetchCompletions = async () => {
        const { data, error } = await supabase
            .from('completions')
            .select('task_id')
            .eq('completed_at', today);

        if (data) {
            const completionMap: Record<string, boolean> = {};
            data.forEach((c) => {
                completionMap[c.task_id] = true;
            });
            setCompletions(completionMap);
        }
    };

    const toggleTask = async (taskId: string) => {
        const isCompleted = completions[taskId];

        if (isCompleted) {
            const { error } = await supabase
                .from('completions')
                .delete()
                .eq('task_id', taskId)
                .eq('completed_at', today);

            if (!error) {
                setCompletions((prev) => {
                    const next = { ...prev };
                    delete next[taskId];
                    return next;
                });
            }
        } else {
            const { error } = await supabase
                .from('completions')
                .insert({
                    task_id: taskId,
                    completed_at: today,
                    user_id: (await supabase.auth.getUser()).data.user?.id // This might need user id if not using RLS auth.uid
                });

            if (!error) {
                setCompletions((prev) => ({ ...prev, [taskId]: true }));
            }
        }
    };

    const saveTask = async (taskData: Partial<Task>) => {
        if (editingTask) {
            await supabase
                .from('tasks')
                .update(taskData)
                .eq('id', editingTask.id);
        } else {
            await supabase
                .from('tasks')
                .insert({
                    ...taskData,
                    user_id: (await supabase.auth.getUser()).data.user?.id
                });
        }
        fetchTasks();
    };

    const deleteTask = async (taskId: string) => {
        await supabase
            .from('tasks')
            .update({ is_active: false })
            .eq('id', taskId);
        fetchTasks();
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.reload();
    };

    const [showStats, setShowStats] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [allCompletions, setAllCompletions] = useState<string[]>([]);

    useEffect(() => {
        fetchAllCompletions();
    }, []);

    const fetchAllCompletions = async () => {
        const { data } = await supabase
            .from('completions')
            .select('completed_at');
        if (data) {
            setAllCompletions(data.map(c => c.completed_at));
        }
    };

    const completedCount = Object.keys(completions).length;
    const totalCount = tasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30">
                <div className="max-w-screen-md mx-auto px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium text-gray-900">Today</h1>
                        <p className="text-gray-400 font-light text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setShowStats(!showStats); setShowCalendar(false); }}
                            className={cn(
                                "p-2.5 rounded-xl transition-all",
                                showStats ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <BarChart2 size={22} />
                        </button>
                        <button
                            onClick={() => { setShowCalendar(!showCalendar); setShowStats(false); }}
                            className={cn(
                                "p-2.5 rounded-xl transition-all",
                                showCalendar ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <Calendar size={22} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-1"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-md mx-auto px-6 pt-8">
                <AnimatePresence mode="wait">
                    {showStats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <Statistics
                                completionsCount={allCompletions.length}
                                totalTasks={tasks.length}
                                streak={12}
                            />
                        </motion.div>
                    )}

                    {showCalendar && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <CalendarView completions={allCompletions} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Statistics Card (Always shown compact) */}
                {!showStats && !showCalendar && (
                    <section className="mb-10 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Progress</p>
                                    <p className="text-2xl font-medium text-gray-900">{completedCount}/{totalCount} tasks</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                                <div>
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Streak</p>
                                    <p className="text-2xl font-medium text-gray-900 flex items-center justify-end gap-1">
                                        12 <Flame size={20} className="text-orange-500 fill-orange-500" />
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                    <Flame size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-black rounded-full"
                            />
                        </div>
                    </section>
                )}

                {/* Task List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Your Routine</h2>
                        <button
                            onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}
                            className="group flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <Plus size={16} /> Add Task
                        </button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode='popLayout'>
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-white border border-gray-50 rounded-2xl animate-pulse" />
                                ))
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
                                    <p className="text-gray-400 font-light">No tasks yet. Start by adding one!</p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        isCompleted={!!completions[task.id]}
                                        onToggle={toggleTask}
                                        onEdit={(t) => { setEditingTask(t); setIsDialogOpen(true); }}
                                        onDelete={deleteTask}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <TaskDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={saveTask}
                initialTask={editingTask}
            />
        </div>
    );
}
