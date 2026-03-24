import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherChat = ({ studentName = "Student" }) => {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        if (!user?.token) return;
        try {
            const res = await fetch(`/api/messages/${encodeURIComponent(studentName)}`, {
                headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    // Poll for messages
    useEffect(() => {
        if (!studentName || !user?.token) return;
        
        // Initial fetch
        fetchMessages();

        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [studentName, user?.token]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userText = input.trim();
        setIsSending(true);

        // Optimistic UI update
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: tempId,
            studentName,
            sender: 'student',
            text: userText,
            timestamp: new Date().toISOString()
        }]);
        setInput('');

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {})
                },
                body: JSON.stringify({
                    studentName,
                    text: userText
                })
            });
            // Refetch to get actual server state
            fetchMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="h-full flex flex-col bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-indigo-500/10">
            <CardHeader className="pb-2 border-b border-slate-100 bg-indigo-50/40">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="relative">
                        <span className="text-2xl">👨‍🏫</span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">Teacher Chat</p>
                        <p className="text-[10px] text-slate-400 font-medium">Online</p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                        No messages yet. Send a message to your teacher!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-[80%]">
                                <div
                                    className={`px-4 py-2 text-sm shadow-sm whitespace-pre-line ${msg.sender === 'student'
                                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                <span className={`text-[9px] text-slate-400 mt-1 block ${msg.sender === 'student' ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            
            <CardFooter className="p-4 pt-3 flex flex-col gap-3 bg-white/40">
                <div className="w-full flex gap-2">
                    <Input
                        placeholder="Message your teacher..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isSending}
                        className="bg-white/80 border-slate-200 focus:ring-2 focus:ring-indigo-400 rounded-xl"
                    />
                    <Button 
                        size="icon" 
                        onClick={handleSend} 
                        disabled={isSending || !input.trim()} 
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md shrink-0 rounded-xl"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default TeacherChat;
