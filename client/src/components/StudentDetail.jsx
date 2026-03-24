import React, { useState } from 'react';
import { X, Flame, Trophy, AlertTriangle, Filter, Smile, Frown, Meh, History } from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// 1. HELPERS FOR DYNAMIC DATA
const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const generateMoodData = (studentId) => {
    const data = [];
    const hash = hashCode(String(studentId));
    const dates = ['10/01', '10/03', '10/05', '10/07', '10/10', '10/12', '10/15', '10/18', '10/20', '10/21', '10/22', '10/24'];
    
    dates.forEach((date, i) => {
        // Deterministic but "random" mood between 1 and 5
        const mood = 1 + ((hash + i * 13) % 5);
        data.push({ date, mood });
    });
    return data;
};

const STUDENT_COLORS = [
    { theme: "bg-indigo-600", graph: "#4f46e5" },
    { theme: "bg-emerald-600", graph: "#10b981" },
    { theme: "bg-violet-600", graph: "#7c3aed" },
    { theme: "bg-rose-600", graph: "#e11d48" },
    { theme: "bg-amber-600", graph: "#d97706" },
    { theme: "bg-cyan-600", graph: "#0891b2" },
];

const STUDENT_RECORDS = {
    1: { // Alice
        profile: { level: 5, xp: 2450, currentStreak: 12, avatar: "👩‍🎓" },
        themeColor: "bg-indigo-600",
        graphColor: "#4f46e5",
        moodData: generateMoodData(1),
        history: [{ id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Happy", note: "Felt good about math test." } }]
    },
    2: { // Bob
        profile: { level: 2, xp: 850, currentStreak: 3, avatar: "👨‍🎓" },
        themeColor: "bg-red-600",
        graphColor: "#dc2626",
        moodData: [
            { date: '10/01', mood: 4 }, { date: '10/03', mood: 3 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 3 }, { date: '10/10', mood: 2 }, { date: '10/12', mood: 2 },
            { date: '11/15', mood: 1 }, { date: '11/18', mood: 1 }, { date: '11/20', mood: 1 },
        ],
        history: [{ id: 1, date: "2023-10-24", type: "ALERT", data: { severity: "Critical", trigger: "Keyword Detected: 'Hopeless'" } }]
    }
};

const WELLNESS_DATA = [
    { subject: 'Sleep', A: 80, fullMark: 100 },
    { subject: 'Stress', A: 40, fullMark: 100 },
    { subject: 'Social', A: 90, fullMark: 100 },
    { subject: 'Mood', A: 70, fullMark: 100 },
    { subject: 'Focus', A: 60, fullMark: 100 },
    { subject: 'Activity', A: 75, fullMark: 100 },
];

const getMoodIcon = (mood) => {
    switch (mood) {
        case 'Happy': return <Smile className="text-green-500" />;
        case 'Calm': return <Smile className="text-blue-500" />;
        case 'Tired': return <Meh className="text-amber-500" />;
        case 'Sad': return <Frown className="text-red-500" />;
        case 'Stressed': return <Frown className="text-red-600" />;
        default: return <Meh className="text-slate-400" />;
    }
};

const StudentDetail = ({ student, onClose }) => {
    const [filter, setFilter] = useState('ALL');

    // 2. DYNAMIC DATA LOOKUP
    const sId = student?._id || student?.id || "unknown";
    const numericId = parseInt(sId, 10);
    const mockRecord = STUDENT_RECORDS[numericId] || null;

    const hash = hashCode(String(sId));
    const colorPair = STUDENT_COLORS[hash % STUDENT_COLORS.length];

    const DEFAULT_RECORD = {
        profile: { level: 1, xp: 100, currentStreak: 0, avatar: "👤" },
        themeColor: colorPair.theme,
        graphColor: colorPair.graph,
        moodData: generateMoodData(sId),
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Okay", note: "Wellness snapshot generated." } },
        ]
    };

    const record = mockRecord || DEFAULT_RECORD;


    // Construct profile from passed student prop (real data) mixed with mock defaults
    const profile = {
        name: student?.username || student?.name || "Student",
        level: student?.level || record.profile.level,
        xp: record.profile.xp || (student?.level || 1) * 100 + 50,
        currentStreak: student?.streak ?? record.profile.currentStreak,
        avatar: student?.avatar || record.profile.avatar
    };

    // Use the resolved record for graph/history data
    const themeColor = record.themeColor;
    const moodGraphData = record.moodData;
    const historyData = record.history;

    const filteredHistory = historyData.filter(item => {
        if (filter === 'ALL') return true;
        return item.type === filter;
    });

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl rounded-xl overflow-hidden"
                >

                    {/* Header with Custom Buttons & Dynamic Color */}
                    <div className={cn("p-6 text-white flex justify-between items-start shrink-0 transition-colors duration-300", themeColor)}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl border-2 border-white/30 backdrop-blur-sm">
                                {profile.avatar}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <div className="flex items-center gap-3 text-white/90 text-sm mt-1">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/10">
                                        Level {profile.level}
                                    </span>
                                    <span>{profile.xp} XP</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-white/90 font-bold text-lg">
                                    <Flame className="fill-orange-300 text-orange-300" />
                                    {profile.currentStreak} Day Streak
                                </div>
                                <span className="text-xs text-white/70">Consistent Effort!</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-white hover:bg-white/20 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">

                        {/* Section B: Insights & Trends */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Mood Trend (Area Chart) */}
                            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="text-slate-700 font-bold flex items-center gap-2">
                                        📈 Mood Stability
                                    </h3>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">30 Day Trend</span>
                                </div>
                                <div className="p-4 h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={moodGraphData}>
                                            <defs>
                                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={record.graphColor} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={record.graphColor} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 5]} hide />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="mood" 
                                                stroke={record.graphColor} 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorMood)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Wellness Radar (Radar Chart) */}
                            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                <div className="p-4 border-b border-slate-50">
                                    <h3 className="text-slate-700 font-bold flex items-center gap-2">
                                        🕸️ Wellness Radar
                                    </h3>
                                </div>
                                <div className="p-4 h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={WELLNESS_DATA}>
                                            <PolarGrid stroke="#f1f5f9" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                                            <Radar 
                                                name={profile.name} 
                                                dataKey="A" 
                                                stroke={record.graphColor} 
                                                fill={record.graphColor} 
                                                fillOpacity={0.6} 
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Timeline */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                    <History size={20} />
                                    Activity Timeline
                                </h3>
                                {/* Custom Filter Group */}
                                <div className="flex bg-white p-1 rounded-lg border shadow-sm">
                                    <button
                                        onClick={() => setFilter('ALL')}
                                        className={cn(
                                            "px-4 py-1 rounded-md text-xs font-medium transition-all",
                                            filter === 'ALL' ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        )}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilter('MOOD')}
                                        className={cn(
                                            "px-4 py-1 rounded-md text-xs font-medium transition-all",
                                            filter === 'MOOD' ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                        )}
                                    >
                                        Moods
                                    </button>
                                    <button
                                        onClick={() => setFilter('ACHIEVEMENT')}
                                        className={cn(
                                            "px-4 py-1 rounded-md text-xs font-medium transition-all",
                                            filter === 'ACHIEVEMENT' ? "bg-yellow-50 text-yellow-600 font-bold" : "text-slate-500 hover:text-yellow-600 hover:bg-yellow-50"
                                        )}
                                    >
                                        Achievements
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                {filteredHistory.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative pl-10"
                                    >
                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute left-[11px] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10",
                                            item.type === 'MOOD' ? "bg-indigo-400" :
                                                item.type === 'ACHIEVEMENT' ? "bg-yellow-400" :
                                                    "bg-red-500"
                                        )} />

                                        {/* Content - Using Styled Divs instead of Card */}
                                        {item.type === 'MOOD' && (
                                            <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {getMoodIcon(item.data.mood)}
                                                        <span className="font-semibold text-slate-700">{item.data.mood}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">{item.date}</span>
                                                </div>
                                                {item.data.note && (
                                                    <p className="text-sm text-slate-600 italic">"{item.data.note}"</p>
                                                )}
                                            </div>
                                        )}

                                        {item.type === 'ACHIEVEMENT' && (
                                            <div className="bg-gradient-to-r from-yellow-50 to-white p-4 rounded-lg border border-yellow-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute right-0 top-0 opacity-10 rotate-12 transform translate-x-4 -translate-y-2">
                                                    <Trophy size={60} />
                                                </div>
                                                <div className="flex justify-between items-start mb-1 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{item.data.icon}</span>
                                                        <div>
                                                            <span className="font-bold text-yellow-700 block leading-tight">Achievement Unlocked!</span>
                                                            <span className="font-semibold text-slate-700">{item.data.badge}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-yellow-600/70">{item.date}</span>
                                                </div>
                                            </div>
                                        )}

                                        {item.type === 'ALERT' && (
                                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm flex items-start gap-3">
                                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-red-700">Risk Alert ({item.data.severity})</span>
                                                        <span className="text-xs text-red-400">{item.date}</span>
                                                    </div>
                                                    <p className="text-sm text-red-600 mt-1">{item.data.trigger}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <p className="text-center text-slate-400 py-8 pl-10">No activities found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StudentDetail;