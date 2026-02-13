import React, { useState } from 'react';
import { X, Flame, Trophy, AlertTriangle, Filter, Smile, Frown, Meh, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// 1. MOCK DATABASE (Dynamic Data per Student ID)
const STUDENT_RECORDS = {
    1: { // Alice
        profile: { level: 5, xp: 2450, currentStreak: 12, avatar: "👩‍🎓" },
        themeColor: "bg-indigo-600",
        graphColor: "#4f46e5", // Indigo
        moodData: [
            { date: '10/01', mood: 3 }, { date: '10/03', mood: 4 }, { date: '10/05', mood: 5 },
            { date: '10/07', mood: 4 }, { date: '10/10', mood: 5 }, { date: '10/12', mood: 4 },
            { date: '10/15', mood: 5 }, { date: '10/18', mood: 4 }, { date: '10/20', mood: 4 },
            { date: '10/21', mood: 5 }, { date: '10/22', mood: 4 }, { date: '10/24', mood: 5 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Happy", note: "Felt good about math test." } },
            { id: 2, date: "2023-10-23", type: "ACHIEVEMENT", data: { badge: "Zen Master", icon: "🧘" } },
            { id: 3, date: "2023-10-22", type: "MOOD", data: { mood: "Happy", note: "Feeling great!" } },
        ]
    },
    2: { // Bob (High Risk)
        profile: { level: 2, xp: 850, currentStreak: 3, avatar: "👨‍🎓" },
        themeColor: "bg-red-600",
        graphColor: "#dc2626", // Red
        moodData: [
            { date: '10/01', mood: 4 }, { date: '10/03', mood: 3 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 3 }, { date: '10/10', mood: 2 }, { date: '10/12', mood: 2 },
            { date: '10/15', mood: 1 }, { date: '10/18', mood: 1 }, { date: '10/20', mood: 1 },
            { date: '10/21', mood: 1 }, { date: '10/22', mood: 1 }, { date: '10/24', mood: 1 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "ALERT", data: { severity: "Critical", trigger: "Keyword Detected: 'Hopeless'" } },
            { id: 2, date: "2023-10-23", type: "ALERT", data: { severity: "High", trigger: "Missed Check-in" } },
            { id: 3, date: "2023-10-22", type: "MOOD", data: { mood: "Sad", note: "I don't want to be here." } },
        ]
    },
    3: { // Charlie (Fluctuating)
        profile: { level: 3, xp: 1200, currentStreak: 7, avatar: "🧑‍🎓" },
        themeColor: "bg-yellow-500", // Changed to yellow as requested
        graphColor: "#ca8a04", // Yellow-600
        moodData: [
            { date: '10/01', mood: 3 }, { date: '10/03', mood: 2 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 2 }, { date: '10/10', mood: 3 }, { date: '10/12', mood: 4 },
            { date: '10/15', mood: 3 }, { date: '10/18', mood: 2 }, { date: '10/20', mood: 4 },
            { date: '10/21', mood: 3 }, { date: '10/22', mood: 2 }, { date: '10/24', mood: 3 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Tired", note: "Didn't sleep well." } },
            { id: 2, date: "2023-10-23", type: "MOOD", data: { mood: "Okay", note: "Just an average day." } },
            { id: 3, date: "2023-10-22", type: "ACHIEVEMENT", data: { badge: "Consistency", icon: "🗓️" } },
        ]
    },
    4: { // Diana (Improving)
        profile: { level: 4, xp: 1800, currentStreak: 8, avatar: "👩‍🎓" },
        themeColor: "bg-teal-500",
        graphColor: "#14b8a6", // Teal-500
        moodData: [
            { date: '10/01', mood: 3 }, { date: '10/03', mood: 4 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 5 }, { date: '10/10', mood: 4 }, { date: '10/12', mood: 5 },
            { date: '10/15', mood: 5 }, { date: '10/18', mood: 4 }, { date: '10/20', mood: 4 },
            { date: '10/21', mood: 5 }, { date: '10/22', mood: 5 }, { date: '10/24', mood: 5 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Happy", note: "Team project went well!" } },
            { id: 2, date: "2023-10-22", type: "ACHIEVEMENT", data: { badge: "Helper", icon: "🤝" } },
        ]
    },
    5: { // Evan (Struggling/Tired)
        profile: { level: 3, xp: 1100, currentStreak: 2, avatar: "👨‍🎓" },
        themeColor: "bg-amber-500",
        graphColor: "#f59e0b", // Amber-500
        moodData: [
            { date: '10/01', mood: 3 }, { date: '10/03', mood: 3 }, { date: '10/05', mood: 2 },
            { date: '10/07', mood: 2 }, { date: '10/10', mood: 3 }, { date: '10/12', mood: 2 },
            { date: '10/15', mood: 2 }, { date: '10/18', mood: 3 }, { date: '10/20', mood: 2 },
            { date: '10/21', mood: 2 }, { date: '10/22', mood: 1 }, { date: '10/24', mood: 2 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Tired", note: "Practice was hard." } },
            { id: 2, date: "2023-10-21", type: "MOOD", data: { mood: "Okay", note: "Catching up on sleep." } },
        ]
    },
    6: { // Fiona (Medium Risk - Stressed)
        profile: { level: 2, xp: 950, currentStreak: 2, avatar: "🎨" },
        themeColor: "bg-orange-500",
        graphColor: "#f97316", // Orange-500
        moodData: [
            { date: '10/01', mood: 3 }, { date: '10/03', mood: 3 }, { date: '10/05', mood: 2 },
            { date: '10/07', mood: 2 }, { date: '10/10', mood: 1 }, { date: '10/12', mood: 2 },
            { date: '10/15', mood: 2 }, { date: '10/18', mood: 2 }, { date: '10/20', mood: 2 },
            { date: '10/21', mood: 3 }, { date: '10/22', mood: 2 }, { date: '10/24', mood: 2 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Stressed", note: "Art project due soon." } },
            { id: 2, date: "2023-10-22", type: "MOOD", data: { mood: "Okay", note: "Feeling a bit better." } },
        ]
    },
    7: { // George (Low Risk - Calm)
        profile: { level: 3, xp: 1500, currentStreak: 15, avatar: "🦁" },
        themeColor: "bg-blue-500",
        graphColor: "#3b82f6", // Blue-500
        moodData: [
            { date: '10/01', mood: 4 }, { date: '10/03', mood: 4 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 4 }, { date: '10/10', mood: 4 }, { date: '10/12', mood: 4 },
            { date: '10/15', mood: 5 }, { date: '10/18', mood: 4 }, { date: '10/20', mood: 4 },
            { date: '10/21', mood: 4 }, { date: '10/22', mood: 4 }, { date: '10/24', mood: 4 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Calm", note: "Meditation helped." } },
            { id: 2, date: "2023-10-20", type: "ACHIEVEMENT", data: { badge: "Peacekeeper", icon: "🕊️" } },
        ]
    },
    8: { // Hannah (Low - Happy)
        profile: { level: 5, xp: 2800, currentStreak: 20, avatar: "⛸️" },
        themeColor: "bg-pink-500",
        graphColor: "#ec4899", // Pink-500
        moodData: [
            { date: '10/01', mood: 5 }, { date: '10/03', mood: 5 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 5 }, { date: '10/10', mood: 5 }, { date: '10/12', mood: 4 },
            { date: '10/15', mood: 5 }, { date: '10/18', mood: 5 }, { date: '10/20', mood: 5 },
            { date: '10/21', mood: 4 }, { date: '10/22', mood: 5 }, { date: '10/24', mood: 5 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Happy", note: "Won the competition!" } },
            { id: 2, date: "2023-10-23", type: "ACHIEVEMENT", data: { badge: "Champion", icon: "🏆" } },
        ]
    },
    9: { // Ian (High Risk - Sad)
        profile: { level: 1, xp: 400, currentStreak: 0, avatar: "🎸" },
        themeColor: "bg-slate-700",
        graphColor: "#334155", // Slate-700
        moodData: [
            { date: '10/01', mood: 2 }, { date: '10/03', mood: 2 }, { date: '10/05', mood: 1 },
            { date: '10/07', mood: 1 }, { date: '10/10', mood: 2 }, { date: '10/12', mood: 1 },
            { date: '10/15', mood: 1 }, { date: '10/18', mood: 1 }, { date: '10/20', mood: 2 },
            { date: '10/21', mood: 1 }, { date: '10/22', mood: 1 }, { date: '10/24', mood: 1 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Sad", note: "Nothing feels right." } },
            { id: 2, date: "2023-10-22", type: "ALERT", data: { severity: "High", trigger: "Isolation Detected" } },
        ]
    },
    10: { // Julia (Medium - Tired)
        profile: { level: 3, xp: 1300, currentStreak: 3, avatar: "🎭" },
        themeColor: "bg-purple-500",
        graphColor: "#a855f7", // Purple-500
        moodData: [
            { date: '10/01', mood: 3 }, { date: '10/03', mood: 3 }, { date: '10/05', mood: 4 },
            { date: '10/07', mood: 3 }, { date: '10/10', mood: 2 }, { date: '10/12', mood: 3 },
            { date: '10/15', mood: 2 }, { date: '10/18', mood: 2 }, { date: '10/20', mood: 3 },
            { date: '10/21', mood: 2 }, { date: '10/22', mood: 3 }, { date: '10/24', mood: 3 },
        ],
        history: [
            { id: 1, date: "2023-10-24", type: "MOOD", data: { mood: "Tired", note: "Rehearsals are long." } },
            { id: 2, date: "2023-10-23", type: "MOOD", data: { mood: "Okay", note: "Lines are memorized." } },
        ]
    }
};

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
    const [filter, setFilter] = useState('ALL'); // ALL | MOOD | ACHIEVEMENT

    // 2. DYNAMIC DATA LOOKUP
    // Retrieve the specific record for this student ID if it exists in mock data
    // For new real students, we won't have mock history, so we'll generate a default
    const mockRecord = STUDENT_RECORDS[student?.id || student?._id] || STUDENT_RECORDS[1];

    // Construct profile from passed student prop (real data) mixed with mock defaults
    const profile = {
        name: student?.username || student?.name || "Student",
        level: student?.level || 1,
        xp: (student?.level || 1) * 100 + 50,
        currentStreak: student?.streak || 0,
        avatar: student?.avatar || "👤"
    };

    // Use mock data for graph/history if available, otherwise default to Alice's data for demo purposes
    // In a real full app, we would fetch this specific student's history from API
    const themeColor = mockRecord.themeColor;
    const moodGraphData = mockRecord.moodData;
    const historyData = mockRecord.history;

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

                        {/* Section B: Mental Health Graph */}
                        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/50 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-slate-700 text-lg font-semibold flex items-center gap-2">
                                    📈 Recent Mood Trends (30 Days)
                                </h3>
                            </div>
                            <div className="p-6 h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={moodGraphData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis
                                            domain={[0, 5]}
                                            tickCount={5}
                                            tickFormatter={(value) => {
                                                if (value === 1) return 'Sad';
                                                if (value === 4) return 'Happy';
                                                return '';
                                            }}
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="mood"
                                            stroke={mockRecord.graphColor}
                                            strokeWidth={3}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: mockRecord.graphColor }}
                                            dot={{ r: 3, fill: mockRecord.graphColor, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
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
