/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SOSButton from '@/components/SOSButton';
import WellnessBuddy from '@/components/WellnessBuddy';
import TeacherChat from '@/components/TeacherChat';
import BreathingModal from '@/components/BreathingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, ChevronDown, ChevronUp, Lock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

// Mock Data
const _initialMockData = [
    { id: 1, date: 'Monday, Feb 10', time: '09:00 AM', mood: 'Happy', emoji: '😊', snippet: 'Had a great start to the week!', color: 'bg-green-100 text-green-700', type: 'Check-in' },
    { id: 2, date: 'Sunday, Feb 9', time: '02:30 PM', mood: 'Calm', emoji: '😌', snippet: 'Read a book and relaxed all afternoon.', color: 'bg-blue-100 text-blue-700', type: 'Check-in' },
    { id: 3, date: 'Saturday, Feb 8', time: '11:15 AM', mood: 'Happy', emoji: '😊', snippet: 'Played soccer with friends.', color: 'bg-green-100 text-green-700', type: 'Check-in' },
];

const moodOptions = [
    { label: 'Happy', emoji: '😊', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200', active: 'ring-4 ring-indigo-300 ring-offset-2' },
    { label: 'Calm', emoji: '😌', color: 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200', active: 'ring-4 ring-teal-300 ring-offset-2' },
    { label: 'Stressed', emoji: '😣', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200', active: 'ring-4 ring-red-300 ring-offset-2' },
    { label: 'Tired', emoji: '😴', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200', active: 'ring-4 ring-amber-300 ring-offset-2' },
];

const _getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const MoodHistoryList = ({ history, onDelete }) => {
    const [expandedId, setExpandedId] = useState(null);

    // Group items by date
    const groupedHistory = history.reduce((acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
    }, {});

    const dates = Object.keys(groupedHistory);

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl">
                    📅
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-600">No history yet</p>
                    <p className="text-xs text-slate-400">Your wellness journey starts here. Log your first mood to see it in the timeline!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence initial={false}>
                {dates.map((date, dateIdx) => (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                Day {dates.length - dateIdx} — {date}
                            </span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        {groupedHistory[date].map((item) => (
                            <motion.div
                                key={item._id || item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                layout
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="group cursor-pointer bg-white/50 hover:bg-white/80 transition-colors rounded-lg border border-slate-100 overflow-hidden relative shadow-sm"
                                    onClick={() => setExpandedId(expandedId === (item._id || item.id) ? null : (item._id || item.id))}
                                >
                                    {/* Delete Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(onDelete) onDelete(item.type, item._id || item.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-300"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.emoji}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-slate-500">{item.time || "Logged"}</p>
                                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight", item.color)}>
                                                        {item.mood}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {expandedId === (item._id || item.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <AnimatePresence>
                                        {expandedId === (item._id || item.id) && item.snippet && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-3 pt-0 text-sm text-slate-600 border-t border-slate-100/50 mt-1">
                                                    <p className="pt-2 italic">"{item.snippet}"</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {expandedId !== (item._id || item.id) && item.snippet && (
                                         <div className="px-3 pb-2 text-xs text-slate-500 truncate max-w-[250px] ml-11 opacity-70">
                                            {item.snippet}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

const fetchStudentHistory = async (token) => {
    const res = await fetch(apiUrl('/api/history'), {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch history');
    }

    return res.json();
};

const AchievementsCard = ({ xp, level, achievements }) => {
    return (
        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-100">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-700 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-500" />
                        My Achievements
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                        <span>Level {level}</span>
                        <span>{xp}/1000 XP</span>
                    </div>
                    {/* XP Progress Bar */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${(xp / 1000) * 100}%` }}
                        />
                    </div>

                    {/* Achievements Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {achievements.map((ach) => (
                            <div
                                key={ach.id}
                                className={cn(
                                    "flex flex-col items-center text-center gap-1 p-2 rounded-lg border transition-all relative group overflow-hidden",
                                    ach.unlocked
                                        ? "bg-white border-indigo-100 shadow-md ring-1 ring-yellow-400/50"
                                        : "bg-slate-50/50 border-slate-100 opacity-60 grayscale"
                                )}
                                title={ach.name}
                            >
                                {/* Shine Effect for Unlocked */}
                                {ach.unlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity duration-700 pointer-events-none" />
                                )}

                                <div className={cn(
                                    "p-2 rounded-full text-2xl relative",
                                    ach.unlocked ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-500"
                                )}>
                                    {ach.icon}
                                    {/* Lock Overlay for Locked */}
                                    {!ach.unlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 rounded-full">
                                            <Lock className="w-4 h-4 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 leading-tight mt-1 relative z-10">
                                    {ach.name}
                                </span>
                                {/* Progress Bar for Locked (Example) */}
                                {!ach.unlocked && ach.progress && (
                                    <div className="w-full h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-indigo-400" style={{ width: ach.progress }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const StudentDashboard = ({ onLogout, onTriggerSOS }) => {
    const { user, logout } = useAuth(); // Global auth context
    
    // UI State
    const [mood, setMood] = useState(null);
    const [journalEntry, setJournalEntry] = useState('');
    const [isBreathingOpen, setIsBreathingOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [activeChatTab, setActiveChatTab] = useState('ai');
    const studentName = user?.username || localStorage.getItem('student_name') || 'Student';

    const [xp, setXp] = useState(() => parseInt(localStorage.getItem('xp')) || 750);
    const [level, setLevel] = useState(() => parseInt(localStorage.getItem('level')) || 2);
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('streak')) || 1);
    const [history, setHistory] = useState([]);

    const refreshHistory = async () => {
        if (!user?.token) {
            setHistory([]);
            return;
        }

        try {
            const data = await fetchStudentHistory(user.token);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    useEffect(() => {
        if (!user?.token) {
            return;
        }

        let isCancelled = false;

        const loadHistory = async () => {
            try {
                const data = await fetchStudentHistory(user.token);
                if (!isCancelled) {
                    setHistory(data);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        };

        loadHistory();

        return () => {
            isCancelled = true;
        };
    }, [user?.token]);

    // 1. Achievements State (Manual for Zen Master & Streak Star)
    const [achievements, setAchievements] = useState(() => {
        // Load from storage or default
        const saved = localStorage.getItem('achievements_v2');
        return saved ? JSON.parse(saved) : [
            { id: 'zen', name: 'Zen Master', icon: '🧘', unlocked: false },
            { id: 'streak', name: 'Streak Star', icon: '🔥', unlocked: false, progress: '33%' } // Example starting progress
        ];
    });

    // Persist Deep State
    useEffect(() => {
        localStorage.setItem('xp', xp);
        localStorage.setItem('level', level);
        localStorage.setItem('streak', streak);
    }, [xp, level, streak]);

    // Persist Achievements
    useEffect(() => {
        localStorage.setItem('achievements_v2', JSON.stringify(achievements));
    }, [achievements]);

    // Confetti Timer
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const addExperience = (amount = 50) => {
        setXp(prevXp => {
            let newXp = prevXp + amount;
            if (newXp >= 1000) {
                const remainingXp = newXp - 1000;
                setLevel(prevLevel => {
                    const newLevel = prevLevel + 1;
                    // Level up toast?
                    toast.success(`🎉 Level Up! You are now Level ${newLevel}!`);
                    setShowConfetti(true);
                    return newLevel;
                });
                return remainingXp;
            }
            return newXp;
        });
    };

    const triggerUnlock = (achievementId, title) => {
        setAchievements(prev => prev.map(a =>
            a.id === achievementId ? { ...a, unlocked: true } : a
        ));
        setShowConfetti(true);
        toast.success(title, {
            description: "New achievement added to your collection!",
            duration: 5000,
            icon: '🏆'
        });
    };

    // 2. Scenario A: Zen Master (Instant)
    const handleCalmDown = () => {
        setIsBreathingOpen(true);

        const zenAchievement = achievements.find(a => a.id === 'zen');
        if (zenAchievement && !zenAchievement.unlocked) {
            triggerUnlock('zen', "Achievement Unlocked: Zen Master!");
        }
    };

    // 3. Scenario B: Streak Star (Progressive)
    const handleMoodSelect = (selectedMoodLabel) => {
        setMood(selectedMoodLabel);
        console.log("Mood selected:", selectedMoodLabel);

        addExperience(50);

        // Streak Logic
        let currentStreak = streak;
        const lastDate = localStorage.getItem('lastCheckInDate');
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        if (lastDate === yesterdayString) {
            currentStreak = streak + 1;
            setStreak(currentStreak);
        } else if (lastDate !== today) {
            const lastDateObj = new Date(lastDate || 0); // Handle null
            const timeDiff = new Date(today) - lastDateObj;
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (daysDiff > 1) {
                currentStreak = 1;
                setStreak(1);
            }
        }
        localStorage.setItem('lastCheckInDate', today);

        // Check Unlock Condition
        const streakAchievement = achievements.find(a => a.id === 'streak');
        if (currentStreak >= 3 && streakAchievement && !streakAchievement.unlocked) {
            triggerUnlock('streak', "🔥 3 Day Streak Achieved!");
        } else if (streakAchievement && !streakAchievement.unlocked) {
            // Update progress visual (simple logic 1/3, 2/3)
            const progress = Math.min((currentStreak / 3) * 100, 100) + '%';
            setAchievements(prev => prev.map(a =>
                a.id === 'streak' ? { ...a, progress } : a
            ));
        }

        // Post Check-in to Backend API
        const selectedOption = moodOptions.find(opt => opt.label === selectedMoodLabel);
        
        const saveCheckin = async () => {
            try {
                await fetch(apiUrl('/api/history/checkin'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        mood: selectedMoodLabel,
                        emoji: selectedOption.emoji,
                        note: "Check-in"
                    })
                });
                refreshHistory();
            } catch (error) {
                console.error("Failed to save checkin:", error);
            }
        };

        saveCheckin();
    };

    const handleDeleteHistory = async (type, id) => {
        try {
            const res = await fetch(apiUrl(`/api/history/${type}/${id}`), {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            if (res.ok) {
                toast.success("Entry removed");
                refreshHistory();
            } else {
                toast.error("Failed to delete entry");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error deleting entry");
        }
    };

    const handleSaveJournal = async () => {
        if (!journalEntry.trim() || !mood) return;

        addExperience(20); // Bonus XP

        const selectedOption = moodOptions.find(opt => opt.label === mood);

        try {
            await fetch(apiUrl('/api/history/journal'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    mood: mood,
                    content: journalEntry,
                    emoji: selectedOption ? selectedOption.emoji : '📝'
                })
            });
            refreshHistory();
            setJournalEntry('');
            toast.success("Journal entry saved securely.");
        } catch (error) {
            console.error("Failed to save journal:", error);
            toast.error("Failed to save journal.");
        }
    };

    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
        } else {
            logout(); // Fallback to context
        }
    };

    return (
        <div className="min-h-screen p-6 flex flex-col items-center gap-6 relative">

            {showConfetti && <Confetti recycle={true} numberOfPieces={200} />}

            <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />

            {/* Header Section */}
            <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-slate-700">
                    Hi, {studentName}! <span className="text-2xl">👋</span>
                </h1>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button
                        onClick={handleCalmDown}
                        className="bg-teal-400 hover:bg-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        🧘 Calm Down
                    </Button>
                    <SOSButton studentName={studentName} onTrigger={() => onTriggerSOS && onTriggerSOS(studentName)} />
                    <Button
                        variant="ghost"
                        onClick={handleLogoutClick}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold transition-colors"
                    >
                        Log Out
                    </Button>
                </div>
            </header>

            {/* Quote of the Day */}
            <div className="w-full max-w-5xl">
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100/50 shadow-md">
                    <CardContent className="p-4 flex items-center justify-center text-center">
                        <p className="text-amber-800 font-medium italic">
                            "Believe you can and you're halfway there."
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Inline Mood Selector */}
                    <Card className="w-full bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-blue-500/10">
                        <CardHeader>
                            <CardTitle className="text-center text-slate-700">How are you feeling today?</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-around gap-2">
                            {moodOptions.map((item) => (
                                <motion.div
                                    key={item.label}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "flex flex-col items-center h-24 w-24 gap-2 transition-all border shadow-sm",
                                            item.color,
                                            mood === item.label ? item.active : "border-transparent"
                                        )}
                                        onClick={() => handleMoodSelect(item.label)}
                                    >
                                        <span className="text-4xl">{item.emoji}</span>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Button>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* History Timeline */}
                        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-100">
                            <CardHeader>
                                <CardTitle className="text-slate-700 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    History Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <MoodHistoryList history={history} onDelete={handleDeleteHistory} />
                            </CardContent>
                        </Card>

                        {/* Journal */}
                        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-100 h-full">
                            <CardHeader>
                                <CardTitle className="text-slate-700">Journal</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col h-[calc(100%-5rem)]">
                                <Textarea
                                    placeholder="Write down your thoughts..."
                                    className="flex-1 bg-white/50 border-white/50 focus:bg-white resize-none text-slate-600 placeholder:text-slate-400 min-h-[200px]"
                                    value={journalEntry}
                                    onChange={(e) => setJournalEntry(e.target.value)}
                                />
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        variant="outline"
                                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!mood}
                                        onClick={handleSaveJournal}
                                    >
                                        Save Entry
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 lg:h-full">
                    {/* Chat Section */}
                    <div className="flex-1 min-h-[400px] flex flex-col h-full">
                        {/* Tab Switcher */}
                        <div className="flex bg-white/70 p-1 rounded-xl border border-white/50 shadow-sm mb-3">
                            <button
                                onClick={() => setActiveChatTab('ai')}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                    activeChatTab === 'ai' 
                                        ? "bg-blue-100 text-blue-700 shadow-sm" 
                                        : "text-slate-500 hover:bg-slate-50/50"
                                )}
                            >
                                Wellness Buddy ⭐
                            </button>
                            <button
                                onClick={() => setActiveChatTab('teacher')}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                    activeChatTab === 'teacher' 
                                        ? "bg-indigo-100 text-indigo-700 shadow-sm" 
                                        : "text-slate-500 hover:bg-slate-50/50"
                                )}
                            >
                                Teacher 👨‍🏫
                            </button>
                        </div>

                        {/* Chat Content */}
                        <div className="flex-1 min-h-[400px]">
                            {activeChatTab === 'ai' ? (
                                <WellnessBuddy 
                                    studentName={studentName} 
                                    history={history} 
                                    moodContext={mood ? `Student is currently feeling ${mood}.` : "No mood selected yet."} 
                                />
                            ) : (
                                <TeacherChat studentName={studentName} studentId={user?._id} />
                            )}
                        </div>
                    </div>

                    {/* Gamification Widget */}
                    <AchievementsCard xp={xp} level={level} streak={streak} achievements={achievements} />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
