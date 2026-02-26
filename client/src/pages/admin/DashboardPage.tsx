import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { DashboardStats } from '@/types/database';
import {
    Building2,
    DoorOpen,
    BookOpen,
    Users,
    CalendarDays,
    Clock,
    TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/stats')
            .then((res) => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    const statCards = [
        { label: 'Buildings', value: stats?.counts.buildings || 0, icon: Building2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
        { label: 'Rooms', value: stats?.counts.rooms || 0, icon: DoorOpen, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
        { label: 'Courses', value: stats?.counts.courses || 0, icon: BookOpen, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
        { label: 'Lecturers', value: stats?.counts.lecturers || 0, icon: Users, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
        { label: "Today's Classes", value: stats?.counts.todayClasses || 0, icon: CalendarDays, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50' },
    ];

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    Dashboard
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Overview of your timetable system</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{card.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 transition-colors">{card.value}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} shadow-md group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                        <CalendarDays className="w-5 h-5 text-blue-500" />
                        Today's Schedule
                    </h2>
                    <span className="text-xs text-slate-400 dark:text-slate-500 transition-colors">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                        {stats.todaySchedule.map((entry) => {
                            const isNow = currentTime >= entry.startTime && currentTime < entry.endTime;
                            const isPast = currentTime >= entry.endTime;
                            return (
                                <div
                                    key={entry.id}
                                    className={`px-6 py-4 flex items-center gap-4 transition-all ${isNow ? 'bg-blue-50/50 dark:bg-blue-900/10' : isPast ? 'opacity-50' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                        }`}
                                >
                                    {/* Time */}
                                    <div className="w-24 flex-shrink-0">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-colors" />
                                            <span className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                                                {entry.startTime}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-5 transition-colors">{entry.endTime}</span>
                                    </div>

                                    {/* Status dot */}
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isNow ? 'bg-green-500 animate-pulse' : isPast ? 'bg-slate-300 dark:bg-slate-700' : 'bg-blue-400 dark:bg-blue-500'
                                        }`} />

                                    {/* Course Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-slate-50 text-sm transition-colors">{entry.course.name}</span>
                                            <span
                                                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: entry.course.department.color + '15',
                                                    color: entry.course.department.color,
                                                }}
                                            >
                                                {entry.course.code}
                                            </span>
                                            {isNow && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 animate-pulse transition-colors">
                                                    IN PROGRESS
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
                                            {entry.lecturer.name} · {entry.room.building?.name} — {entry.room.name}
                                        </p>
                                    </div>

                                    {/* Class Type Badge */}
                                    <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0 transition-colors">
                                        {entry.course.classType}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 transition-colors">
                        <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No classes scheduled for today</p>
                    </div>
                )}
            </div>
        </div>
    );
}
