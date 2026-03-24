import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getAuthHeaders } from '../lib/api';

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
            await apiRequest('/api/alerts/sos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(user.token)
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
                {loading ? 'Sending...' : 'SOS / HELP'}
            </Button>
        </>
    );
};

export default SOSButton;
