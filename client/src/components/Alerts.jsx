import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, MessageSquare, X, Filter, FilterX } from 'lucide-react';

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

const Alerts = () => {
    // Merge mock alerts with local storage alerts
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState("All"); // 'All', 'Unread', 'High'

    useEffect(() => {
        const loadAlerts = () => {
            const localAlerts = JSON.parse(localStorage.getItem('teacher_alerts') || '[]');
            // Deduplicate based on ID if necessary, but for now just merge
            // Combine local alerts (newest first) with mock alerts
            const combined = [...localAlerts, ...MOCK_ALERTS];

            // Remove duplicates if any (by ID)
            const uniqueAlerts = combined.filter((alert, index, self) =>
                index === self.findIndex((t) => t.id === alert.id)
            );

            setAlerts(uniqueAlerts);
        };

        loadAlerts();

        // Optional: Poll for new alerts every 2 seconds
        const interval = setInterval(loadAlerts, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = (id) => {
        setAlerts(alerts.map(alert =>
            alert.id === id ? { ...alert, status: "Read" } : alert
        ));
    };

    const handleDismiss = (id) => {
        const updatedAlerts = alerts.filter(alert => alert.id !== id);
        setAlerts(updatedAlerts);

        // Also update local storage if it was a local alert
        const localAlerts = JSON.parse(localStorage.getItem('teacher_alerts') || '[]');
        const updatedLocal = localAlerts.filter(a => a.id !== id);
        localStorage.setItem('teacher_alerts', JSON.stringify(updatedLocal));
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
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
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
        </div>
    );
};

export default Alerts;
