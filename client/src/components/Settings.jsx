import React, { useState } from 'react';
import { toast } from 'sonner';
import { User, Bell, Save, Mail, Shield, UserPlus } from 'lucide-react';

const ToggleSwitch = ({ active, onClick }) => (
    <button
        onClick={onClick}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            active ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
    >
        <span
            className={`${
                active ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);

const Settings = ({ onAddStudent, onSave }) => {
    // 1. Profile State
    const [profile, setProfile] = useState({
        name: localStorage.getItem('teacher_name') || "",
        email: localStorage.getItem('teacher_email') || "",
        role: localStorage.getItem('teacher_role') || "School Counselor"
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        weeklyReport: true
    });

    const [isSaving, setIsSaving] = useState(false);

    // 2. Quick Add Student State
    const [newStudent, setNewStudent] = useState({ name: '', email: '', grade: '', risk: 'Low' });

    // Handlers
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            console.log("Saving Settings:", { profile, notifications });

            if (profile.name) localStorage.setItem('teacher_name', profile.name);
            if (profile.email) localStorage.setItem('teacher_email', profile.email);
            if (profile.role) localStorage.setItem('teacher_role', profile.role);

            setIsSaving(false);
            toast.success("Settings Saved Successfully!");
            if (onSave) onSave();
        }, 1000);
    };

    const handleAddStudent = (e) => {
        e.preventDefault();
        if (!newStudent.name.trim() || !newStudent.email.trim()) {
            toast.error("Name and Email are required!");
            return;
        }

        const studentObj = {
            _id: Date.now().toString(),
            id: Date.now(),
            username: newStudent.name.trim(),
            email: newStudent.email.trim(),
            grade: newStudent.grade.trim() || "10-A",
            risk: newStudent.risk,
            status: 'Happy',
            level: 1,
            streak: 0,
            avatar: "👤"
        };

        if (onAddStudent) {
            const success = onAddStudent(studentObj);
            if (success) {
                setNewStudent({ name: '', email: '', grade: '', risk: 'Low' });
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
                <p className="text-slate-500">Manage your profile details and notification preferences.</p>
            </div>

            {/* Section 1: Profile Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <User size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Profile Information</h3>
                        <p className="text-xs text-slate-500">Update your account details.</p>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Role / Title</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                name="role"
                                value={profile.role}
                                onChange={handleProfileChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
                        <p className="text-xs text-slate-500">Control how you receive alerts.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-slate-800">High Risk Alerts</h4>
                            <p className="text-sm text-slate-500">Receive an immediate email when a student is flagged as High Risk.</p>
                        </div>
                        <ToggleSwitch
                            active={notifications.emailAlerts}
                            onClick={() => toggleNotification('emailAlerts')}
                        />
                    </div>
                    <div className="h-px bg-slate-100" />

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-slate-800">Weekly Summary Report</h4>
                            <p className="text-sm text-slate-500">Get a PDF summary of class wellness trends every Friday.</p>
                        </div>
                        <ToggleSwitch
                            active={notifications.weeklyReport}
                            onClick={() => toggleNotification('weeklyReport')}
                        />
                    </div>
                    <div className="h-px bg-slate-100" />

                    <div className="flex items-center justify-between opacity-50 cursor-not-allowed" title="Coming Soon">
                        <div>
                            <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                SMS Alerts <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border">PRO</span>
                            </h4>
                            <p className="text-sm text-slate-500">Get text messages for urgent alerts.</p>
                        </div>
                        <ToggleSwitch
                            active={notifications.smsAlerts}
                            onClick={() => { }}
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Quick Add Student */}
            {onAddStudent && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Quick Add Student</h3>
                            <p className="text-xs text-slate-500">Add a new student to your class roster.</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddStudent} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Student Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    placeholder="e.g. john@school.edu"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Grade / Class</label>
                                <input
                                    type="text"
                                    value={newStudent.grade}
                                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                                    placeholder="e.g. 10-A"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Initial Risk Level</label>
                                <select
                                    value={newStudent.risk}
                                    onChange={(e) => setNewStudent({ ...newStudent, risk: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-md transition-all"
                            >
                                <UserPlus size={18} />
                                Add Student to Roster
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Footer Action */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all ${isSaving ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                        }`}
                >
                    {isSaving ? (
                        <>Saving...</>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Settings;
