import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    LayoutDashboard, Users, Bell, Settings as SettingsIcon, LogOut, Search,
    TrendingUp, AlertCircle, ChevronRight, Flame
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    AreaChart, Area 
} from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import StudentDetail from '@/components/StudentDetail';
import StudentDirectory from '@/components/StudentDirectory';
import Settings from '@/components/Settings';
import Alerts from '@/components/Alerts';
import { useAuth } from '../context/AuthContext';

// ─── Persistent AudioContext for Global Alarm ──────────────────
let sharedAudioCtx = null;
const getAudioContext = () => {
    if (!sharedAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            sharedAudioCtx = new AudioContext();
        }
    }
    return sharedAudioCtx;
};

const playGlobalAlarm = async () => {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const playTone = () => {
        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(880, now + 0.3);
            gain2.gain.setValueAtTime(0.5, now + 0.3);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc2.start(now + 0.3);
            osc2.stop(now + 0.5);

            return true;
        } catch (e) {
            console.error("Global alarm failed", e);
            return false;
        }
    };

    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
            return playTone();
        } catch {
            return false;
        }
    } else {
        return playTone();
    }
};

// ─── Reusable Components ───────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${active
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-100'
            }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </button>
);

const StatCard = ({ title, children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 ${className || ''}`}>
        <h3 className="text-slate-500 text-sm font-semibold mb-4 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

// Mock Data for Activity Feed
const RECENT_ACTIVITY = [
    { id: 1, text: "Alice completed a mindfulness exercise", time: "2m ago", icon: "🧘‍♀️" },
    { id: 2, text: "Bob submitted a daily check-in", time: "15m ago", icon: "📝" },
    { id: 3, text: "Charlie reached a 7-day streak!", time: "1h ago", icon: "🔥" },
];

const TREND_DATA = [
    { date: 'Mon', average: 75, engagement: 60 },
    { date: 'Tue', average: 82, engagement: 70 },
    { date: 'Wed', average: 78, engagement: 65 },
    { date: 'Thu', average: 85, engagement: 80 },
    { date: 'Fri', average: 90, engagement: 85 },
    { date: 'Sat', average: 88, engagement: 75 },
    { date: 'Sun', average: 92, engagement: 90 },
];

// ─── TeacherDashboard (Props-Driven) ───────────────────────────
const TeacherDashboard = ({ students, onAddStudent, onUpdateStudent, onLogout, alerts }) => {
    const { user } = useAuth();
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('dashboard');

    // ── Dynamic Teacher Identity ──────────────────────────────────
    const getStoredName = () => {
        // Primary: read from the user JSON object written by AuthContext
        let storedUser = {};
        try {
            storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
            console.warn('Failed to parse stored user for teacher name:', error);
        }
        if (storedUser.username || storedUser.name) return storedUser.username || storedUser.name;
        // Fallback: individual keys
        return localStorage.getItem('teacher_name') || localStorage.getItem('username') || 'Teacher';
    };

    const getStoredEmail = () => {
        let storedUser = {};
        try {
            storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
            console.warn('Failed to parse stored user for teacher email:', error);
        }
        if (storedUser.email) return storedUser.email;
        return localStorage.getItem('teacher_email') || localStorage.getItem('email') || '';
    };

    const [teacherName, setTeacherName] = useState(getStoredName);
    const [teacherEmail, setTeacherEmail] = useState(getStoredEmail);

    // Sync whenever localStorage changes (e.g. after login in another tab)
    useEffect(() => {
        const syncUser = () => {
            setTeacherName(getStoredName());
            setTeacherEmail(getStoredEmail());
        };
        syncUser(); // run once on mount to ensure freshness
        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Global Alarm State
    const processedAlertIds = React.useRef(new Set());
    const [unreadAlertCount, setUnreadAlertCount] = useState(0);
    const [activeEmergencies, setActiveEmergencies] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(false);

    // Initialize Audio
    const handleEnableAudio = async () => {
        const ctx = getAudioContext();
        if (ctx) {
            try {
                await ctx.resume();
                setAudioEnabled(true);
                toast.success("Audio alarms enabled! You will now hear SOS sounds.");
                
                // Play a short test beep
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } catch (e) {
                console.error("Failed to enable audio", e);
            }
        }
    };

    // Global Alarm Polling
    useEffect(() => {
        const checkAlerts = async () => {
            let localAlerts = [];
            // 1. Try fetching from Backend via API
            try {
                const res = await fetch('/api/alerts', {
                    headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        localAlerts = [...data];
                    }
                }
            } catch (e) {
                console.error("Backend fetch failed, falling back to localStorage", e);
            }

            // 2. Try fetching from LocalStorage (Fallback / Legacy)
            try {
                const stored = localStorage.getItem('teacher_alerts');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        // Merge backend and local storage alerts without duplicates
                        localAlerts = [...localAlerts, ...parsed];
                    }
                }
            } catch (error) {
                console.warn('Failed to parse teacher_alerts:', error);
            }

            const mergedAlerts = [...(alerts || []), ...localAlerts];
            
            // Deduplicate for accurate count
            const uniqueAlerts = Array.from(new Map(mergedAlerts.map(item => [item.id, item])).values());
            const unreadCount = uniqueAlerts.filter(a => a.status === "Unread").length;
            setUnreadAlertCount(unreadCount);

            const unreadEmergencies = uniqueAlerts.filter(a => a.severity === "High" && a.status === "Unread");
            setActiveEmergencies(unreadEmergencies);
            
            const newEmergencies = unreadEmergencies.filter(a => !processedAlertIds.current.has(a.id));

            console.log("[DEBUG TeacherDashboard] Polling alerts...", { 
                propAlertsReceived: alerts?.length || 0,
                localAlertsFound: localAlerts.length, 
                uniqueCount: uniqueAlerts.length, 
                unreadEmergencies: unreadEmergencies.length,
                newEmergenciesFound: newEmergencies.length 
            });

            if (newEmergencies.length > 0) {
                console.log("[DEBUG TeacherDashboard] Firing alarm for new emergencies!", newEmergencies);
                newEmergencies.forEach(a => {
                    processedAlertIds.current.add(a.id);
                    // Also show a massive persistent toast for the emergency
                    toast.error(`EMERGENCY: ${a.student} triggered an SOS!`, {
                        description: a.message,
                        duration: 10000, 
                        icon: '🚨'
                    });
                });
                
                // Play the robust Web Audio API alarm
                playGlobalAlarm();

                // Speech Synthesis Backup (Often bypasses some autoplay restrictions if triggered by state changes)
                try {
                    const msg = new SpeechSynthesisUtterance("Emergency Alert! SOS triggered!");
                    msg.volume = 1;
                    msg.rate = 1.1;
                    msg.pitch = 1.2;
                    window.speechSynthesis.speak(msg);
                } catch (error) {
                    console.warn('Speech synthesis failed:', error);
                }
                
                // Fallback standard Audio
                const alarm = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                alarm.volume = 1.0;
                alarm.play().catch(e => console.log("Audio play blocked by browser. User interaction needed.", e));
            }
        };

        const interval = setInterval(checkAlerts, 2000);
        checkAlerts();

        return () => clearInterval(interval);
    }, [alerts, user?.token]);

    // ─── Dynamic Stats (computed from students prop) ────────────
    const moodCounts = students.reduce((acc, student) => {
        const mood = student.status || 'Happy';
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
    }, {});

    const MOOD_DATA = [
        { name: 'Happy', value: moodCounts['Happy'] || 0, color: '#4ade80' },
        { name: 'Calm', value: moodCounts['Calm'] || 0, color: '#2dd4bf' },
        { name: 'Tired', value: moodCounts['Tired'] || 0, color: '#fbbf24' },
        { name: 'Sad', value: moodCounts['Sad'] || 0, color: '#f87171' },
        { name: 'Stressed', value: moodCounts['Stressed'] || 0, color: '#fb923c' },
        { name: 'Anxious', value: moodCounts['Anxious'] || 0, color: '#a78bfa' },
    ].filter(item => item.value > 0);

    const highRiskCount = students.filter(s => s.risk === 'High').length;
    const mediumRiskCount = students.filter(s => s.risk === 'Medium').length;
    const lowRiskCount = students.filter(s => s.risk === 'Low' || s.risk === 'Stable').length;

    const RISK_DATA = [
        { name: 'High', value: highRiskCount, color: '#f87171' },
        { name: 'Medium', value: mediumRiskCount, color: '#fbbf24' },
        { name: 'Stable', value: lowRiskCount, color: '#4ade80' },
    ];

    // Filter Students
    const filteredStudents = students.filter(student =>
        (student.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── Handle Add Student (delegates to parent) ──────────────
    const handleAddStudent = (newStudent) => {
        const success = onAddStudent(newStudent);
        if (success) {
            toast.success("Student Added Successfully! ✅");
        } else {
            toast.error("Student already exists!");
        }
        return success;
    };

    // ─── Find selected student (handles both _id and id) ───────
    const selectedStudent = selectedStudentId
        ? students.find(s => (s._id || s.id) == selectedStudentId)
        : null;

    // ─── Render Content Based on Sidebar ────────────────────────
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <>
                        {/* Section: Class Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                            {/* Mood Distribution */}
                            <StatCard title="Mood Distribution">
                                <div className="h-40 flex items-center justify-center relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={MOOD_DATA}
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {MOOD_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-bold text-slate-700">
                                            {students.length > 0 ? Math.round((moodCounts['Happy'] || 0) / students.length * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                                    {MOOD_DATA.map((item) => (
                                        <div key={item.name} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-slate-500">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </StatCard>

                            {/* Risk Overview (Bar Chart) */}
                            <StatCard title="Risk Overview">
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={RISK_DATA}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 10 }}
                                            />
                                            <YAxis hide />
                                            <Tooltip 
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {RISK_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-red-100 rounded text-red-500"><AlertCircle size={14} /></div>
                                        <span className="text-xs font-bold text-slate-700">{highRiskCount} Urgent Cases</span>
                                    </div>
                                    <button 
                                        onClick={() => setActiveView('students')}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase"
                                    >
                                        Details
                                    </button>
                                </div>
                            </StatCard>

                            {/* Class Wellness / Mood Trends (Area Chart) */}
                            <StatCard title="Engagement Trends">
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={TREND_DATA}>
                                            <defs>
                                                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="engagement" 
                                                stroke="#6366f1" 
                                                strokeWidth={2}
                                                fillOpacity={1} 
                                                fill="url(#colorAvg)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-slate-400">Class Average Engagement</span>
                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                        <TrendingUp size={12} /> +12%
                                    </span>
                                </div>
                            </StatCard>
                        </div>

                        {/* Section: Smart Student Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Users size={20} className="text-indigo-600" />
                                    Student Directory
                                </h3>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Streak</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredStudents.map((student) => (
                                            <tr
                                                key={student._id || student.id}
                                                onClick={() => setSelectedStudentId(student._id || student.id)}
                                                className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-lg shadow-sm">
                                                            {student.avatar}
                                                        </div>
                                                        <span className="font-semibold text-slate-700">{student.username || student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">Lvl {student.level}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`flex items-center gap-1.5 text-sm font-medium ${(student.status || student.mood) === 'Happy' ? 'text-green-600' :
                                                        (student.status || student.mood) === 'Sad' ? 'text-red-600' :
                                                            (student.status || student.mood) === 'Stressed' ? 'text-orange-600' :
                                                                (student.status || student.mood) === 'Anxious' ? 'text-purple-600' :
                                                                    'text-slate-600'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${(student.status || student.mood) === 'Happy' ? 'bg-green-500' :
                                                            (student.status || student.mood) === 'Sad' ? 'bg-red-500' :
                                                                (student.status || student.mood) === 'Stressed' ? 'bg-orange-500' :
                                                                    (student.status || student.mood) === 'Anxious' ? 'bg-purple-500' :
                                                                        'bg-slate-400'
                                                            }`}></span>
                                                        {student.status || student.mood || "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                                                        <Flame size={14} />
                                                        {student.streak}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.risk === 'High' && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                                                            <AlertCircle size={12} /> High
                                                        </span>
                                                    )}
                                                    {student.risk === 'Medium' && (
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold">Medium</span>
                                                    )}
                                                    {student.risk === 'Low' && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Low</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                                                        <ChevronRight size={20} />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredStudents.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        No students found matching "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
            case 'students':
                return <StudentDirectory students={students} onAddStudent={handleAddStudent} onUpdateStudent={onUpdateStudent} />;
            case 'alerts':
                return <Alerts incomingAlerts={alerts} />;
            case 'settings':
                return (
                    <Settings
                        onAddStudent={handleAddStudent}
                        onSave={() => setActiveView('dashboard')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">

            {/* 1. Modal / Slide-over (StudentDetail) */}
            <AnimatePresence>
                {selectedStudent && (
                    <StudentDetail
                        student={selectedStudent}
                        onClose={() => setSelectedStudentId(null)}
                    />
                )}
            </AnimatePresence>

            {/* 2. Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                        ClassMind
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Teacher Portal v2.0</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    <SidebarItem icon={Users} label="Students" active={activeView === 'students'} onClick={() => setActiveView('students')} />
                    <SidebarItem icon={Bell} label="Alerts" active={activeView === 'alerts'} onClick={() => setActiveView('alerts')} />
                    <SidebarItem icon={SettingsIcon} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* 3. Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {getGreeting()}, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{teacherName}</span> 👋
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                            <span className="text-sm">{teacherEmail}</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">Here's what's happening in your classroom today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {!audioEnabled && (
                            <button
                                onClick={handleEnableAudio}
                                title="Click to allow emergency alarms to play sound"
                                className="animate-pulse flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg border border-indigo-200 hover:bg-indigo-200 transition-colors shadow-sm"
                            >
                                🔊 Enable Sound
                            </button>
                        )}
                        <div className="relative flex items-center">
                            {unreadAlertCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                                    {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                                </span>
                            )}
                            <button
                                onClick={() => setActiveView('alerts')}
                                className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:shadow-md transition-all hover:bg-slate-50">
                                <Bell size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setActiveView('settings')}
                            className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold hover:shadow-md transition-all hover:border-indigo-300"
                            title={teacherName}
                        >
                            {teacherName.substring(0, 2).toUpperCase()}
                        </button>
                    </div>
                </header>

                {/* Emergency Banner */}
                <AnimatePresence>
                    {activeEmergencies.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-4 bg-red-600 rounded-xl shadow-lg border-2 border-red-700 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-red-700 transition-colors"
                            onClick={() => setActiveView('alerts')}
                        >
                            <div className="flex items-center gap-4 text-white">
                                <AlertCircle size={32} className="animate-pulse" />
                                <div>
                                    <h3 className="text-lg font-bold">ACTIVE EMERGENCY ALERTS ({activeEmergencies.length})</h3>
                                    <p className="text-red-100 text-sm">{activeEmergencies[0].student} triggered an SOS. Please check Alerts immediately!</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-colors uppercase text-sm tracking-wider whitespace-nowrap">
                                View Details
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {renderContent()}

            </main>
        </div>
    );
};

export default TeacherDashboard;
