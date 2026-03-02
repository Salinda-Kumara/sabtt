import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Batch } from '@/types/database';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';

export default function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Batch | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [formError, setFormError] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data);
        } catch (err) {
            console.error('Error fetching batches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openForm = (batch?: Batch) => {
        setFormError('');
        if (batch) {
            setEditing(batch);
            setName(batch.name);
            setColor(batch.color || '#3b82f6');
        } else {
            setEditing(null);
            setName('');
            setColor('#3b82f6');
        }
        setShowForm(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            if (editing) {
                await api.put(`/batches/${editing.id}`, { name, color });
            } else {
                await api.post('/batches', { name, color });
            }
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            if (err.response?.status === 409) {
                setFormError('A batch with this name already exists.');
            } else {
                setFormError('Failed to save batch. Please try again.');
            }
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Are you sure you want to delete this batch?')) return;
        try {
            await api.delete(`/batches/${id}`);
            fetchData();
        } catch (err) {
            console.error('Error deleting batch:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                        <Layers className="w-6 h-6 text-indigo-500" />
                        Batches
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        Manage student batches and their display colors
                    </p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Batch
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors shadow-sm">
                <table className="w-full">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 transition-colors">
                        <tr>
                            <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3 uppercase tracking-wider transition-colors">
                                Batch Name
                            </th>
                            <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3 uppercase tracking-wider w-24 transition-colors">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                        {batches.map((batch) => (
                            <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full shadow-sm"
                                            style={{ backgroundColor: batch.color }}
                                        />
                                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 transition-colors">
                                            {batch.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openForm(batch)}
                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => remove(batch.id)}
                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {batches.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                    No batches found. Click "Add Batch" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Batch Form Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">
                            {editing ? 'Edit Batch' : 'New Batch'}
                        </h2>

                        {formError && (
                            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-red-700 dark:text-red-400 text-sm font-medium transition-colors">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                    Batch Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Year I Semester I"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                                    Theme Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                                    />
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm uppercase"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
