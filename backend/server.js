const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const { body } = require('express-validator');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { rateLimit } = require('express-rate-limit');

const { protect } = require('./middleware/authMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');
const { validationHandler } = require('./middleware/validationMiddleware');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const messageRoutes = require('./routes/messages');
const studentRoutes = require('./routes/students');
const logger = require('./utils/logger');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 5000;
const BODY_LIMIT = process.env.BODY_LIMIT || '1mb';

const parseOrigins = (value) =>
    String(value || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            logger.warn('[DB] MONGO_URI is not set. DB-backed routes will return 503.');
            return;
        }

        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        logger.info('[DB] MongoDB connected');
    } catch (err) {
        logger.error('[DB] MongoDB connection failed:', err.message);
        throw err;
    }
};

mongoose.connection.on('error', (err) => {
    logger.error('[DB] Mongo error event:', err.message);
});

process.on('unhandledRejection', (reason) => {
    logger.error('[Server] Unhandled rejection:', reason?.message || reason);
});

const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' },
});

const configuredOrigins = parseOrigins(process.env.CLIENT_ORIGIN);
const allowedOrigins = Array.from(
    new Set([
        ...configuredOrigins,
        ...(NODE_ENV === 'production'
            ? []
            : [
                  'http://localhost:5173',
                  'http://localhost:3000',
                  'http://127.0.0.1:5173',
              ]),
    ])
);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

const registerAiRoute = (app) => {
    app.post('/api/ai-chat', protect, aiRateLimiter, [
        body('message').trim().notEmpty().withMessage('Message is required.'),
        body('tone')
            .optional()
            .isIn(['Encouraging', 'Humorous', 'Stoic'])
            .withMessage('Tone is invalid.'),
    ], validationHandler, async (req, res) => {
        const { message, moodContext, history, tone } = req.body;

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
                logger.error(`[AI-Chat] Groq API Error: ${response.status} - ${errData}`);
                if (response.status === 429) {
                    return res.status(429).json({ error: 'Rate limited.', reply: 'I am busy right now. Please try again shortly.' });
                }
                throw new Error(`Groq API returned ${response.status}`);
            }

            const data = await response.json();
            const responseText = data?.choices?.[0]?.message?.content || 'I could not generate a response.';

            return res.json({ reply: responseText, model: 'llama-3.1-8b-instant' });
        } catch (error) {
            logger.error('[AI-Chat] Chat error:', error.message || error);
            return res.status(503).json({ error: 'AI service is temporarily unavailable. Please try again.' });
        }
    });
};

const createApp = () => {
    const app = express();

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(express.json({ limit: BODY_LIMIT }));
    app.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }));

    app.get('/', (_req, res) => {
        res.send('Wellness Tracker API is running');
    });

    app.get('/health', (_req, res) => {
        return res.json({
            status: 'ok',
            environment: NODE_ENV,
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
        });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/history', historyRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/alerts', alertRoutes);
    app.use('/api/messages', messageRoutes);
    registerAiRoute(app);
    app.use(errorHandler);

    return app;
};

const app = createApp();

const startServer = async (port = PORT) => {
    if (NODE_ENV === 'production' && configuredOrigins.length === 0) {
        logger.warn('[Config] CLIENT_ORIGIN is not set in production. Browser requests will fail CORS checks.');
    }

    logger.info(`[Config] Allowed browser origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'none configured'}`);
    await connectDB();
    return app.listen(port, () => {
        logger.info(`[Server] Running on port ${port}`);
    });
};

if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    createApp,
    connectDB,
    startServer,
};
