import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Bell, Settings as SettingsIcon, LogOut, Search,
    TrendingUp, AlertCircle, Clock, ChevronRight, Menu, Flame
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import StudentDetail from '@/components/StudentDetail';
import StudentDirectory from '@/components/StudentDirectory';
import Settings from '@/components/Settings';
import Alerts from '@/components/Alerts';

// Reusable Components
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
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 ${className}`}>
        <h3 className="text-slate-500 text-sm font-semibold mb-4 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

// Mock Data for Activity Feed (Since we don't have a backend for this yet)
const RECENT_ACTIVITY = [
    { id: 1, text: "Alice completed a mindfulness exercise", time: "2m ago", icon: "🧘‍♀️" },
    { id: 2, text: "Bob submitted a daily check-in", time: "15m ago", icon: "📝" },
    { id: 3, text: "Charlie reached a 7-day streak!", time: "1h ago", icon: "🔥" },
];

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('dashboard');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // MOCK DATA FALLBACK (For demo purposes when API is not connected)
    const MOCK_STUDENTS = [
        { _id: '1', username: "Alice Johnson", grade: "10-A", risk: "Low", status: "Happy", level: 5, streak: 12, email: "alice@school.edu", avatar: "👩‍🎓" },
        { _id: '2', username: "Bob Smith", grade: "10-B", risk: "High", status: "Sad", level: 2, streak: 0, email: "bob@school.edu", avatar: "👨‍🎓" },
        { _id: '3', username: "Charlie Brown", grade: "10-A", risk: "Medium", status: "Tired", level: 3, streak: 4, email: "charlie@school.edu", avatar: "🧑‍🎓" },
        { _id: '4', username: "Diana Prince", grade: "11-C", risk: "Low", status: "Happy", level: 4, streak: 8, email: "diana@school.edu", avatar: "🦸‍♀️" },
        { _id: '5', username: "Evan Wright", grade: "10-B", risk: "High", status: "Anxious", level: 1, streak: 0, email: "evan@school.edu", avatar: "🏃‍♂️" },
        { _id: '6', username: "Fiona Gallagher", grade: "11-A", risk: "Medium", status: "Stressed", level: 2, streak: 2, email: "fiona@school.edu", avatar: "🎨" },
        { _id: '7', username: "George Martin", grade: "12-B", risk: "Low", status: "Calm", level: 3, streak: 15, email: "george@school.edu", avatar: "🦁" },
        { _id: '8', username: "Hannah Lee", grade: "10-A", risk: "Low", status: "Happy", level: 5, streak: 20, email: "hannah@school.edu", avatar: "⛸️" },
        { _id: '9', username: "Ian Curtis", grade: "12-A", risk: "High", status: "Sad", level: 1, streak: 0, email: "ian@school.edu", avatar: "🎸" },
        { _id: '10', username: "Julia Roberts", grade: "11-B", risk: "Medium", status: "Tired", level: 3, streak: 3, email: "julia@school.edu", avatar: "🎭" }
    ];

    // Fetch Students
    useEffect(() => {
        const fetchStudents = async () => {
            // Load custom students from local storage
            let customStudents = JSON.parse(localStorage.getItem('custom_students') || '[]');

            // Deduplicate custom students on load (based on email or username)
            const uniqueCustom = customStudents.filter((student, index, self) =>
                index === self.findIndex((t) => (
                    t.email === student.email || t.username === student.username
                ))
            );

            if (uniqueCustom.length !== customStudents.length) {
                console.log("Cleaned up duplicates in localStorage");
                localStorage.setItem('custom_students', JSON.stringify(uniqueCustom));
                customStudents = uniqueCustom;
            }

            try {
                const response = await fetch('http://localhost:5000/api/students');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                // Merge API data with custom local data, ensuring no duplicates across sources
                const apiIds = new Set(data.map(s => s.email));
                const nonDuplicateCustom = customStudents.filter(s => !apiIds.has(s.email));

                setStudents(data.length > 0 ? [...data, ...nonDuplicateCustom] : [...MOCK_STUDENTS, ...customStudents]);
                setLoading(false);
            } catch (error) {
                console.warn("API Error, using mock data:", error);
                // Merge Mock data with custom local data
                setStudents([...MOCK_STUDENTS, ...customStudents]);
                setLoading(false);
            }
        };
        fetchStudents();
    }, [activeView]); // Refresh when view changes

    const handleAddStudent = (newStudent) => {
        // Check for duplicates
        const exists = students.some(s =>
            s.email.toLowerCase() === newStudent.email.toLowerCase() ||
            s.username.toLowerCase() === newStudent.username.toLowerCase()
        );

        if (exists) {
            toast.error("Student already exists!");
            return false;
        }

        // Add Logic
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);

        // Persist to LocalStorage
        const existingCustom = JSON.parse(localStorage.getItem('custom_students') || '[]');
        localStorage.setItem('custom_students', JSON.stringify([...existingCustom, newStudent]));

        toast.success("Student Added Successfully! ✅");
        return true;
    };

    // Dynamic Stats
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
    ].filter(item => item.value > 0);

    const highRiskCount = students.filter(s => s.risk === 'High').length;

    // Filter Students
    const filteredStudents = students.filter(student =>
        (student.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <div className="flex justify-center gap-4 mt-2">
                                    {MOOD_DATA.map((item) => (
                                        <div key={item.name} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-slate-500">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </StatCard>

                            {/* Risk Radar */}
                            <StatCard title="Risk Radar" className="border-l-4 border-l-red-400">
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-red-100 rounded-full text-red-500">
                                                <AlertCircle size={24} />
                                            </div>
                                            <span className="text-3xl font-bold text-slate-800">{highRiskCount}</span>
                                        </div>
                                        <p className="text-slate-500 mb-4">Students flagged with <span className="font-semibold text-red-500">High Risk</span> patterns.</p>
                                    </div>
                                    <button
                                        onClick={() => { setSearchTerm(''); setActiveView('students'); }} // Simple navigation
                                        className="w-full py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        View High Risk Students
                                    </button>
                                </div>
                            </StatCard>

                            {/* Activity Feed */}
                            <StatCard title="Live Activity" className="overflow-hidden">
                                <div className="space-y-4">
                                    {RECENT_ACTIVITY.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <span className="text-xl">{activity.icon}</span>
                                            <div>
                                                <p className="text-sm text-slate-700 font-medium leading-tight">{activity.text}</p>
                                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <Clock size={10} /> {activity.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
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
                return <StudentDirectory students={students} onAddStudent={handleAddStudent} />;
            case 'alerts':
                return <Alerts />;
            case 'settings':
                return <Settings onSave={() => setActiveView('dashboard')} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            <Toaster position="top-center" richColors />
            {/* 1. Modal / Slide-over (StudentDetail) */}
            <AnimatePresence>
                {selectedStudentId && (
                    <StudentDetail
                        student={students.find(s => s._id === selectedStudentId)}
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
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* 3. Main Content Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Good Morning, Mrs. Johnson</h2>
                        <p className="text-slate-500">Here's what's happening in your classroom today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            <button className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:shadow-md transition-all">
                                <Bell size={20} />
                            </button>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                            TE
                        </div>
                    </div>
                </header>

                {renderContent()}

            </main>
        </div>
    );
};

export default TeacherDashboard;
