const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const CheckIn = require('../models/CheckIn');
const Journal = require('../models/Journal');
const Alert = require('../models/Alert');
const Message = require('../models/Message');

let mongod;
let app;
let connectDB;

const createUserAndToken = async (overrides = {}) => {
    const user = await User.create({
        username: overrides.username || `user-${Date.now()}-${Math.random()}`,
        email: overrides.email || `user-${Date.now()}-${Math.random()}@school.test`,
        password: overrides.password || 'password123',
        role: overrides.role || 'student',
        risk: overrides.risk || 'Low',
        status: overrides.status || 'Happy',
        grade: overrides.grade || '10-A',
    });

    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: overrides.password || 'password123' });

    assert.equal(loginResponse.status, 200);
    return { user, token: loginResponse.body.token };
};

test.before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret';
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    ({ app, connectDB } = require('../server'));
    await connectDB();
});

test.after(async () => {
    await mongoose.disconnect();
    if (mongod) {
        await mongod.stop();
    }
});

test.beforeEach(async () => {
    await Promise.all([
        User.deleteMany({}),
        CheckIn.deleteMany({}),
        Journal.deleteMany({}),
        Alert.deleteMany({}),
        Message.deleteMany({}),
    ]);
});

test('register and login student', async () => {
    const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
            username: 'student one',
            email: 'student1@school.test',
            password: 'password123',
        });

    assert.equal(registerResponse.status, 201);
    assert.equal(registerResponse.body.role, 'student');

    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'student1@school.test',
            password: 'password123',
        });

    assert.equal(loginResponse.status, 200);
    assert.ok(loginResponse.body.token);
});

test('teacher can create and list students', async () => {
    const { token: teacherToken } = await createUserAndToken({
        username: 'teacher one',
        email: 'teacher1@school.test',
        role: 'teacher',
    });

    const createResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
            name: 'new student',
            email: 'newstudent@school.test',
            grade: '9-C',
            risk: 'Medium',
        });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.email, 'newstudent@school.test');
    assert.ok(createResponse.body.temporaryPassword);

    const listResponse = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`);

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.length, 1);
});

test('student history supports create list delete', async () => {
    const { token: studentToken } = await createUserAndToken({
        username: 'history student',
        email: 'history@school.test',
        role: 'student',
    });

    const checkinResponse = await request(app)
        .post('/api/history/checkin')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
            mood: 'Happy',
            emoji: '🙂',
            note: 'Feeling good',
        });

    assert.equal(checkinResponse.status, 201);

    const journalResponse = await request(app)
        .post('/api/history/journal')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
            mood: 'Calm',
            emoji: '📝',
            content: 'A steady day',
        });

    assert.equal(journalResponse.status, 201);

    const listResponse = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.length, 2);

    const deleteResponse = await request(app)
        .delete(`/api/history/Journal/${journalResponse.body._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(deleteResponse.status, 200);
});

test('student SOS persists and teacher can mark alert as read', async () => {
    const { token: teacherToken } = await createUserAndToken({
        username: 'alert teacher',
        email: 'alert-teacher@school.test',
        role: 'teacher',
    });
    const { token: studentToken } = await createUserAndToken({
        username: 'alert student',
        email: 'alert-student@school.test',
        role: 'student',
    });

    const sosResponse = await request(app)
        .post('/api/alerts/sos')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
            alert: {
                severity: 'High',
                type: 'SOS Triggered',
                message: 'Need help now',
            },
        });

    assert.equal(sosResponse.status, 201);
    assert.ok(sosResponse.body.alert.id);

    const alertList = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${teacherToken}`);

    assert.equal(alertList.status, 200);
    assert.equal(alertList.body.length, 1);

    const markRead = await request(app)
        .put(`/api/alerts/${alertList.body[0].id}/read`)
        .set('Authorization', `Bearer ${teacherToken}`);

    assert.equal(markRead.status, 200);
    assert.equal(markRead.body.status, 'Read');
});

test('teacher and student can exchange messages for a student conversation', async () => {
    const { token: teacherToken } = await createUserAndToken({
        username: 'chat teacher',
        email: 'chat-teacher@school.test',
        role: 'teacher',
    });
    const { user: student, token: studentToken } = await createUserAndToken({
        username: 'chat student',
        email: 'chat-student@school.test',
        role: 'student',
    });

    const teacherMessage = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
            studentId: student._id.toString(),
            text: 'How are you feeling today?',
        });

    assert.equal(teacherMessage.status, 201);
    assert.equal(teacherMessage.body.sender, 'teacher');

    const studentReply = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
            studentId: student._id.toString(),
            text: 'Much better today.',
        });

    assert.equal(studentReply.status, 201);
    assert.equal(studentReply.body.sender, 'student');

    const conversation = await request(app)
        .get(`/api/messages/${student._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

    assert.equal(conversation.status, 200);
    assert.equal(conversation.body.length, 2);
});
