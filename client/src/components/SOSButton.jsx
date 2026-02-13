import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const SOSButton = () => {
    const [loading, setLoading] = useState(false);

    const handleSOS = () => {
        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const newAlert = {
                id: Date.now(),
                student: "Alex (Student)", // Default for demo, or fetch from auth
                severity: "High",
                type: "SOS Triggered",
                message: "Student requested immediate assistance via SOS button.",
                time: "Just now",
                status: "Unread"
            };

            // Save to LocalStorage for Teacher Dashboard
            const existingAlerts = JSON.parse(localStorage.getItem('teacher_alerts') || '[]');
            localStorage.setItem('teacher_alerts', JSON.stringify([newAlert, ...existingAlerts]));

            toast.error("SOS Alert Sent! Teacher notified.", {
                description: "Help is on the way. Stay calm.",
                duration: 5000,
            });

            setLoading(false);
        }, 1000);
    };

    return (
        <>
            <Button
                variant="destructive"
                size="lg"
                className="flex items-center gap-2 font-bold shadow-lg animate-pulse hover:animate-none"
                onClick={handleSOS}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertCircle className="h-5 w-5" />}
                {loading ? "Sending..." : "SOS / HELP"}
            </Button>
            {/* Local Toaster in case Dashboard one isn't reachable, though usually it's at App level */}
        </>
    );
};

export default SOSButton;
