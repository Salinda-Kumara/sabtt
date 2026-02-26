import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Settings, Save, Monitor, GraduationCap, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
    const [universityName, setUniversityName] = useState('');
    const [displayInterval, setDisplayInterval] = useState('15');
    const { theme, setTheme } = useTheme();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/settings')
            .then((res) => {
                setUniversityName(res.data.universityName || '');
                setDisplayInterval(res.data.displayInterval || '15');
            })
            .catch(console.error);
    }, []);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', { universityName, displayInterval, appearance: theme });
            // Since useTheme handles its own setting update on change directly via API, 
            // saving here is just a bulk save for all other fields too.
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-slate-500" />
                    Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Configure university branding and display preferences</p>
            </div>

            <form onSubmit={save} className="space-y-6">
                {/* University Branding */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        University Branding
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">University Name</label>
                        <input
                            type="text"
                            value={universityName}
                            onChange={(e) => setUniversityName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="University of Technology"
                        />
                        <p className="text-xs text-slate-400 mt-1">Shown on the TV display header</p>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <Monitor className="w-5 h-5 text-emerald-500" />
                        Display Settings
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Auto-Page Interval (seconds)</label>
                        <input
                            type="number"
                            value={displayInterval}
                            onChange={(e) => setDisplayInterval(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            min={5}
                            max={120}
                        />
                        <p className="text-xs text-slate-400 mt-1">How long to show each building before cycling to the next (5-120 seconds)</p>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <Palette className="w-5 h-5 text-purple-500" />
                        Appearance
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
                        <select
                            value={theme}
                            onChange={(e) => {
                                // useTheme context handles the API save instantly for live preview
                                setTheme(e.target.value as 'light' | 'dark' | 'system');
                            }}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                            <option value="system">System Default</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Changes the color scheme of the entire admin dashboard</p>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${saved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200/50'
                        }`}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
