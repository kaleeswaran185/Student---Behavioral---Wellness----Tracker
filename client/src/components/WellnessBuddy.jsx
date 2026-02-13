import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const WellnessBuddy = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm WellnessBuddy. How are you feeling right now?", sender: 'ai' }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Mock Smart AI Response
        setTimeout(() => {
            const getAIResponse = (text) => {
                const lowerText = text.toLowerCase();

                // Basic Greetings
                if (lowerText.match(/^(hi|hello|hey|yo)/)) {
                    return "Hello there! How are you feeling today?";
                }

                // Physical Health
                if (lowerText.includes('fever') || lowerText.includes('sick') || lowerText.includes('pain') || lowerText.includes('headache') || lowerText.includes('cold')) {
                    return "I'm sorry you're not feeling well physically. It's important to rest and drink plenty of water. If it gets worse, please tell a parent or school nurse.";
                }

                // Emotional Keywords
                if (lowerText.includes('sad') || lowerText.includes('cry') || lowerText.includes('depressed') || lowerText.includes('lonely')) {
                    return "I'm sorry you're feeling this way. Remember, it's okay not to be okay. Have you tried talking to a friend or teacher?";
                }
                if (lowerText.includes('stress') || lowerText.includes('exam') || lowerText.includes('study') || lowerText.includes('work') || lowerText.includes('deadline')) {
                    return "It sounds like a lot of pressure. Try breaking your tasks into smaller, manageable steps. And don't forget to take breaks!";
                }
                if (lowerText.includes('anxious') || lowerText.includes('panic') || lowerText.includes('scared') || lowerText.includes('nervous')) {
                    return "Anxiety is tough. Have you tried the 'Calm Down' button? A few deep breaths can really help reset your nervous system.";
                }
                if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('excited')) {
                    return "That's amazing! I'm so glad to hear that. What made your day so special?";
                }
                if (lowerText.includes('tired') || lowerText.includes('sleep') || lowerText.includes('exhausted')) {
                    return "Rest is productive too. Maybe it's time to disconnect for a bit and recharge your batteries?";
                }
                if (lowerText.includes('help') || lowerText.includes('sos') || lowerText.includes('suicide') || lowerText.includes('hurt')) {
                    return "Please use the SOS button immediately or reach out to a trusted adult, counselor, or emergency service. You are not alone.";
                }

                // Conversational flow for confusion
                if (lowerText.includes('what') || lowerText.includes('mean') || lowerText.includes('understand')) {
                    return "I'm still learning! valid point. I mainly want to check in on your mood. How are you feeling right now?";
                }

                const fallbacks = [
                    "I hear you. Tell me more about that.",
                    "That sounds important. How does that make you feel?",
                    "I'm listening. Go on.",
                    "Thank you for sharing that with me.",
                    "Sometimes writing things down in the journal section can help clarify your thoughts too."
                ];

                // Simple random fallback
                return fallbacks[Math.floor(Math.random() * fallbacks.length)];
            };

            const aiResponse = {
                id: Date.now() + 1,
                text: getAIResponse(input),
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <Card className="h-full flex flex-col bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-blue-500/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <span>🤖</span> WellnessBuddy
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2 text-sm shadow-sm ${msg.sender === 'user'
                                ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2">
                <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="bg-white/50 border-white/50 focus:bg-white"
                />
                <Button size="icon" onClick={handleSend} className="bg-blue-500 hover:bg-blue-600">
                    <Send className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default WellnessBuddy;
