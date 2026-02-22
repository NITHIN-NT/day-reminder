'use client';

import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
    completions: string[]; // Array of ISO date strings "YYYY-MM-DD"
}

export default function CalendarView({ completions }: CalendarViewProps) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-10"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">{format(today, 'MMMM yyyy')}</h3>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-300 uppercase py-2">
                        {d}
                    </div>
                ))}
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDone = completions.includes(dateStr);
                    const isToday = isSameDay(day, today);

                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "aspect-square rounded-xl flex items-center justify-center text-sm transition-all",
                                isDone ? "bg-black text-white" : "bg-gray-50 text-gray-400",
                                isToday && !isDone && "ring-2 ring-blue-100 text-blue-500 font-medium"
                            )}
                        >
                            {format(day, 'd')}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
