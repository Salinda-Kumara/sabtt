import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { ScheduleEntry, Course, Room, Lecturer, Building, DayOfWeek, SessionMode } from '@/types/database';
import { Calendar, Plus, Filter, X, AlertTriangle, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays, Download } from 'lucide-react';
import { exportSchedulePdf } from '@/lib/exportSchedulePdf';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<DayOfWeek, string> = {
    MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
    FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};
const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
    MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
    FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [loading, setLoading] = useState(true);
    const [universityName, setUniversityName] = useState('University of Technology');

    // View mode
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
        const jsDay = new Date().getDay();
        return DAYS[jsDay === 0 ? 6 : jsDay - 1]; // Convert JS day (0=Sun) to our DAYS index
    });

    // Filters
    const [filterBuilding, setFilterBuilding] = useState('');
    const [filterRoom, setFilterRoom] = useState('');

    // Form
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ScheduleEntry | null>(null);
    const [formDay, setFormDay] = useState<DayOfWeek>('MONDAY');
    const [formStartTime, setFormStartTime] = useState('09:00');
    const [formEndTime, setFormEndTime] = useState('11:00');
    const [formCourseId, setFormCourseId] = useState('');
    const [formRoomId, setFormRoomId] = useState('');
    const [formLecturerId, setFormLecturerId] = useState('');

    // Course Dropdown state
    const [isCourseOpen, setIsCourseOpen] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    // Lecturer Dropdown state
    const [isLecturerOpen, setIsLecturerOpen] = useState(false);
    const [lecturerSearch, setLecturerSearch] = useState('');
    const [formBatch, setFormBatch] = useState('');
    const [formWeekNumber, setFormWeekNumber] = useState(1);
    const [formSessionMode, setFormSessionMode] = useState<SessionMode>('PHYSICAL');
    const [formError, setFormError] = useState('');
    const [conflicts, setConflicts] = useState<string[]>([]);

    const fetchData = async () => {
        try {
            const [sRes, cRes, rRes, bRes, lRes, settRes] = await Promise.all([
                api.get('/schedules'),
                api.get('/courses'),
                api.get('/rooms'),
                api.get('/buildings'),
                api.get('/lecturers'),
                api.get('/settings'),
            ]);
            setSchedules(sRes.data);
            setCourses(cRes.data);
            setRooms(rRes.data);
            setUniversityName(settRes.data.universityName || 'University of Technology');
            setBuildings(bRes.data);
            setLecturers(lRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredSchedules = schedules.filter((s) => {
        if (filterBuilding && s.room.buildingId !== filterBuilding) return false;
        if (filterRoom && s.roomId !== filterRoom) return false;
        return true;
    });

    const openForm = (day?: DayOfWeek, hour?: number, entry?: ScheduleEntry) => {
        setFormError('');
        setConflicts([]);
        if (entry) {
            setEditing(entry);
            setFormDay(entry.dayOfWeek);
            setFormStartTime(entry.startTime);
            setFormEndTime(entry.endTime);
            setFormCourseId(entry.courseId);
            setFormRoomId(entry.roomId);
            setFormLecturerId(entry.lecturerId);
            setFormBatch(entry.batch || '');
            setFormWeekNumber(entry.weekNumber || 1);
            setFormSessionMode(entry.sessionMode || 'PHYSICAL');
            const c = courses.find((x) => x.id === entry.courseId);
            setCourseSearch(c ? `${c.code} - ${c.name}` : '');
            const l = lecturers.find((x) => x.id === entry.lecturerId);
            setLecturerSearch(l ? l.name : '');
        } else {
            setEditing(null);
            setFormDay(day || 'MONDAY');
            setFormStartTime(hour ? `${String(hour).padStart(2, '0')}:00` : '09:00');
            setFormEndTime(hour ? `${String(hour + 1).padStart(2, '0')}:00` : '10:00');
            setFormCourseId('');
            setFormRoomId(filterRoom || rooms[0]?.id || '');
            setFormLecturerId(lecturers[0]?.id || '');
            setFormBatch('');
            setFormWeekNumber(1);
            setFormSessionMode('PHYSICAL');
            setCourseSearch('');
            setLecturerSearch('');
        }
        setIsCourseOpen(false);
        setIsLecturerOpen(false);
        setShowForm(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setConflicts([]);
        try {
            const data = {
                courseId: formCourseId,
                roomId: formRoomId,
                lecturerId: formLecturerId,
                dayOfWeek: formDay,
                startTime: formStartTime,
                endTime: formEndTime,
                batch: formBatch,
                weekNumber: formWeekNumber,
                sessionMode: formSessionMode,
            };
            if (editing) {
                await api.put(`/schedules/${editing.id}`, data);
            } else {
                await api.post('/schedules', data);
            }
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setConflicts(err.response.data.conflicts);
                setFormError('Schedule conflict detected!');
            } else {
                setFormError('Failed to save. Please try again.');
            }
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Delete this schedule entry?')) return;
        try { await api.delete(`/schedules/${id}`); fetchData(); }
        catch (err) { console.error(err); }
    };

    const getEntryPosition = (entry: ScheduleEntry) => {
        const [startH, startM] = entry.startTime.split(':').map(Number);
        const [endH, endM] = entry.endTime.split(':').map(Number);
        const top = ((startH - 7) * 60 + startM) * (60 / 60); // px per minute
        const height = ((endH - startH) * 60 + (endM - startM)) * (60 / 60);
        return { top, height };
    };

    // Calculate overlap groups for entries in the same day
    const getOverlapLayout = (entries: ScheduleEntry[]) => {
        const sorted = [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const layout: Map<string, { col: number; totalCols: number }> = new Map();
        const groups: ScheduleEntry[][] = [];

        for (const entry of sorted) {
            let placed = false;
            for (const group of groups) {
                const overlaps = group.some((e) => e.startTime < entry.endTime && e.endTime > entry.startTime);
                if (overlaps) {
                    group.push(entry);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                groups.push([entry]);
            }
        }

        // Build connected overlap clusters
        const clusters: ScheduleEntry[][] = [];
        for (const entry of sorted) {
            let addedToCluster = false;
            for (const cluster of clusters) {
                const overlapsAny = cluster.some((e) => e.startTime < entry.endTime && e.endTime > entry.startTime);
                if (overlapsAny) {
                    cluster.push(entry);
                    addedToCluster = true;
                    break;
                }
            }
            if (!addedToCluster) {
                clusters.push([entry]);
            }
        }

        for (const cluster of clusters) {
            const totalCols = cluster.length;
            cluster.forEach((entry, idx) => {
                layout.set(entry.id, { col: idx, totalCols });
            });
        }

        return layout;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;
    }

    const displayDays = DAYS; // Show all 7 days

    const prevDay = () => {
        const idx = DAYS.indexOf(selectedDay);
        setSelectedDay(DAYS[(idx - 1 + 7) % 7]);
    };
    const nextDay = () => {
        const idx = DAYS.indexOf(selectedDay);
        setSelectedDay(DAYS[(idx + 1) % 7]);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        Schedule Manager
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Visual weekly timetable grid</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 transition-colors">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" /> Week
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <CalendarDays className="w-3.5 h-3.5" /> Day
                        </button>
                    </div>
                    <button
                        onClick={() => exportSchedulePdf({
                            schedules: filteredSchedules,
                            universityName,
                            mode: viewMode,
                            selectedDay,
                        })}
                        className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button onClick={() => openForm()} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Entry
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center gap-4 transition-colors">
                <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <select value={filterBuilding} onChange={(e) => { setFilterBuilding(e.target.value); setFilterRoom(''); }}
                    className="px-3 py-1.5 text-sm bg-transparent border border-slate-200 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-slate-200 transition-colors">
                    <option value="" className="dark:bg-slate-900">All Buildings</option>
                    {buildings.map((b) => <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name}</option>)}
                </select>
                <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-transparent border border-slate-200 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-slate-200 transition-colors">
                    <option value="" className="dark:bg-slate-900">All Rooms</option>
                    {rooms.filter((r) => !filterBuilding || r.buildingId === filterBuilding).map((r) => (
                        <option key={r.id} value={r.id} className="dark:bg-slate-900">{r.name} ({r.building?.name})</option>
                    ))}
                </select>
                {(filterBuilding || filterRoom) && (
                    <button onClick={() => { setFilterBuilding(''); setFilterRoom(''); }} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            {/* Day Navigation (Day View only) */}
            {viewMode === 'day' && (
                <div className="flex items-center justify-center gap-4">
                    <button onClick={prevDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="flex gap-1">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedDay === day
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {DAY_LABELS[day]}
                            </button>
                        ))}
                    </div>
                    <button onClick={nextDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            )}

            {/* Weekly Grid */}
            {viewMode === 'week' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <div className="min-w-[1000px]">
                            {/* Day headers */}
                            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100 dark:border-slate-800 transition-colors">
                                <div className="p-2 text-center text-xs text-slate-400 dark:text-slate-500" />
                                {displayDays.map((day) => (
                                    <div key={day} className={`p-3 text-center font-semibold text-sm border-l border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors ${day === DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`} onClick={() => { setSelectedDay(day); setViewMode('day'); }}>
                                        {DAY_LABELS[day]}
                                    </div>
                                ))}
                            </div>

                            {/* Time grid */}
                            <div className="grid grid-cols-[60px_repeat(7,1fr)] relative" style={{ height: `${HOURS.length * 60}px` }}>
                                {/* Hour labels */}
                                <div className="relative">
                                    {HOURS.map((hour, i) => (
                                        <div key={hour} className="absolute left-0 right-0 text-right pr-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono transition-colors" style={{ top: `${i * 60}px` }}>
                                            {String(hour).padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>

                                {/* Day columns */}
                                {displayDays.map((day) => (
                                    <div key={day} className="relative border-l border-slate-50 dark:border-slate-800/50 transition-colors">
                                        {/* Hour lines */}
                                        {HOURS.map((_, i) => (
                                            <div key={i} className="absolute left-0 right-0 border-t border-slate-50 dark:border-slate-800/50 transition-colors" style={{ top: `${i * 60}px` }} />
                                        ))}

                                        {/* Clickable slots */}
                                        {HOURS.map((hour) => (
                                            <div
                                                key={hour}
                                                className="absolute left-0 right-0 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-colors z-0"
                                                style={{ top: `${(hour - 7) * 60}px`, height: '60px' }}
                                                onClick={() => openForm(day, hour)}
                                            />
                                        ))}

                                        {/* Schedule entries with overlap handling */}
                                        {(() => {
                                            const dayEntries = filteredSchedules.filter((s) => s.dayOfWeek === day);
                                            const overlapLayout = getOverlapLayout(dayEntries);
                                            return dayEntries.map((entry) => {
                                                const { top, height } = getEntryPosition(entry);
                                                const deptColor = entry.course.department?.color || '#6366f1';
                                                const layout = overlapLayout.get(entry.id) || { col: 0, totalCols: 1 };
                                                const widthPercent = 100 / layout.totalCols;
                                                const leftPercent = layout.col * widthPercent;
                                                return (
                                                    <div
                                                        key={entry.id}
                                                        className="absolute rounded-lg px-1.5 py-1 cursor-pointer z-10 overflow-hidden group border shadow-sm hover:shadow-md hover:z-20 transition-all dark:shadow-none"
                                                        style={{
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                            left: `calc(${leftPercent}% + 2px)`,
                                                            width: `calc(${widthPercent}% - 4px)`,
                                                            backgroundColor: deptColor + (document.documentElement.classList.contains('dark') ? '25' : '18'),
                                                            borderColor: deptColor + (document.documentElement.classList.contains('dark') ? '50' : '40'),
                                                        }}
                                                        onClick={(e) => { e.stopPropagation(); openForm(undefined, undefined, entry); }}
                                                    >
                                                        <div className="text-[10px] font-bold truncate" style={{ color: deptColor }}>{entry.course.code}</div>
                                                        {height > 35 && (
                                                            <>
                                                                <div className="text-[9px] text-slate-600 dark:text-slate-300 truncate transition-colors">{entry.course.name}</div>
                                                                <div className="text-[9px] text-slate-400 dark:text-slate-400 truncate transition-colors">{entry.lecturer.name}</div>
                                                                <div className="text-[9px] text-slate-400 dark:text-slate-400 truncate transition-colors">{entry.room.name}</div>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); remove(entry.id); }}
                                                            className="absolute top-0.5 right-0.5 p-0.5 text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-white/80 dark:bg-slate-900/80 rounded"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Day View */}
            {viewMode === 'day' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900 transition-colors">
                        <h3 className="font-semibold text-slate-900 dark:text-white transition-colors">{DAY_FULL_LABELS[selectedDay]}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{filteredSchedules.filter(s => s.dayOfWeek === selectedDay).length} classes scheduled</p>
                    </div>
                    <div className="grid grid-cols-[70px_1fr] relative" style={{ height: `${HOURS.length * 120}px` }}>
                        {/* Hour labels */}
                        <div className="relative border-r border-slate-100 dark:border-slate-800 transition-colors">
                            {HOURS.map((hour, i) => (
                                <div key={hour} className="absolute left-0 right-0 text-right pr-3 text-xs text-slate-400 dark:text-slate-500 font-mono transition-colors" style={{ top: `${i * 120}px` }}>
                                    {String(hour).padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        {/* Single day column */}
                        <div className="relative">
                            {/* Hour lines */}
                            {HOURS.map((_, i) => (
                                <div key={i} className="absolute left-0 right-0 border-t border-slate-50 dark:border-slate-800/50 transition-colors" style={{ top: `${i * 120}px` }} />
                            ))}

                            {/* Clickable slots */}
                            {HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    className="absolute left-0 right-0 cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-500/10 transition-colors z-0"
                                    style={{ top: `${(hour - 7) * 120}px`, height: '120px' }}
                                    onClick={() => openForm(selectedDay, hour)}
                                />
                            ))}

                            {/* Schedule entries */}
                            {(() => {
                                const dayEntries = filteredSchedules.filter((s) => s.dayOfWeek === selectedDay);
                                const overlapLayout = getOverlapLayout(dayEntries);
                                return dayEntries.map((entry) => {
                                    const [startH, startM] = entry.startTime.split(':').map(Number);
                                    const [endH, endM] = entry.endTime.split(':').map(Number);
                                    const top = ((startH - 7) * 60 + startM) * (120 / 60);
                                    const height = ((endH - startH) * 60 + (endM - startM)) * (120 / 60);
                                    const deptColor = entry.course.department?.color || '#6366f1';
                                    const layout = overlapLayout.get(entry.id) || { col: 0, totalCols: 1 };
                                    const widthPercent = 100 / layout.totalCols;
                                    const leftPercent = layout.col * widthPercent;
                                    return (
                                        <div
                                            key={entry.id}
                                            className="absolute rounded-xl px-4 py-2 cursor-pointer z-10 overflow-hidden group border shadow-sm hover:shadow-lg hover:z-20 transition-all dark:shadow-none"
                                            style={{
                                                top: `${top}px`,
                                                height: `${height}px`,
                                                left: `calc(${leftPercent}% + 4px)`,
                                                width: `calc(${widthPercent}% - 8px)`,
                                                backgroundColor: deptColor + (document.documentElement.classList.contains('dark') ? '25' : '12'),
                                                borderColor: deptColor + (document.documentElement.classList.contains('dark') ? '50' : '35'),
                                            }}
                                            onClick={(e) => { e.stopPropagation(); openForm(undefined, undefined, entry); }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold" style={{ color: deptColor }}>{entry.course.code}</span>
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: deptColor + (document.documentElement.classList.contains('dark') ? '30' : '18'), color: deptColor }}>{entry.course.classType}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate transition-colors">{entry.course.name}</p>
                                                    {height > 60 && (
                                                        <div className="mt-1 space-y-0.5">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">👤 {entry.lecturer.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">📍 {entry.room.name} ({entry.room.building?.name})</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono transition-colors">{entry.startTime} – {entry.endTime}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); remove(entry.id); }}
                                                    className="p-1 text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-white/80 dark:bg-slate-900/80 rounded-lg"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">{editing ? 'Edit Schedule Entry' : 'New Schedule Entry'}</h2>

                        {formError && (
                            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 transition-colors">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm font-medium transition-colors">
                                    <AlertTriangle className="w-4 h-4" /> {formError}
                                </div>
                                {conflicts.length > 0 && (
                                    <ul className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1 transition-colors">
                                        {conflicts.map((c, i) => <li key={i}>• {c}</li>)}
                                    </ul>
                                )}
                            </div>
                        )}

                        <form onSubmit={save} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Day</label>
                                    <select value={formDay} onChange={(e) => setFormDay(e.target.value as DayOfWeek)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors">
                                        {DAYS.map((d) => <option key={d} value={d} className="dark:bg-slate-900">{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
                                    </select>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Course</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={courseSearch}
                                            onChange={(e) => {
                                                setCourseSearch(e.target.value);
                                                setIsCourseOpen(true);
                                                if (formCourseId) setFormCourseId(''); // clear selection if typing
                                            }}
                                            onFocus={() => setIsCourseOpen(true)}
                                            onBlur={() => {
                                                // Delay hiding so clicks register
                                                setTimeout(() => setIsCourseOpen(false), 200);
                                            }}
                                            placeholder="Search course..."
                                            className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                            required={!formCourseId}
                                        />
                                        {isCourseOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto transition-colors">
                                                {courses
                                                    .filter(c => `${c.code} ${c.name}`.toLowerCase().includes(courseSearch.toLowerCase()))
                                                    .map(c => (
                                                        <div
                                                            key={c.id}
                                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${formCourseId === c.id ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                                                            onClick={() => {
                                                                setFormCourseId(c.id);
                                                                setCourseSearch(`${c.code} - ${c.name}`);
                                                                setIsCourseOpen(false);
                                                            }}
                                                        >
                                                            <span className="font-semibold">{c.code}</span> - {c.name}
                                                        </div>
                                                    ))}
                                                {courses.filter(c => `${c.code} ${c.name}`.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                                                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center transition-colors">No matching courses found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Start Time</label>
                                    <input type="time" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">End Time</label>
                                    <input type="time" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Room</label>
                                <select value={formRoomId} onChange={(e) => setFormRoomId(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" required>
                                    <option value="" className="dark:bg-slate-900">Select room</option>
                                    {rooms.map((r) => <option key={r.id} value={r.id} className="dark:bg-slate-900">{r.name} ({r.building?.name}) — Cap: {r.capacity}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Lecturer</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={lecturerSearch}
                                        onChange={(e) => {
                                            setLecturerSearch(e.target.value);
                                            setIsLecturerOpen(true);
                                            if (formLecturerId) setFormLecturerId(''); // clear selection if typing
                                        }}
                                        onFocus={() => setIsLecturerOpen(true)}
                                        onBlur={() => setTimeout(() => setIsLecturerOpen(false), 200)}
                                        placeholder="Search lecturer..."
                                        className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                        required={!formLecturerId}
                                    />
                                    {isLecturerOpen && (
                                        <div className="absolute top-auto bottom-full mb-1 z-20 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto transition-colors">
                                            {lecturers
                                                .filter(l => l.name.toLowerCase().includes(lecturerSearch.toLowerCase()))
                                                .map(l => (
                                                    <div
                                                        key={l.id}
                                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${formLecturerId === l.id ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                                                        onClick={() => {
                                                            setFormLecturerId(l.id);
                                                            setLecturerSearch(l.name);
                                                            setIsLecturerOpen(false);
                                                        }}
                                                    >
                                                        {l.name}
                                                    </div>
                                                ))}
                                            {lecturers.filter(l => l.name.toLowerCase().includes(lecturerSearch.toLowerCase())).length === 0 && (
                                                <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center transition-colors">No matching lecturers found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Batch</label>
                                    <input type="text" value={formBatch} onChange={(e) => setFormBatch(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" placeholder="e.g. Batch A" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Week Number</label>
                                    <input type="number" min={1} max={52} value={formWeekNumber} onChange={(e) => setFormWeekNumber(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Session Mode</label>
                                    <select value={formSessionMode} onChange={(e) => setFormSessionMode(e.target.value as SessionMode)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors">
                                        <option value="PHYSICAL" className="dark:bg-slate-900">Physical</option>
                                        <option value="ONLINE" className="dark:bg-slate-900">Online</option>
                                        <option value="HYBRID" className="dark:bg-slate-900">Hybrid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                {editing && (
                                    <button type="button" onClick={() => { remove(editing.id); setShowForm(false); }} className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all mr-auto">Delete</button>
                                )}
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
