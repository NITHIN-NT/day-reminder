'use client';

import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';

interface StatisticsProps {
    completionsCount: number;
    totalTasks: number;
    streak: number;
}

export default function Statistics({ completionsCount, totalTasks, streak }: StatisticsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
                label="Completion Rate"
                value={`${totalTasks > 0 ? Math.round((completionsCount / totalTasks) * 100) : 0}%`}
                color="bg-blue-50 text-blue-500"
            />
            <StatCard
                label="Active Streak"
                value={`${streak} days`}
                color="bg-orange-50 text-orange-500"
            />
            <StatCard
                label="Total Done"
                value={completionsCount.toString()}
                color="bg-green-50 text-green-500"
            />
        </div>
    );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center"
        >
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
                <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-medium text-gray-900">{value}</p>
        </motion.div>
    );
}
