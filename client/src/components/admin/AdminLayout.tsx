import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
    LayoutDashboard,
    Calendar,
    Building2,
    BookOpen,
    Users,
    Settings,
    LogOut,
    GraduationCap,
    Monitor,
    X,
    ExternalLink,
    Sun,
    Moon,
    Layers
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/admin/rooms', icon: Building2, label: 'Rooms & Buildings' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/lecturers', icon: Users, label: 'Lecturers' },
    { to: '/admin/batches', icon: Layers, label: 'Batches' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [showDisplayModal, setShowDisplayModal] = useState(false);
    const [buildings, setBuildings] = useState<{ id: string; name: string; abbreviation: string }[]>([]);

    useEffect(() => {
        if (showDisplayModal) {
            api.get('/buildings')
                .then(res => setBuildings(res.data))
                .catch(err => console.error('Error fetching buildings', err));
        }
    }, [showDisplayModal]);

    const handleSignOut = () => {
        signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-30 transition-colors duration-200">
                {/* Brand */}
                <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-none transition-colors">TimeTable</h1>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                                }`
                            }
                        >
                            <item.icon className="w-[18px] h-[18px]" />
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
                        <button
                            onClick={() => setShowDisplayModal(true)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Monitor className="w-[18px] h-[18px]" />
                                TV Displays
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Live</span>
                        </button>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                    {/* Theme Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-3">
                        <button onClick={() => setTheme('light')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="Light Mode">
                            <Sun className="w-4 h-4" />
                        </button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="Dark Mode">
                            <Moon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setTheme('system')} className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="System Preference">
                            <Monitor className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate transition-colors">{user?.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate transition-colors">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <div className="p-6 max-w-[1400px] mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* TV Display Selection Modal */}
            {showDisplayModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Monitor className="w-5 h-5 text-blue-600" />
                                    Launch TV Display
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Select a building to open its schedule</p>
                            </div>
                            <button
                                onClick={() => setShowDisplayModal(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                            <a
                                href="/display"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
                            >
                                <div>
                                    <div className="font-bold text-slate-900">All Buildings (Rotating)</div>
                                    <div className="text-sm text-slate-500">Cycles through everything</div>
                                </div>
                                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </a>

                            <div className="pt-2 pb-1 px-1 flex items-center gap-4">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Specific Buildings</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            {buildings.length === 0 ? (
                                <div className="text-center py-8 text-sm text-slate-500">
                                    Loading buildings...
                                </div>
                            ) : (
                                buildings.map(b => (
                                    <a
                                        key={b.id}
                                        href={`/display/${b.abbreviation}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-sm">
                                                {b.abbreviation}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{b.name}</div>
                                                <div className="text-xs text-slate-500">Standalone Display</div>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
