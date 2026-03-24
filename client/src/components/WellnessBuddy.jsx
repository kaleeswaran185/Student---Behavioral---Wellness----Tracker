import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, ShieldAlert, Zap, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ─── API Configuration (proxied via Vite → localhost:5000) ────
const AI_CHAT_URL = '/api/ai-chat';

const WellnessBuddy = ({ studentName = "Student", history = [], moodContext = "" }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedTone, setSelectedTone] = useState('Encouraging');
    const messagesEndRef = useRef(null);

    // ─── Initial Greeting (Context Aware) ──────────────────────
    useEffect(() => {
        let greeting = `Hi ${studentName}! I'm WellnessBuddy — your wellness companion. How can I help you today? 💙`;

        if (history.length > 0) {
            const lastEntry = history[0];
            if (lastEntry.mood === 'Stressed') {
                greeting = `Hi ${studentName}. I recall you were feeling stressed recently. I hope you've had a chance to relax. How are you doing now? 🌿`;
            } else if (lastEntry.mood === 'Sad') {
                greeting = `Hi ${studentName}. Sending you good vibes. I hope today is a brighter day for you. How are you feeling? ☀️`;
            } else if (lastEntry.mood === 'Happy') {
                greeting = `Hi ${studentName}! You were feeling great last time — love to see that! 🎉 How's your mood today?`;
            }
        }

        setMessages([{ id: 1, text: greeting, sender: 'ai', source: 'local' }]);
    }, [studentName]);

    // ─── Auto-scroll ──────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // ═══════════════════════════════════════════════════════════
    // ─── LOCAL RESPONSE ENGINE (Guardrails + Fast Replies) ────
    // ═══════════════════════════════════════════════════════════
    const getLocalResponse = (text) => {
        const lowerText = text.toLowerCase().trim();

        // ── TIER 1: CRISIS GUARDRAIL (Instant, 0 Latency) ─────
        if (lowerText.match(/(suicide|kill|die|end it|hurt myself|self.?harm|sos|help me|i want to die|i don'?t want to live)/)) {
            return {
                text: "⚠️ I hear you, and I want you to know you matter. Please use the SOS button right now or talk to a trusted adult immediately. You are not alone.\n\n📞 Childline India: 1098\n📞 iCall: 9152987821",
                source: 'crisis'
            };
        }

        // ── TIER 2: FAST LOCAL RESPONSES ───────────────────────

        // Jokes (keep local for speed & fun)
        if (lowerText.match(/(joke|comedy|funny|laugh|humor)/)) {
            const jokes = [
                "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
                "Parallel lines have so much in common. It's a shame they'll never meet. 📏",
                "I told my wife she was drawing her eyebrows too high. She looked surprised. 🤨",
                "Why don't scientists trust atoms? Because they make up everything! ⚛️",
                "What do you call a fake noodle? An impasta! 🍝",
                "Why did the math book look sad? Because it had too many problems. 📘"
            ];
            return { text: jokes[Math.floor(Math.random() * jokes.length)], source: 'local' };
        }

        // Basic Greetings (instant)
        if (lowerText.match(/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)$/)) {
            return { text: `Hey ${studentName}! What's on your mind today? 😊`, source: 'local' };
        }

        // Very Short Input
        if (text.trim().length < 4) {
            return { text: "I didn't quite catch that. Could you say a bit more? 🤔", source: 'local' };
        }

        // ── NO LOCAL MATCH → Send to AI ───────────────────
        return null;
    };

    // ═══════════════════════════════════════════════════════════
    // ─── AI API CALL (The Brain) ──────────────────────────
    // ═══════════════════════════════════════════════════════════
    const getAIResponse = async (userMessage, recentMessages) => {
        try {
            // Send last 6 messages for context (to keep payload small)
            const chatHistory = recentMessages.slice(-6).map(msg => ({
                text: msg.text,
                sender: msg.sender === 'ai' ? 'ai' : 'user'
            }));

            // Format history: Send more history but keep it brief (last 10 items)
            const historyText = history && history.length > 0 
                ? history.slice(0, 10).map(h => `- ${h.time}: ${h.mood}`).join('\n')
                : "No history available.";
                
            const enhancedContext = `User Mood: ${moodContext || "Stable"}\n\nRecent Timeline:\n${historyText}`;

            const response = await fetch(AI_CHAT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    moodContext: enhancedContext,
                    history: chatHistory,
                    tone: selectedTone // Send tone to backend
                })
            });

            if (!response.ok) {
                if (response.status === 429) throw new Error('RATE_LIMIT');
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { text: data.reply, source: 'groq' };

        } catch (error) {
            console.error('[WellnessBuddy] AI API failed:', error.message);

            // Rate limited → show brief retry message
            if (error.message === 'RATE_LIMIT') {
                return {
                    text: `I'm a bit busy right now — give me a moment! ⏳`,
                    source: 'busy'
                };
            }

            // Other error → fallback to helpful local message
            const fallbacks = [
                `I'm listening, ${studentName}. I'm having a small connection hiccup, but please keep sharing! 💙`,
                "System is a bit slow right now, but I'm still here for you. What else is on your mind?",
                `I see. I'm taking a moment to process everything, ${studentName}. Tell me more.`,
                "I'm a bit busy thinking, but I'm still all ears! 😊"
            ];
            return {
                text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
                source: 'busy'
            };
        }
    };

    // ─── STORY WEAVER (New Feature) ───────────────────────────
    const handleStoryWeave = async () => {
        if (isTyping) return;

        // Filter today's items
        const today = new Date().toLocaleDateString();
        const todayItems = history.filter(item => item.date === today);

        if (todayItems.length === 0) {
            toast.error("No data found for today's story yet! Add some moods first.");
            return;
        }

        setIsTyping(true);

        // Format history for Weaver Prompt
        const historyData = todayItems
            .map(h => `- ${h.time}: ${h.mood}`)
            .reverse() // Sort chronologically (earliest first)
            .join('\n');

        const weaverPrompt = `I am keeping a Student Wellness History Timeline. I will provide you with my check-in logs for today (${today}).
        
Please write a short, 3-sentence story about my day in the third person. Use a ${selectedTone} tone.

Structure:
1. Morning Chapter: Based on my first few check-ins.
2. The Mid-Day Arc: How my mood shifted or stayed steady.
3. The Evening Conclusion: A summary of my overall wellness 'vibe'.

Format exactly as: [Date] — [Daily Title]
Data:\n${historyData}`;

        const result = await getAIResponse(weaverPrompt, []);

        setMessages(prev => [...prev, {
            id: Date.now(),
            text: result.text,
            sender: 'ai',
            source: 'groq'
        }]);
        setIsTyping(false);
    };

    // ═══════════════════════════════════════════════════════════
    // ─── SEND HANDLER (Async Pipeline) ────────────────────────
    // ═══════════════════════════════════════════════════════════
    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input.trim();
        const userMessage = { id: Date.now(), text: userText, sender: 'user', source: 'user' };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Step 1: Try local response first (instant)
        const localResult = getLocalResponse(userText);

        if (localResult) {
            // Local match found → reply instantly with a tiny natural delay
            setIsTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: localResult.text,
                    sender: 'ai',
                    source: localResult.source
                }]);
                setIsTyping(false);
            }, localResult.source === 'crisis' ? 200 : 800);
            return;
        }

        // Step 2: No local match → call AI (async)
        setIsTyping(true);

        const allMessages = [...messages, userMessage];
        const aiResult = await getAIResponse(userText, allMessages);

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: aiResult.text,
            sender: 'ai',
            source: aiResult.source
        }]);
        setIsTyping(false);
    };

    const handleClearChat = () => {
        const greeting = `Hi ${studentName}! I'm WellnessBuddy. Let's start fresh. How can I help you? ✨`;
        setMessages([{ id: Date.now(), text: greeting, sender: 'ai', source: 'local' }]);
    };

    const quickReplies = [
        { label: "Help me relax 🧘", text: "I'm feeling a bit anxious, can you help me relax?" },
        { label: "Daily Quote 💡", text: "Can you give me an inspiring quote for today?" },
        { label: "How am I doing? 📊", text: "Based on my recent history, how does my wellness look?" },
        { label: "Funny Joke 😂", text: "Tell me a joke!" }
    ];

    // ─── Source Badge Component ────────────────────────────────
    const SourceBadge = ({ source }) => {
        if (source === 'groq') {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-500 mt-1 opacity-70">
                    <Sparkles size={10} /> AI Powered
                </span>
            );
        }
        if (source === 'crisis') {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500 mt-1 opacity-70">
                    <ShieldAlert size={10} /> Safety Response
                </span>
            );
        }
        if (source === 'fallback') {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 mt-1 opacity-70">
                    <Zap size={10} /> Offline Mode
                </span>
            );
        }
        return null; // No badge for 'local' or 'user'
    };

    // ═══════════════════════════════════════════════════════════
    // ─── RENDER ───────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════
    return (
        <Card className="h-full flex flex-col bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-blue-500/10">
            <CardHeader className="pb-2 border-b border-slate-100 bg-white/40">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="relative">
                        <span className="text-2xl">🤖</span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">WellnessBuddy</p>
                        <p className="text-[10px] text-slate-400 font-medium">{isTyping ? "Typing..." : "Online"}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <select 
                            value={selectedTone} 
                            onChange={(e) => setSelectedTone(e.target.value)}
                            className="text-[10px] border shadow-sm rounded-full bg-white px-2 py-1 text-slate-500 font-bold outline-none hover:border-blue-300 transition-colors cursor-pointer"
                        >
                            <option>Encouraging</option>
                            <option>Humorous</option>
                            <option>Stoic</option>
                        </select>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleClearChat}
                            title="Clear Chat"
                            className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="max-w-[80%]">
                            <div
                                className={`px-4 py-2 text-sm shadow-sm whitespace-pre-line ${msg.sender === 'user'
                                    ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none'
                                    : msg.source === 'crisis'
                                        ? 'bg-red-50 text-red-800 rounded-2xl rounded-tl-none border border-red-200'
                                    : msg.source === 'groq'
                                            ? 'bg-gradient-to-br from-purple-50 to-blue-50 text-slate-700 rounded-2xl rounded-tl-none border border-purple-100'
                                            : 'bg-gray-100 text-slate-700 rounded-2xl rounded-tl-none'
                                    }`}
                            >
                                {msg.text}
                            </div>
                            {msg.sender === 'ai' && <SourceBadge source={msg.source} />}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            
            <CardFooter className="p-4 pt-1 flex flex-col gap-3">
                {/* Story Weaver & Quick Replies */}
                <div className="w-full space-y-2">
                    <div className="flex gap-2 items-center">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleStoryWeave}
                            disabled={isTyping}
                            className="h-8 gap-1.5 px-3 text-[11px] font-bold text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 rounded-full shrink-0"
                        >
                            <Zap size={12} className="fill-indigo-600" /> Story Weaver
                        </Button>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink">
                            {quickReplies.map((qr, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(qr.text);
                                        // handleSend will be triggered by next line effectively if we call it or let user click
                                    }}
                                    className="whitespace-nowrap px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                                >
                                    {qr.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isTyping}
                        className="bg-white/80 border-slate-200 focus:ring-2 focus:ring-blue-400 rounded-xl"
                    />
                    <Button 
                        size="icon" 
                        onClick={handleSend} 
                        disabled={isTyping || !input.trim()} 
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default WellnessBuddy;
