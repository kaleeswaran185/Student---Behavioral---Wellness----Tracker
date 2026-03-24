/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Search, Filter, UserPlus, Eye, Mail, AlertCircle, CheckCircle,
    Clock, HelpCircle, ChevronDown, X, Sparkles, BookOpen, Shield,
    ChevronUp, FileText, History, Edit3, Bell, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../config/runtime';
import { apiUrl } from '../lib/api';

// ─── HELPERS ──────────────────────────────────────────────────
const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const generateMoodData = (studentId) => {
    const data = [];
    const hash = hashCode(String(studentId));
    for (let i = 0; i < 7; i++) {
        data.push({ mood: 1 + ((hash + i * 13) % 5) });
    }
    return data;
};

// ─── CONSTANTS ──────────────────────────────────────────────────
const AVAILABLE_MENTORS = [
    { id: 1, name: "Dr. Sarah Jenkins", subject: "Psychology / Counseling", availability: "Available", expertise: ["High", "Medium"], color: "bg-green-500", icon: "🧠" },
    { id: 2, name: "Mr. David Chen", subject: "Mathematics & Science", availability: "Available", expertise: ["Medium", "Low"], color: "bg-green-500", icon: "📐" },
    { id: 3, name: "Ms. Emily Blunt", subject: "English Literature", availability: "Busy", expertise: ["Low", "Medium"], color: "bg-gray-400", icon: "📚" },
    { id: 4, name: "Coach Mike Ross", subject: "Physical Education", availability: "Available", expertise: ["Medium", "High"], color: "bg-green-500", icon: "🏃" },
    { id: 5, name: "Dr. Anika Patel", subject: "Mental Health & Wellness", availability: "Available", expertise: ["High"], color: "bg-green-500", icon: "💚" },
];

const RISK_LEVELS = ["High", "Medium", "Low"];

const getRiskConfig = (risk) => {
    switch (risk) {
        case "High": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "High Risk", glow: "shadow-red-100" };
        case "Medium": return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500", label: "Medium", glow: "shadow-yellow-100" };
        default: return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", label: "Stable", glow: "" };
    }
};

// ─── AI MENTOR SUGGESTION ENGINE ────────────────────────────────
const suggestMentor = (student) => {
    const available = AVAILABLE_MENTORS.filter(m => m.availability === "Available");
    const perfect = available.filter(m => m.expertise.includes(student.risk));
    const best = perfect.length > 0 ? perfect[0] : available[0];
    return best;
};

// ─── MOCK STUDENTS FALLBACK ──────────────────────────────────────
const MOCK_STUDENTS = [
    { _id: '1', username: "Alice Johnson", grade: "10-A", risk: "Low", status: "Happy", email: "alice@school.edu", enrollmentStatus: "Active" },
    { _id: '2', username: "Bob Smith", grade: "10-B", risk: "High", status: "Sad", email: "bob@school.edu", enrollmentStatus: "Active" },
    { _id: '3', username: "Charlie Brown", grade: "10-A", risk: "Medium", status: "Tired", email: "charlie@school.edu", enrollmentStatus: "Active" },
    { _id: '4', username: "Diana Prince", grade: "11-C", risk: "Low", status: "Happy", email: "diana@school.edu", enrollmentStatus: "Active" },
    { _id: '5', username: "Evan Wright", grade: "10-B", risk: "High", status: "Anxious", email: "evan@school.edu", enrollmentStatus: "Active" },
    { _id: '6', username: "Fiona Gallagher", grade: "11-A", risk: "Medium", status: "Stressed", email: "fiona@school.edu", enrollmentStatus: "Inactive" },
];

// ─── NOTIFICATION BELL COMPONENT ─────────────────────────────────
const NotificationBell = ({ notifications, onMarkRead, onMarkAllRead }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const unread = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="relative p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
            >
                <Bell size={18} className="text-slate-600" />
                {unread > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                        {unread}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                            <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                            {unread > 0 && (
                                <button onClick={onMarkAllRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 text-sm">No notifications yet</div>
                            ) : notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => onMarkRead(n.id)}
                                    className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${n.type === 'mentor' ? 'bg-indigo-100' : n.type === 'risk' ? 'bg-red-100' : 'bg-green-100'}`}>
                                        {n.type === 'mentor' ? '👤' : n.type === 'risk' ? '⚠️' : '📅'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>{n.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                    </div>
                                    {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── HISTORY TIMELINE COMPONENT ───────────────────────────────────
const HistoryTimeline = ({ history }) => {
    if (!history || history.length === 0) return <p className="text-sm text-slate-400 text-center py-4">No history yet.</p>;
    const icons = { mentor: '👤', risk: '⚠️', visit: '📅', note: '📝', status: '🔄' };
    return (
        <div className="relative pl-5 space-y-4">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200" />
            {[...history].reverse().map((event, i) => (
                <div key={i} className="relative flex gap-3">
                    <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-[10px]">
                        {icons[event.type] || '•'}
                    </div>
                    <div className="pl-4 flex-1">
                        <p className="text-xs font-semibold text-slate-700">{event.label}</p>
                        {event.details && <p className="text-xs text-slate-400 mt-0.5">{event.details}</p>}
                        <p className="text-[10px] text-slate-300 mt-1">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────
const StudentDirectory = ({ students: propStudents, onAddStudent, onUpdateStudent }) => {
    const { user } = useAuth();
    const demoMode = useDemoMode;
    const [localStudents, setLocalStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', grade: '', risk: 'Low' });

    // Notifications
    const [notifications, setNotifications] = useState([]);
    const addNotification = (msg, type = 'info') => {
        const n = { id: Date.now(), message: msg, type, read: false, time: new Date().toLocaleTimeString() };
        setNotifications(prev => [n, ...prev].slice(0, 20));
    };

    // Mentor Modal
    const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
    const [selectedStudentForMentor, setSelectedStudentForMentor] = useState(null);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [aiSuggested, setAiSuggested] = useState(null);

    // Booking Modal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedStudentForBooking, setSelectedStudentForBooking] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', time: '', notes: '' });
    const [scheduledVisits, setScheduledVisits] = useState({});

    // Risk Update Modal
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
    const [selectedStudentForRisk, setSelectedStudentForRisk] = useState(null);
    const [newRisk, setNewRisk] = useState('');
    const [progressNote, setProgressNote] = useState('');

    // Detail / History Panel
    const [expandedStudentId, setExpandedStudentId] = useState(null);

    const students = propStudents || localStudents;
    const token = user?.token;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const updateStudentLocally = (updated) => {
        if (onUpdateStudent) {
            onUpdateStudent(updated);
        } else {
            setLocalStudents(prev => prev.map(s =>
                (s._id === updated._id || s.id === updated.id) ? updated : s
            ));
        }
    };

    const apiUpdate = async (studentId, body) => {
        try {
            const response = await fetch(apiUrl(`/api/students/${studentId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const updated = await response.json();
                updateStudentLocally(updated);
                return updated;
            }
            const failedData = await response.json().catch(() => ({}));
            throw new Error(failedData.message || 'Failed to update student');
        } catch (error) {
            console.error('Student update failed:', error);
        }
        return null;
    };

    const loadStudents = useCallback(async () => {
        try {
            const res = await fetch(apiUrl('/api/students'), {
                signal: AbortSignal.timeout(3000),
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('bad');
            const data = await res.json();
            const custom = demoMode ? JSON.parse(localStorage.getItem('custom_students') || '[]') : [];
            if (data.length > 0) {
                setLocalStudents([...data, ...custom]);
            } else {
                setLocalStudents(demoMode ? [...MOCK_STUDENTS, ...custom] : []);
            }
        } catch {
            const custom = demoMode ? JSON.parse(localStorage.getItem('custom_students') || '[]') : [];
            setLocalStudents(demoMode ? [...MOCK_STUDENTS, ...custom] : []);
        }
        setLoading(false);
    }, [demoMode, token]);

    useEffect(() => {
        if (propStudents) {
            setLoading(false);
            return;
        }

        loadStudents();
    }, [loadStudents, propStudents, user?.token]);

    // ── HANDLERS ────────────────────────────────────────────────
    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(apiUrl('/api/students'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    name: newStudent.name,
                    email: newStudent.email,
                    grade: newStudent.grade,
                    risk: newStudent.risk,
                })
            });

            if (!response.ok) {
                const failedData = await response.json().catch(() => ({}));
                throw new Error(failedData.message || 'Failed to add student');
            }

            const createdStudent = await response.json();
            if (onAddStudent) {
                onAddStudent(createdStudent);
            } else {
                setLocalStudents(prev => [...prev, createdStudent]);
            }
        } catch (error) {
            console.error('Student creation failed:', error);
            if (!demoMode) {
                addNotification(error.message || 'Student creation failed', 'risk');
                return;
            }

            const opt = { _id: Date.now().toString(), username: newStudent.name, email: newStudent.email, grade: newStudent.grade, risk: newStudent.risk, status: 'Happy', enrollmentStatus: 'Active', avatar: '👤', history: [] };
            if (onAddStudent) {
                onAddStudent(opt);
            } else {
                const custom = JSON.parse(localStorage.getItem('custom_students') || '[]');
                localStorage.setItem('custom_students', JSON.stringify([...custom, opt]));
                setLocalStudents(prev => [...prev, opt]);
            }
        }
        setIsAddModalOpen(false);
        setNewStudent({ name: '', email: '', grade: '', risk: 'Low' });
    };

    const handleAssignMentor = async () => {
        if (!selectedStudentForMentor || !selectedMentor) return;
        const studentId = selectedStudentForMentor._id || selectedStudentForMentor.id;
        const updatedStudent = await apiUpdate(studentId, {
            mentor: selectedMentor.name,
            historyEvent: { type: 'mentor', label: `Mentor Assigned: ${selectedMentor.name}`, details: selectedMentor.subject }
        });
        if (!updatedStudent) return;
        addNotification(`Mentor "${selectedMentor.name}" assigned to ${selectedStudentForMentor.username}`, 'mentor');
        setIsMentorModalOpen(false);
        setSelectedStudentForMentor(null);
        setSelectedMentor(null);
        setAiSuggested(null);
    };

    const handleScheduleVisit = async (e) => {
        e.preventDefault();
        if (!selectedStudentForBooking || !bookingData.date || !bookingData.time) return;
        const studentId = selectedStudentForBooking._id || selectedStudentForBooking.id;
        const visit = { date: bookingData.date, time: bookingData.time, notes: bookingData.notes };
        setScheduledVisits(prev => ({ ...prev, [studentId]: visit }));
        await apiUpdate(studentId, {
            historyEvent: {
                type: 'visit',
                label: `Visit Scheduled: ${bookingData.date} @ ${bookingData.time}`,
                details: bookingData.notes
            }
        });
        addNotification(`Visit scheduled for ${selectedStudentForBooking.username} on ${bookingData.date}`, 'visit');
        setIsBookingModalOpen(false);
        setSelectedStudentForBooking(null);
        setBookingData({ date: '', time: '', notes: '' });
    };

    const handleUpdateRisk = async () => {
        if (!selectedStudentForRisk || !newRisk) return;
        const studentId = selectedStudentForRisk._id || selectedStudentForRisk.id;
        const updatedStudent = await apiUpdate(studentId, {
            risk: newRisk,
            progressNotes: progressNote,
            historyEvent: { type: 'risk', label: `Risk Updated → ${newRisk}`, details: progressNote }
        });
        if (!updatedStudent) return;
        addNotification(`Risk level for ${selectedStudentForRisk.username} updated to ${newRisk}`, 'risk');
        setIsRiskModalOpen(false);
        setSelectedStudentForRisk(null);
        setNewRisk('');
        setProgressNote('');
    };

    const handleToggleStatus = async (student) => {
        const studentId = student._id || student.id;
        const newStatus = (student.enrollmentStatus || 'Active') === 'Active' ? 'Inactive' : 'Active';
        await apiUpdate(studentId, {
            enrollmentStatus: newStatus,
            historyEvent: { type: 'status', label: `Status changed to ${newStatus}` }
        });
    };

    const filteredStudents = students.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchSearch = (s.username || '').toLowerCase().includes(term) || (s.email || '').toLowerCase().includes(term);
        const matchRisk = filterRisk === "All" || s.risk === filterRisk;
        return matchSearch && matchRisk;
    });

    const summary = {
        total: students.length,
        high: students.filter(s => s.risk === 'High').length,
        medium: students.filter(s => s.risk === 'Medium').length,
        stable: students.filter(s => s.risk === 'Low' || s.risk === 'Stable').length,
    };

    return (
        <div className="space-y-5">

            {/* ── Stats Bar ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: summary.total, color: 'from-indigo-500 to-violet-500', icon: '🎓' },
                    { label: 'High Risk', value: summary.high, color: 'from-red-500 to-rose-500', icon: '🔴' },
                    { label: 'Medium Risk', value: summary.medium, color: 'from-amber-400 to-yellow-500', icon: '🟡' },
                    { label: 'Stable', value: summary.stable, color: 'from-emerald-500 to-teal-500', icon: '🟢' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg shadow-md`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-xs text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Table Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Header Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen size={20} className="text-indigo-600" />
                            Student Directory
                        </h2>
                        <p className="text-sm text-slate-400 mt-0.5">Monitor, manage, and support student wellness</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
                        <NotificationBell
                            notifications={notifications}
                            onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                            onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        />

                        {/* Search */}
                        <div className="relative flex-1 md:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Risk Filter */}
                        <div className="flex gap-1.5">
                            {["All", "High", "Medium", "Low"].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setFilterRisk(level)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filterRisk === level
                                        ? level === "High" ? "bg-red-500 text-white" : level === "Medium" ? "bg-yellow-400 text-white" : level === "Low" ? "bg-green-500 text-white" : "bg-indigo-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                >
                                    {level === "All" ? "All" : level === "Low" ? "Stable" : level}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <UserPlus size={16} />
                            Add Student
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            Loading students...
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    {['Student', 'Status', 'Risk Level', '30 Day Trend', 'Mentor / Visit', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map(student => {
                                    const sId = student._id || student.id;
                                    const risk = getRiskConfig(student.risk);
                                    const isExpanded = expandedStudentId === sId;
                                    const visit = scheduledVisits[sId];
                                    return (
                                        <React.Fragment key={sId}>
                                            <motion.tr
                                                layout
                                                className={`hover:bg-slate-50/60 transition-colors group ${student.risk === 'High' ? 'border-l-4 border-l-red-400' : ''}`}
                                            >
                                                {/* Student Name */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${risk.bg} ${risk.text} border ${risk.border} flex-shrink-0`}>
                                                            {student.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                                                {student.username}
                                                                {student.risk === 'High' && (
                                                                    <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">URGENT</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                                <Mail size={9} /> {student.email}
                                                            </div>
                                                            {student.grade && <div className="text-[11px] text-slate-300 mt-0.5">{student.grade}</div>}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); handleToggleStatus(student); }}
                                                        title="Click to toggle Active / Inactive"
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${(student.enrollmentStatus || 'Active') === 'Active'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}
                                                    >
                                                        {student.enrollmentStatus || 'Active'}
                                                    </button>
                                                </td>

                                                {/* Risk Level */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full border ${risk.bg} ${risk.text} ${risk.border}`}>
                                                            {student.risk === 'High' && <AlertCircle size={11} />}
                                                            {risk.label}
                                                        </span>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setSelectedStudentForRisk(student); setNewRisk(student.risk || 'Low'); setProgressNote(''); setIsRiskModalOpen(true); }}
                                                            title="Update risk level"
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* 30 Day Trend (Sparkline) */}
                                                <td className="px-5 py-4 min-w-[120px]">
                                                    <div className="h-10 w-24">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={generateMoodData(sId)}>
                                                                <YAxis domain={[0, 5]} hide />
                                                                <Area 
                                                                    type="monotone" 
                                                                    dataKey="mood" 
                                                                    stroke={student.risk === 'High' ? '#ef4444' : student.risk === 'Medium' ? '#f59e0b' : '#6366f1'} 
                                                                    fill={student.risk === 'High' ? '#fee2e2' : student.risk === 'Medium' ? '#fef3c7' : '#e0e7ff'} 
                                                                    strokeWidth={2}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </td>

                                                {/* Mentor & Visit */}
                                                <td className="px-5 py-4">
                                                    {student.mentor ? (
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">{student.mentor.charAt(0)}</div>
                                                                <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]" title={student.mentor}>{student.mentor}</span>
                                                                <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                                                            </div>
                                                            {visit ? (
                                                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
                                                                    <CheckCircle size={9} /> {visit.date} @ {visit.time}
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={e => { e.stopPropagation(); setSelectedStudentForBooking(student); setIsBookingModalOpen(true); }}
                                                                    className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition w-fit"
                                                                >
                                                                    <Clock size={9} /> Schedule Visit
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setSelectedStudentForMentor(student); setAiSuggested(suggestMentor(student)); setSelectedMentor(null); setIsMentorModalOpen(true); }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
                                                        >
                                                            <UserPlus size={13} />
                                                            Assign Mentor
                                                        </button>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setExpandedStudentId(isExpanded ? null : sId)}
                                                            title="View History"
                                                            className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all"
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <History size={16} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            {/* Expandable History Row */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={6} className="px-5 pb-4 pt-0 bg-slate-50/50">
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="border border-slate-200 rounded-xl p-5 bg-white mt-2">
                                                                    <h5 className="text-xs font-bold text-slate-600 mb-4 flex items-center gap-2">
                                                                        <History size={12} /> Timeline for {student.username}
                                                                    </h5>
                                                                    <HistoryTimeline history={[
                                                                        ...(student.history || []),
                                                                        ...(scheduledVisits[sId] ? [{ type: 'visit', label: `Visit: ${scheduledVisits[sId].date} @ ${scheduledVisits[sId].time}`, details: scheduledVisits[sId].notes }] : [])
                                                                    ]} />
                                                                    {student.progressNotes && (
                                                                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                                            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1"><FileText size={11} /> Latest Progress Note</p>
                                                                            <p className="text-xs text-amber-600">{student.progressNotes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {!loading && filteredStudents.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">No students match this filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════ MODALS ══════════════════════════════════════════ */}

            {/* Assign Mentor Modal */}
            <AnimatePresence>
                {isMentorModalOpen && selectedStudentForMentor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Assign Mentor</h3>
                                    <p className="text-sm text-slate-500">For: <span className="font-semibold text-indigo-700">{selectedStudentForMentor.username}</span></p>
                                </div>
                                <button onClick={() => setIsMentorModalOpen(false)} className="p-2 hover:bg-white/60 rounded-full text-slate-400 transition-all"><X size={18} /></button>
                            </div>

                            {/* AI Suggestion Banner */}
                            {aiSuggested && (
                                <div className="mx-5 mt-4 p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
                                    <Sparkles size={16} className="text-indigo-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-indigo-800">AI Suggested Best Match</p>
                                        <p className="text-xs text-indigo-600 truncate">{aiSuggested.name} — {aiSuggested.subject}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedMentor(aiSuggested)}
                                        className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition flex-shrink-0"
                                    >
                                        Use
                                    </button>
                                </div>
                            )}

                            <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
                                {AVAILABLE_MENTORS.map(mentor => (
                                    <div
                                        key={mentor.id}
                                        onClick={() => mentor.availability === "Available" && setSelectedMentor(mentor)}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${mentor.availability !== "Available" ? "opacity-50 cursor-not-allowed border-slate-100 bg-slate-50" : "cursor-pointer hover:shadow-md bg-white"} ${selectedMentor?.id === mentor.id ? "border-indigo-500 bg-indigo-50/40 shadow-md shadow-indigo-100" : "border-slate-200"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">{mentor.icon}</div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{mentor.name}
                                                    {aiSuggested?.id === mentor.id && <Star size={11} className="inline ml-1 text-yellow-500" fill="currentColor" />}
                                                </p>
                                                <p className="text-xs text-slate-400">{mentor.subject}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-2.5 w-2.5 relative">
                                                {mentor.availability === "Available" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
                                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${mentor.color}`} />
                                            </span>
                                            <span className={`text-xs font-semibold ${mentor.availability === "Available" ? "text-green-600" : "text-slate-400"}`}>{mentor.availability}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => setIsMentorModalOpen(false)} className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium transition">Cancel</button>
                                <button
                                    onClick={handleAssignMentor}
                                    disabled={!selectedMentor}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow transition-all ${selectedMentor ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Schedule Visit Modal */}
            <AnimatePresence>
                {isBookingModalOpen && selectedStudentForBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Schedule Visit</h3>
                                    <p className="text-sm text-slate-500">Booking for <span className="font-semibold text-emerald-700">{selectedStudentForBooking.username}</span></p>
                                </div>
                                <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-white/60 rounded-full text-slate-400 transition-all"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleScheduleVisit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
                                        <input type="date" required className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" value={bookingData.date} onChange={e => setBookingData({ ...bookingData, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time *</label>
                                        <input type="time" required className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" value={bookingData.time} onChange={e => setBookingData({ ...bookingData, time: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Observation Notes (Optional)</label>
                                    <textarea rows={3} placeholder="Goals, context, or initial observations…" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none resize-none" value={bookingData.notes} onChange={e => setBookingData({ ...bookingData, notes: e.target.value })} />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center gap-2">
                                        <CheckCircle size={15} /> Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Update Risk Level Modal */}
            <AnimatePresence>
                {isRiskModalOpen && selectedStudentForRisk && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Shield size={18} className="text-amber-500" /> Update Risk Level</h3>
                                    <p className="text-sm text-slate-500">For: <span className="font-semibold text-amber-700">{selectedStudentForRisk.username}</span></p>
                                </div>
                                <button onClick={() => setIsRiskModalOpen(false)} className="p-2 hover:bg-white/60 rounded-full text-slate-400"><X size={18} /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">New Risk Level</label>
                                    <div className="flex gap-3">
                                        {RISK_LEVELS.map(level => {
                                            const cfg = getRiskConfig(level);
                                            return (
                                                <button
                                                    key={level}
                                                    onClick={() => setNewRisk(level)}
                                                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${newRisk === level ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-md` : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                                                >
                                                    {level === 'Low' ? 'Stable' : level}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Progress Notes</label>
                                    <textarea rows={3} placeholder="What has changed? Notable observations…" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none resize-none" value={progressNote} onChange={e => setProgressNote(e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsRiskModalOpen(false)} className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium">Cancel</button>
                                    <button
                                        onClick={handleUpdateRisk}
                                        disabled={!newRisk}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow transition-all flex items-center gap-2 ${newRisk ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                                    >
                                        <CheckCircle size={15} /> Save Update
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Student Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Add New Student</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                                    <input type="text" required placeholder="e.g. John Doe" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                                    <input type="email" required placeholder="john@school.edu" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grade/Class</label>
                                        <input type="text" placeholder="e.g. 10-A" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" value={newStudent.grade} onChange={e => setNewStudent({ ...newStudent, grade: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Initial Risk</label>
                                        <select className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" value={newStudent.risk} onChange={e => setNewStudent({ ...newStudent, risk: e.target.value })}>
                                            <option value="Low">Stable</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High Risk</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md">Add Student</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDirectory;
