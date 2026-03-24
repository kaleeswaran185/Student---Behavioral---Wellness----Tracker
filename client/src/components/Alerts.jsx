import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const MOCK_ALERTS = [
    {
        id: 1,
        student: "Bob Williams",
        severity: "High",
        type: "Keyword Detected",
        message: "Refers to 'giving up' in journal entry.",
        time: "10 min ago",
        status: "Unread"
    },
    {
        id: 2,
        student: "Evan Wright",
        severity: "High",
        type: "Missed Check-in",
        message: "Has not logged mood for 3 consecutive days.",
        time: "2 hours ago",
        status: "Unread"
    },
    {
        id: 3,
        student: "Charlie Brown",
        severity: "Medium",
        type: "Mood Drop",
        message: "Reported 'Sad' mood after 'Happy' streak.",
        time: "1 day ago",
        status: "Read"
    },
    {
        id: 4,
        student: "Fiona Gallagher",
        severity: "Medium",
        type: "Risk Analysis",
        message: "Engagement score dropped by 15%.",
        time: "1 day ago",
        status: "Unread"
    },
    {
        id: 5,
        student: "Diana Prince",
        severity: "Low",
        type: "System",
        message: "Weekly wellness report is ready.",
        time: "2 days ago",
        status: "Read"
    }
];






const Alerts = ({ incomingAlerts = [] }) => {
    const { user } = useAuth();
    // Merge mock alerts with local storage alerts
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState("All"); // 'All', 'Unread', 'High'

    const [activeChat, setActiveChat] = useState(null);
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([]);
    const chatEndRef = React.useRef(null);

    // Poll Chat Messages
    useEffect(() => {
        if (!activeChat) return;

        const fetchMessages = async () => {
            if (!user?.token) return;
            try {
                const res = await fetch(`/api/messages/${encodeURIComponent(activeChat.student)}`, {
                    headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (e) {
                console.error("Failed to fetch messages", e);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [activeChat, user?.token]);

    // Auto Scroll Chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChat]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !activeChat) return;
        
        const text = chatInput.trim();
        setChatInput('');

        // Optimistic update
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            studentName: activeChat.student,
            sender: 'teacher',
            text: text,
            timestamp: new Date().toISOString()
        }]);

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
                },
                body: JSON.stringify({
                    studentName: activeChat.student,
                    text: text
                })
            });
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    // Load alerts from storage, seeding with mock data if empty
    useEffect(() => {
        const initializeAndLoad = async () => {
            let localAlerts = [];
            if (!user?.token) {
                setAlerts(incomingAlerts);
                return;
            }
            
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
                        localAlerts = [...localAlerts, ...parsed];
                    }
                } else {
                    // Seed with mock data if nothing exists locally and backend is empty
                    if (localAlerts.length === 0) {
                        localAlerts = [...MOCK_ALERTS];
                        localStorage.setItem('teacher_alerts', JSON.stringify(localAlerts));
                    }
                }
            } catch (e) {
                console.error("Failed to parse alerts, resetting to defaults:", e);
                if (localAlerts.length === 0) {
                    localAlerts = [...MOCK_ALERTS];
                    localStorage.setItem('teacher_alerts', JSON.stringify(localAlerts));
                }
            }

            // Clean up stale "Alex (Student)" test alerts
            const filtered = localAlerts.filter(a => a.student !== "Alex (Student)");
            if (filtered.length !== localAlerts.length) {
                localAlerts = filtered;
                localStorage.setItem('teacher_alerts', JSON.stringify(localAlerts));
            }

            // Merge incomingAlerts (from App State)
            const allAlerts = [...incomingAlerts, ...localAlerts];
            const uniqueAlerts = Array.from(new Map(allAlerts.map(item => [item.id, item])).values());

            // Sort by time
            uniqueAlerts.sort((a, b) => b.id - a.id);

            setAlerts(uniqueAlerts);
        };

        // Poll for new SOS alerts
        const interval = setInterval(initializeAndLoad, 2000);
        initializeAndLoad(); // Initial load

        return () => {
            clearInterval(interval);
        };
    }, [incomingAlerts, user?.token]);

    const handleMarkAsRead = async (id) => {
        // Optimistic UI update
        const updatedAlerts = alerts.map(alert =>
            alert.id === id ? { ...alert, status: "Read" } : alert
        );
        setAlerts(updatedAlerts);
        localStorage.setItem('teacher_alerts', JSON.stringify(updatedAlerts));

        // Send to backend
        try {
            await fetch(`/api/alerts/${id}/read`, {
                method: 'PUT',
                headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
            });
        } catch (e) {
            console.error("Failed to mark read on backend", e);
        }
    };

    const handleDismiss = async (id) => {
        // Optimistic UI update
        const updatedAlerts = alerts.filter(alert => alert.id !== id);
        setAlerts(updatedAlerts);
        localStorage.setItem('teacher_alerts', JSON.stringify(updatedAlerts));

        // Send to backend
        try {
            await fetch(`/api/alerts/${id}`, {
                method: 'DELETE',
                headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
            });
        } catch (e) {
            console.error("Failed to dismiss on backend", e);
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter === "Unread") return alert.status === "Unread";
        if (filter === "High") return alert.severity === "High";
        return true;
    });

    const unreadCount = alerts.filter(a => a.status === "Unread").length;

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case "High":
                return "bg-red-50 border-red-100 text-red-800";
            case "Medium":
                return "bg-amber-50 border-amber-100 text-amber-800";
            case "Low":
                return "bg-blue-50 border-blue-100 text-blue-800";
            default:
                return "bg-slate-50 border-slate-100 text-slate-800";
        }
    };

    const getIcon = (severity) => {
        switch (severity) {
            case "High": return <AlertTriangle className="text-red-500" size={20} />;
            case "Medium": return <AlertTriangle className="text-amber-500" size={20} />;
            case "Low": return <Bell className="text-blue-500" size={20} />;
            default: return <Bell className="text-slate-500" size={20} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        Risk Alerts & Notifications
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                                {unreadCount} New
                            </span>
                        )}

                    </h2>
                    <p className="text-slate-500">Stay updated on student wellness and urgent issues.</p>
                </div>

                <div className="flex gap-3">
                    {alerts.length > 0 && (
                        <button
                            onClick={async () => {
                                if (window.confirm("Are you sure you want to clear all alerts?")) {
                                    setAlerts([]);
                                    localStorage.setItem('teacher_alerts', '[]');
                                    try {
                                        await fetch('/api/alerts', {
                                            method: 'DELETE',
                                            headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
                                        });
                                    } catch (e) {
                                        console.error("Failed to clear backend alerts", e);
                                    }
                                    toast.success("All alerts cleared");
                                }
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                    {/* Filters */}
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        {['All', 'Unread', 'High'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div> {/* Close Header */}

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`relative flex flex-col md:flex-row gap-4 p-5 rounded-xl border transition-all ${alert.status === 'Unread'
                                ? 'bg-white shadow-md border-indigo-100'
                                : 'bg-slate-50 border-slate-200 opacity-80'
                                }`}
                        >
                            {/* Icon Column */}
                            <div className={`p-3 rounded-full h-fit w-fit ${alert.severity === 'High' ? 'bg-red-100' :
                                alert.severity === 'Medium' ? 'bg-amber-100' : 'bg-blue-100'
                                }`}>
                                {getIcon(alert.severity)}
                            </div>

                            {/* Content Column */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800 text-lg">{alert.student}</h3>
                                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-100">
                                        <Clock size={12} /> {alert.time}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${getSeverityStyles(alert.severity)}`}>
                                        {alert.severity} Priority
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        • {alert.type}
                                    </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {alert.message}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3 mt-4">
                                    {alert.status === 'Unread' && (
                                        <button
                                            onClick={() => handleMarkAsRead(alert.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                                        >
                                            <CheckCircle size={14} /> Mark as Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setActiveChat(alert);
                                            setMessages([]);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                        <MessageSquare size={14} /> Chat with Student
                                    </button>
                                </div>
                            </div>

                            {/* Dismiss Button */}
                            <button
                                onClick={() => handleDismiss(alert.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-400 transition-colors"
                                title="Dismiss Alert"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-slate-500 font-medium">No alerts found</h3>
                        <p className="text-slate-400 text-sm">Great job! You're all caught up.</p>
                        {filter !== "All" && (
                            <button
                                onClick={() => setFilter("All")}
                                className="mt-4 text-indigo-600 text-sm hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Chat Window */}
            {activeChat && (
                <div className="fixed bottom-6 right-6 w-80 bg-white rounded-t-xl rounded-b-lg shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-slide-up">
                    {/* Chat Header */}
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">{activeChat.student}</h4>
                            <span className="text-xs text-indigo-200 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                            </span>
                        </div>
                        <button onClick={() => setActiveChat(null)} className="hover:bg-indigo-500 p-1 rounded transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="h-64 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 text-xs italic mt-4">No messages yet. Say hello!</div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={msg.id || i} className={`max-w-[85%] p-2 rounded-lg text-sm ${msg.sender === 'teacher'
                                ? 'bg-indigo-600 text-white self-end rounded-br-none'
                                : msg.sender === 'system'
                                    ? 'bg-transparent text-slate-400 text-xs text-center w-full italic'
                                    : 'bg-white border border-slate-200 text-slate-800 self-start rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendMessage();
                            }}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <MessageSquare size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alerts;
