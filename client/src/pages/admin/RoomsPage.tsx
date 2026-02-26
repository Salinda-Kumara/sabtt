import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Room, Building } from '@/types/database';
import { Building2, Plus, Pencil, Trash2, DoorOpen, Users as UsersIcon } from 'lucide-react';

export default function RoomsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBuildingForm, setShowBuildingForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    // Building form
    const [buildingName, setBuildingName] = useState('');
    const [buildingAbbr, setBuildingAbbr] = useState('');

    // Room form
    const [roomName, setRoomName] = useState('');
    const [roomBuildingId, setRoomBuildingId] = useState('');
    const [roomCapacity, setRoomCapacity] = useState(30);

    const fetchData = async () => {
        try {
            const [buildingsRes, roomsRes] = await Promise.all([
                api.get('/buildings'),
                api.get('/rooms'),
            ]);
            setBuildings(buildingsRes.data);
            setRooms(roomsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openBuildingForm = (building?: Building) => {
        if (building) {
            setEditingBuilding(building);
            setBuildingName(building.name);
            setBuildingAbbr(building.abbreviation);
        } else {
            setEditingBuilding(null);
            setBuildingName('');
            setBuildingAbbr('');
        }
        setShowBuildingForm(true);
    };

    const openRoomForm = (room?: Room) => {
        if (room) {
            setEditingRoom(room);
            setRoomName(room.name);
            setRoomBuildingId(room.buildingId);
            setRoomCapacity(room.capacity);
        } else {
            setEditingRoom(null);
            setRoomName('');
            setRoomBuildingId(buildings[0]?.id || '');
            setRoomCapacity(30);
        }
        setShowRoomForm(true);
    };

    const saveBuilding = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBuilding) {
                await api.put(`/buildings/${editingBuilding.id}`, { name: buildingName, abbreviation: buildingAbbr });
            } else {
                await api.post('/buildings', { name: buildingName, abbreviation: buildingAbbr });
            }
            setShowBuildingForm(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteBuilding = async (id: string) => {
        if (!confirm('Delete this building and all its rooms?')) return;
        try {
            await api.delete(`/buildings/${id}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const saveRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.put(`/rooms/${editingRoom.id}`, { name: roomName, buildingId: roomBuildingId, capacity: roomCapacity });
            } else {
                await api.post('/rooms', { name: roomName, buildingId: roomBuildingId, capacity: roomCapacity });
            }
            setShowRoomForm(false);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteRoom = async (id: string) => {
        if (!confirm('Delete this room?')) return;
        try {
            await api.delete(`/rooms/${id}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                        <Building2 className="w-6 h-6 text-amber-500" />
                        Rooms & Buildings
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage buildings and their rooms</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openBuildingForm()} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-amber-200/50 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Building
                    </button>
                    <button onClick={() => openRoomForm()} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Room
                    </button>
                </div>
            </div>

            {/* Buildings and Rooms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {buildings.map((building) => {
                    const buildingRooms = rooms.filter((r) => r.buildingId === building.id);
                    return (
                        <div key={building.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all">
                            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {building.abbreviation}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white transition-colors">{building.name}</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{buildingRooms.length} rooms</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openBuildingForm(building)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => deleteBuilding(building.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                                {buildingRooms.map((room) => (
                                    <div key={room.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <DoorOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            <span className="font-medium text-slate-700 dark:text-slate-300 text-sm transition-colors">{room.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 transition-colors">
                                                <UsersIcon className="w-3 h-3" /> {room.capacity}
                                            </span>
                                            <button onClick={() => openRoomForm(room)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteRoom(room.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                ))}
                                {buildingRooms.length === 0 && (
                                    <div className="px-5 py-4 text-center text-sm text-slate-400 dark:text-slate-500 transition-colors">No rooms yet</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Building Form Modal */}
            {showBuildingForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors" onClick={() => setShowBuildingForm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">{editingBuilding ? 'Edit Building' : 'New Building'}</h2>
                        <form onSubmit={saveBuilding} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Name</label>
                                <input type="text" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Abbreviation</label>
                                <input type="text" value={buildingAbbr} onChange={(e) => setBuildingAbbr(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required maxLength={5} />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setShowBuildingForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Room Form Modal */}
            {showRoomForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-colors" onClick={() => setShowRoomForm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-slate-100 dark:border-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">{editingRoom ? 'Edit Room' : 'New Room'}</h2>
                        <form onSubmit={saveRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Room Name</label>
                                <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Building</label>
                                <select value={roomBuildingId} onChange={(e) => setRoomBuildingId(e.target.value)} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required>
                                    <option value="" className="dark:bg-slate-900">Select building</option>
                                    {buildings.map((b) => <option key={b.id} value={b.id} className="dark:bg-slate-900">{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Capacity</label>
                                <input type="number" value={roomCapacity} onChange={(e) => setRoomCapacity(parseInt(e.target.value))} className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" min={1} required />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setShowRoomForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
