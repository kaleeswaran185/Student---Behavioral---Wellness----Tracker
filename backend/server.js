const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { rateLimit } = require('express-rate-limit');

const { protect } = require('./middleware/authMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

let globalAlerts = [];
let globalMessages = [];

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('[DB] MONGO_URI is not set. DB-backed routes will return 503.');
            return;
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('[DB] MongoDB connected');
    } catch (err) {
        console.error('[DB] MongoDB connection failed:', err.message);
    }
};

mongoose.connection.on('error', (err) => {
    console.error('[DB] Mongo error event:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled rejection:', reason?.message || reason);
});

const requireDatabase = (_req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
    }
    return next();
};

const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'counselor')) {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized as staff' });
};

const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized as student' });
};

const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
});

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Wellness Tracker API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/students', protect, staffOnly, requireDatabase, async (_req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        return res.json(students);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.post('/api/students', protect, staffOnly, requireDatabase, async (req, res) => {
    const { name, email, grade, risk, temporaryPassword } = req.body;

    try {
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        const hasValidTempPassword =
            typeof temporaryPassword === 'string' && temporaryPassword.trim().length >= 8;
        const generatedPassword = crypto.randomBytes(9).toString('base64url');
        const finalPassword = hasValidTempPassword ? temporaryPassword.trim() : generatedPassword;

        const newStudent = await User.create({
            username: String(name).trim(),
            email: normalizedEmail,
            password: finalPassword,
            role: 'student',
            grade,
            risk: risk || 'Low',
            level: 1,
            streak: 0,
            status: 'Happy',
            avatar: '??',
        });

        const payload = newStudent.toObject();
        delete payload.password;
        if (!hasValidTempPassword) {
            payload.temporaryPassword = generatedPassword;
        }

        return res.status(201).json(payload);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

app.put('/api/students/:id', protect, staffOnly, requireDatabase, async (req, res) => {
    try {
        const updateData = {};
        const updatableFields = ['mentor', 'risk', 'status', 'enrollmentStatus', 'progressNotes'];

        updatableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const mongoUpdate = { $set: updateData };
        if (req.body.historyEvent) {
            mongoUpdate.$push = {
                history: {
                    ...req.body.historyEvent,
                    timestamp: new Date(),
                },
            };
        }

        const student = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'student' },
            mongoUpdate,
            { new: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json(student);
    } catch (err) {
        return res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.post('/api/sos', protect, studentOnly, (req, res) => {
    const { alert } = req.body;

    const newAlert = {
        id: crypto.randomUUID(),
        student: req.user.username,
        severity: alert?.severity || 'High',
        type: alert?.type || 'SOS / Emergency',
        message: alert?.message || 'Student triggered the SOS button.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Unread',
        createdAt: new Date().toISOString(),
    };

    globalAlerts.unshift(newAlert);
    return res.json({ message: 'Alert sent to counselors', alerts: globalAlerts });
});

app.get('/api/alerts', protect, staffOnly, (_req, res) => {
    return res.json(globalAlerts);
});

app.put('/api/alerts/:id/read', protect, staffOnly, (req, res) => {
    const { id } = req.params;
    const alert = globalAlerts.find((item) => String(item.id) === String(id));
    if (alert) {
        alert.status = 'Read';
    }
    return res.json(globalAlerts);
});

app.delete('/api/alerts/:id', protect, staffOnly, (req, res) => {
    const { id } = req.params;
    globalAlerts = globalAlerts.filter((item) => String(item.id) !== String(id));
    return res.json(globalAlerts);
});

app.delete('/api/alerts', protect, staffOnly, (_req, res) => {
    globalAlerts = [];
    return res.json({ message: 'All alerts cleared' });
});

app.get('/api/messages/:studentName', protect, (req, res) => {
    const { studentName } = req.params;

    if (req.user.role === 'student' && req.user.username !== studentName) {
        return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    const conversation = globalMessages.filter((message) => message.studentName === studentName);
    return res.json(conversation);
});

app.post('/api/messages', protect, (req, res) => {
    const { studentName, text } = req.body;

    if (!studentName || !text || !String(text).trim()) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (req.user.role === 'student' && req.user.username !== studentName) {
        return res.status(403).json({ message: 'Not authorized to send to this conversation' });
    }

    const sender = req.user.role === 'student' ? 'student' : 'teacher';

    const newMessage = {
        id: crypto.randomUUID(),
        studentName,
        sender,
        text: String(text).trim(),
        timestamp: new Date().toISOString(),
    };

    globalMessages.push(newMessage);
    return res.status(201).json(newMessage);
});

app.post('/api/ai-chat', aiRateLimiter, async (req, res) => {
    const { message, moodContext, history, tone } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    const systemPrompt = `You are "WellnessBuddy", a compassionate school wellness counselor chatbot for students aged 13-18.

Current Tone Request: ${tone || 'Encouraging'}

RULES:
- Personality: If tone is Humorous, use witty but gentle jokes. If Stoic, be calm and steady. If Encouraging, be warm and uplifting.
- Be empathetic, warm, and supportive.
- Keep responses under 50 words.
- NEVER diagnose, prescribe medication, or give medical advice.
- If a student mentions self-harm, suicide, or crisis, direct them to use the SOS button or talk to a trusted adult.
- Use mood context to personalize your response.
- Ask gentle follow-up questions.

MOOD CONTEXT: ${moodContext || 'No recent mood data available.'}`;

    const formattedHistory = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history)) {
        for (const item of history) {
            if (item.sender === 'user') {
                formattedHistory.push({ role: 'user', content: item.text });
            } else if (item.sender === 'ai') {
                formattedHistory.push({ role: 'assistant', content: item.text });
            }
        }
    }

    formattedHistory.push({ role: 'user', content: message });

    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return res.status(503).json({ error: 'AI service is not configured. Please set GROQ_API_KEY in .env' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: formattedHistory,
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error(`[AI-Chat] Groq API Error: ${response.status} - ${errData}`);
            if (response.status === 429) {
                return res.status(429).json({ error: 'Rate limited.', reply: 'I am busy right now. Please try again shortly.' });
            }
            throw new Error(`Groq API returned ${response.status}`);
        }

        const data = await response.json();
        const responseText = data?.choices?.[0]?.message?.content || 'I could not generate a response.';

        return res.json({ reply: responseText, model: 'llama-3.1-8b-instant' });
    } catch (error) {
        console.error('[AI-Chat] Chat error:', error.message || error);
        return res.status(503).json({ error: 'AI service is temporarily unavailable. Please try again.' });
    }
});

app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
});
