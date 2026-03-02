import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Course, Department, ClassType } from '@/types/database';
import { BookOpen, Plus, Pencil, Trash2, FlaskConical, Presentation, GraduationCap, FileText } from 'lucide-react';

const classTypeIcons: Record<ClassType, typeof BookOpen> = {
    LECTURE: Presentation,
    LAB: FlaskConical,
    TUTORIAL: GraduationCap,
    EXAM: FileText,
};

const classTypeColors: Record<ClassType, string> = {
    LECTURE: 'bg-blue-100 text-blue-700',
    LAB: 'bg-emerald-100 text-emerald-700',
    TUTORIAL: 'bg-purple-100 text-purple-700',
    EXAM: 'bg-red-100 text-red-700',
};

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [classType, setClassType] = useState<ClassType>('LECTURE');

    // Department form
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [deptName, setDeptName] = useState('');
    const [deptCode, setDeptCode] = useState('');
    const [deptColor, setDeptColor] = useState('#6366f1');

    const [activeTab, setActiveTab] = useState<string>('all');

    const fetchData = async () => {
        try {
            const [coursesRes, deptsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/departments'),
            ]);
            setCourses(coursesRes.data);
            setDepartments(deptsRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openForm = (course?: Course) => {
        if (course) {
            setEditing(course);
            setName(course.name);
            setCode(course.code);
            setDepartmentId(course.departmentId);
            setClassType(course.classType);
        } else {
            setEditing(null);
            setName('');
            setCode('');
            setDepartmentId(departments[0]?.id || '');
            setClassType('LECTURE');
        }
        setShowForm(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/courses/${editing.id}`, { name, code, departmentId, classType });
            } else {
                await api.post('/courses', { name, code, departmentId, classType });
            }
            setShowForm(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const remove = async (id: string) => {
        if (!confirm('Delete this course?')) return;
        try { await api.delete(`/courses/${id}`); fetchData(); }
        catch (err) { console.error(err); }
    };

    const saveDept = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/departments', { name: deptName, code: deptCode, color: deptColor });
            setShowDeptForm(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteDept = async (id: string) => {
        if (!confirm('Delete this department and all associated courses?')) return;
        try { await api.delete(`/departments/${id}`); fetchData(); }
        catch (err) { console.error(err); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                        <BookOpen className="w-6 h-6 text-emerald-500" />
                        Courses & Departments
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage courses and academic departments</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setDeptName(''); setDeptCode(''); setDeptColor('#6366f1'); setShowDeptForm(true); }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Department
                    </button>
                    <button onClick={() => openForm()} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Course
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === 'all'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                >
                    All
                </button>
                {departments.map(dept => (
                    <button
                        key={dept.id}
                        onClick={() => setActiveTab(dept.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === dept.id
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                        {dept.name}
                    </button>
                ))}
                {courses.some(c => !departments.find(d => d.id === c.departmentId)) && (
                    <button
                        onClick={() => setActiveTab('other')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === 'other'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                    >
                        Other
                    </button>
                )}
            </div>

            {/* Courses grouped by Department */}
            {departments
                .filter(dept => activeTab === 'all' || activeTab === dept.id)
                .map((dept) => {
                    const deptCourses = courses.filter(c => c.departmentId === dept.id);
                    if (deptCourses.length === 0) return null;
                    return (
                        <div key={dept.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                            {/* Department header */}
                            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors" style={{ background: `linear-gradient(135deg, ${dept.color}${document.documentElement.classList.contains('dark') ? '20' : '08'}, ${dept.color}${document.documentElement.classList.contains('dark') ? '30' : '15'})` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: dept.color }} />
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white transition-colors">{dept.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">({dept.code}) · {deptCourses.length} courses</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteDept(dept.id)} className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Courses table */}
                            <table className="w-full">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                                    <tr>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider w-36 transition-colors">Code</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider transition-colors">Name</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider w-28 transition-colors">Type</th>
                                        <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider w-24 transition-colors">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                                    {deptCourses.map((course) => {
                                        const Icon = classTypeIcons[course.classType];
                                        return (
                                            <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-2.5">
                                                    <span className="font-mono font-semibold text-sm" style={{ color: dept.color }}>{course.code}</span>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <span className="text-sm text-slate-900 dark:text-slate-200 transition-colors">{course.name}</span>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${classTypeColors[course.classType]} dark:bg-opacity-20`}>
                                                        <Icon className="w-3 h-3" />
                                                        {course.classType}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => openForm(course)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => remove(course.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    );
                })}

            {/* Ungrouped courses (no department match) */}
            {(activeTab === 'all' || activeTab === 'other') && courses.filter(c => !departments.find(d => d.id === c.departmentId)).length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 transition-colors">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 transition-colors">Other Courses</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                            <tr>
                                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider w-36 transition-colors">Code</th>
                                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider transition-colors">Name</th>
                                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider w-28 transition-colors">Type</th>
                                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2.5 uppercase tracking-wider w-24 transition-colors">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                            {courses.filter(c => !departments.find(d => d.id === c.departmentId)).map((course) => {
                                const Icon = classTypeIcons[course.classType];
                                return (
                                    <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-2.5"><span className="font-mono font-semibold text-sm text-slate-700 dark:text-slate-300 transition-colors">{course.code}</span></td>
                                        <td className="px-5 py-2.5"><span className="text-sm text-slate-900 dark:text-slate-200 transition-colors">{course.name}</span></td>
                                        <td className="px-5 py-2.5">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${classTypeColors[course.classType]} dark:bg-opacity-20`}>
                                                <Icon className="w-3 h-3" /> {course.classType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => openForm(course)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => remove(course.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Course Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">{editing ? 'Edit Course' : 'New Course'}</h2>
                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Course Code</label>
                                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="CS201" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Course Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Department</label>
                                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                                    <option value="" className="dark:bg-slate-900">Select department</option>
                                    {departments.map((d) => <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Class Type</label>
                                <select value={classType} onChange={(e) => setClassType(e.target.value as ClassType)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                                    <option value="LECTURE" className="dark:bg-slate-900">Lecture</option>
                                    <option value="LAB" className="dark:bg-slate-900">Lab</option>
                                    <option value="TUTORIAL" className="dark:bg-slate-900">Tutorial</option>
                                    <option value="EXAM" className="dark:bg-slate-900">Exam</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Department Form Modal */}
            {showDeptForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors" onClick={() => setShowDeptForm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">New Department</h2>
                        <form onSubmit={saveDept} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Name</label>
                                <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Code</label>
                                <input type="text" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required maxLength={5} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={deptColor} onChange={(e) => setDeptColor(e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors" />
                                    <input type="text" value={deptColor} onChange={(e) => setDeptColor(e.target.value)} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setShowDeptForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
