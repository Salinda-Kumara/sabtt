import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { io } from 'socket.io-client';
import type { BuildingWithSchedules, DayOfWeek } from '@/types/database';
import { useParams } from 'react-router-dom';
import { Sun, Moon, Monitor as MonitorIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DAYS: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function getCurrentDay(): DayOfWeek {
    return DAYS[new Date().getDay()];
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export default function DisplayPage() {
    const { buildingCode } = useParams();
    const { theme, setTheme } = useTheme();
    const [buildings, setBuildings] = useState<BuildingWithSchedules[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [time, setTime] = useState(new Date());
    const [universityName, setUniversityName] = useState('University of Technology');
    const [displayInterval, setDisplayInterval] = useState(15);
    const [transitioning, setTransitioning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [buildingsRes, settingsRes] = await Promise.all([
                api.get('/schedules/by-building'),
                api.get('/settings'),
            ]);
            if (buildingCode) {
                setBuildings(buildingsRes.data.filter((b: BuildingWithSchedules) =>
                    b.abbreviation.toLowerCase() === buildingCode.toLowerCase()
                ));
            } else {
                setBuildings(buildingsRes.data);
            }
            setUniversityName(settingsRes.data.universityName || 'University of Technology');
            setDisplayInterval(parseInt(settingsRes.data.displayInterval) || 15);
        } catch (err) { console.error(err); }
    }, [buildingCode]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-paging
    useEffect(() => {
        if (buildings.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                setCurrentPage((p) => (p + 1) % buildings.length);
                setTransitioning(false);
            }, 500);
        }, displayInterval * 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [buildings.length, displayInterval]);

    // Socket.IO real-time
    useEffect(() => {
        const socket = io();
        socket.on('schedule-changed', () => fetchData());
        socket.on('data-changed', () => fetchData());
        socket.on('settings-changed', () => fetchData());
        return () => { socket.disconnect(); };
    }, [fetchData]);

    const currentDay = getCurrentDay();
    const nowMinutes = time.getHours() * 60 + time.getMinutes();
    const currentBuilding = buildings[currentPage];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-[#0a0e1a] dark:via-[#0f1629] dark:to-[#0a0e1a] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="px-8 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-2xl">🎓</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{universityName}</h1>
                        <p className="text-blue-600/70 dark:text-blue-300/50 text-xs transition-colors">Timetable Display</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Theme Switcher */}
                    <div className="flex bg-white dark:bg-slate-800/50 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                        <button onClick={() => setTheme('light')} className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-slate-100 dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Light Mode">
                            <Sun className="w-4 h-4" />
                        </button>
                        <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-100 dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Dark Mode">
                            <Moon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setTheme('system')} className={`p-1.5 rounded-lg transition-all ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="System Preference">
                            <MonitorIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-mono font-bold tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent transition-colors">
                            {formatTime(time)}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-blue-300/40 mt-0.5 transition-colors">{formatDate(time)}</div>
                    </div>
                </div>
            </header>

            {/* Building Title */}
            {currentBuilding && (
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-500/20 text-white">
                            {currentBuilding.abbreviation}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{currentBuilding.name}</h2>
                            <p className="text-xs text-slate-500 dark:text-white/30 transition-colors">{currentBuilding.rooms.length} rooms · {currentDay.charAt(0) + currentDay.slice(1).toLowerCase()}</p>
                        </div>
                    </div>

                    {/* Page indicators */}
                    {buildings.length > 1 && (
                        <div className="flex items-center gap-2">
                            {buildings.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentPage ? 'w-8 bg-blue-600 dark:bg-blue-500' : 'w-1.5 bg-slate-300 dark:bg-white/15'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Room Cards */}
            <div className={`px-8 pb-8 transition-all duration-500 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {currentBuilding ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                        {currentBuilding.rooms.map((room) => {
                            const todaySchedules = room.schedules
                                .filter((s) => s.dayOfWeek === currentDay)
                                .sort((a, b) => a.startTime.localeCompare(b.startTime));

                            if (todaySchedules.length === 0) return null;

                            const currentClass = todaySchedules.find(
                                (s) => timeToMinutes(s.startTime) <= nowMinutes && timeToMinutes(s.endTime) > nowMinutes
                            );
                            const nextClass = todaySchedules.find(
                                (s) => timeToMinutes(s.startTime) > nowMinutes
                            );
                            const upcomingClasses = todaySchedules.filter(
                                (s) => timeToMinutes(s.startTime) > nowMinutes && s !== nextClass
                            );

                            // Progress for current class
                            let progress = 0;
                            if (currentClass) {
                                const start = timeToMinutes(currentClass.startTime);
                                const end = timeToMinutes(currentClass.endTime);
                                progress = ((nowMinutes - start) / (end - start)) * 100;
                            }

                            // Countdown for next class
                            let countdown = '';
                            if (nextClass) {
                                const diff = timeToMinutes(nextClass.startTime) - nowMinutes;
                                const hours = Math.floor(diff / 60);
                                const mins = diff % 60;
                                countdown = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                            }

                            return (
                                <div key={room.id} className="bg-white dark:bg-white/[0.03] backdrop-blur-sm shadow-sm dark:shadow-none border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-white/10 transition-all">
                                    {/* Room Header */}
                                    <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between transition-colors">
                                        <div>
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white transition-colors">{room.name}</h3>
                                            <p className="text-[11px] text-slate-500 dark:text-white/40 transition-colors">Capacity: {room.capacity}</p>
                                        </div>
                                        {currentClass && (
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 animate-pulse">
                                                IN PROGRESS
                                            </span>
                                        )}
                                        {!currentClass && nextClass && (
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                                                NEXT IN {countdown}
                                            </span>
                                        )}
                                        {!currentClass && !nextClass && todaySchedules.length === 0 && (
                                            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 transition-colors">
                                                FREE
                                            </span>
                                        )}
                                    </div>

                                    {/* Current Class */}
                                    {currentClass && (
                                        <div className="px-5 py-4 bg-emerald-50 dark:bg-emerald-500/[0.04] transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: currentClass.course.department.color }} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="font-bold text-lg leading-tight text-slate-900 dark:text-white transition-colors">{currentClass.course.name}</p>
                                                        {currentClass.batch && (
                                                            <span className="shrink-0 px-2 py-1 text-sm font-bold rounded-lg shadow-sm border" style={{ backgroundColor: `${currentClass.course.department.color}15`, color: currentClass.course.department.color, borderColor: `${currentClass.course.department.color}30` }}>
                                                                {currentClass.batch}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-white/50 transition-colors mt-1">{currentClass.course.code} · {currentClass.lecturer.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/40 mt-3 transition-colors">
                                                <span>{currentClass.startTime}</span>
                                                <span>{currentClass.endTime}</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-200 dark:bg-white/5 rounded-full mt-1 overflow-hidden transition-colors">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Next Class */}
                                    {nextClass && (
                                        <div className={`px-5 py-3 ${currentClass ? 'border-t border-slate-100 dark:border-white/[0.04]' : ''} transition-colors`}>
                                            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400/70 uppercase tracking-wider mb-1.5 transition-colors">Next Up</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: nextClass.course.department.color }} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="font-semibold text-sm text-slate-900 dark:text-white transition-colors">{nextClass.course.name}</p>
                                                        {nextClass.batch && (
                                                            <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded border" style={{ backgroundColor: `${nextClass.course.department.color}10`, color: nextClass.course.department.color, borderColor: `${nextClass.course.department.color}20` }}>
                                                                {nextClass.batch}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-white/40 transition-colors mt-0.5">
                                                        {nextClass.startTime} - {nextClass.endTime} · {nextClass.lecturer.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upcoming */}
                                    {upcomingClasses.length > 0 && (
                                        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/[0.04] transition-colors">
                                            <p className="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-2 transition-colors">Later</p>
                                            <div className="space-y-2">
                                                {upcomingClasses.slice(0, 3).map((s) => (
                                                    <div key={s.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/50 transition-colors">
                                                        <span className="font-mono">{s.startTime}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/15 transition-colors" />
                                                        <span className="truncate">{s.course.code} - {s.course.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty state (removed via filter, but kept for safety if needed) */}
                                    {todaySchedules.length === 0 && (
                                        <div className="px-5 py-8 text-center text-slate-400 dark:text-white/20 text-sm transition-colors">
                                            No classes today
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {currentBuilding.rooms.filter(room => room.schedules.some(s => s.dayOfWeek === currentDay)).length === 0 && (
                            <div className="col-span-full flex items-center justify-center h-64 text-slate-500 dark:text-white/20 transition-colors">
                                <p className="text-lg">No classes scheduled in this building today</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-slate-500 dark:text-white/20 transition-colors">
                        <p className="text-lg">No schedule data available</p>
                    </div>
                )}
            </div>

            {/* Auto-page Progress Bar */}
            {buildings.length > 1 && (
                <div className="fixed bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-white/[0.02] transition-colors">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-500/50 dark:to-indigo-500/50 transition-colors"
                        style={{
                            animation: `progress ${displayInterval}s linear infinite`,
                        }}
                    />
                </div>
            )}

            <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
        </div>
    );
}
