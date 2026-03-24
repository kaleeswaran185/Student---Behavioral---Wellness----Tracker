import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const SOSButton = ({ onTrigger, studentName }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSOS = async () => {
        if (!user?.token) {
            toast.error('Please log in again before sending SOS.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/sos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    alert: {
                        student: studentName || 'Unknown Student',
                        severity: 'High',
                        type: 'SOS Triggered',
                        message: 'Student requested immediate assistance via SOS button.'
                    }
                })
            });

            if (!response.ok) {
                const failedData = await response.json().catch(() => ({}));
                throw new Error(failedData.message || 'Failed to send SOS alert.');
            }

            if (onTrigger) {
                onTrigger();
            }

            toast.error('SOS Alert Sent! Teacher notified.', {
                description: 'Help is on the way. Stay calm.',
                duration: 5000,
            });
        } catch (error) {
            console.error('Error sending SOS to backend:', error);
            toast.error(error.message || 'Unable to send SOS alert right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 font-bold shadow-lg animate-pulse hover:animate-none border-none"
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
