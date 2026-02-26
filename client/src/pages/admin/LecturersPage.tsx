import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Lecturer } from '@/types/database';
import { Users, Plus, Pencil, Trash2, Mail } from 'lucide-react';

export default function LecturersPage() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Lecturer | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [profilePic, setProfilePic] = useState('');

    const fetchData = async () => {
        try {
            const lecRes = await api.get('/lecturers');
            setLecturers(lecRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openForm = (lecturer?: Lecturer) => {
        if (lecturer) {
            setEditing(lecturer);
            setName(lecturer.name);
            setEmail(lecturer.email);
            setContact(lecturer.contact || '');
            setProfilePic(lecturer.profilePic || '');
        } else {
            setEditing(null);
            setName('');
            setEmail('');
            setContact('');
            setProfilePic('');
        }
        setShowForm(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/lecturers/${editing.id}`, { name, email, contact, profilePic });
            } else {
                await api.post('/lecturers', { name, email, contact, profilePic });
            }
            setShowForm(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const remove = async (id: string) => {
        if (!confirm('Delete this lecturer?')) return;
        try { await api.delete(`/lecturers/${id}`); fetchData(); }
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
                        <Users className="w-6 h-6 text-purple-500" />
                        Lecturers
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage lecturers and instructors</p>
                </div>
                <button onClick={() => openForm()} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200/50 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Lecturer
                </button>
            </div>

            {/* Lecturers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {lecturers.map((lecturer) => (
                    <div key={lecturer.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {lecturer.profilePic ? (
                                    <img src={lecturer.profilePic} alt={lecturer.name} className="w-11 h-11 rounded-xl object-cover shadow-md" />
                                ) : (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                                        {lecturer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm transition-colors">{lecturer.name}</h3>
                                    <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">
                                        <Mail className="w-3 h-3" /> {lecturer.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openForm(lecturer)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => remove(lecturer.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        {lecturer.contact && (
                            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-1 transition-colors">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">Contact:</span> {lecturer.contact}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {lecturers.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 py-12 text-center text-slate-400 dark:text-slate-500 text-sm transition-colors">
                    No lecturers yet. Add your first lecturer to get started.
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">{editing ? 'Edit Lecturer' : 'New Lecturer'}</h2>
                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Contact Number</label>
                                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="+94 77 XXXXXXX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Profile Picture URL</label>
                                <input type="url" value={profilePic} onChange={(e) => setProfilePic(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="https://example.com/photo.jpg" />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
