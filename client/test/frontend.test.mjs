import test from 'node:test';
import assert from 'node:assert/strict';

import { achievements } from '../src/lib/gamification.js';
import { resolveApiBaseUrl } from '../src/lib/api.js';
import { cn } from '../src/lib/utils.js';

test('cn merges utility classes with tailwind precedence', () => {
    assert.equal(cn('px-2 text-slate-500', 'px-4', 'font-bold'), 'text-slate-500 px-4 font-bold');
});

test('first_step achievement unlocks after first check-in', () => {
    const achievement = achievements.find((item) => item.id === 'first_step');
    const history = [{ type: 'Check-in', time: '07:30 AM' }];

    assert.equal(achievement.condition(history, 0, {}), true);
});

test('journal_pro achievement needs five journal entries', () => {
    const achievement = achievements.find((item) => item.id === 'journal_pro');
    const history = Array.from({ length: 5 }, () => ({ type: 'Journal' }));

    assert.equal(achievement.condition(history, 0, {}), true);
    assert.equal(achievement.condition(history.slice(0, 4), 0, {}), false);
});

test('streak achievements depend on streak count', () => {
    const streakStar = achievements.find((item) => item.id === 'streak_star');
    const weekWarrior = achievements.find((item) => item.id === 'week_warrior');

    assert.equal(streakStar.condition([], 3, {}), true);
    assert.equal(streakStar.condition([], 2, {}), false);
    assert.equal(weekWarrior.condition([], 7, {}), true);
    assert.equal(weekWarrior.condition([], 6, {}), false);
});

test('early_bird unlocks for check-ins before 8 AM', () => {
    const achievement = achievements.find((item) => item.id === 'early_bird');

    assert.equal(achievement.condition([{ type: 'Check-in', time: '07:45 AM' }], 0, {}), true);
    assert.equal(achievement.condition([{ type: 'Check-in', time: '08:15 AM' }], 0, {}), false);
});

test('resolveApiBaseUrl falls back to the deployed Render API for the live Vercel app', () => {
    assert.equal(
        resolveApiBaseUrl({
            configuredBaseUrl: '',
            currentOrigin: 'https://studentbehavioralwellnesstracker.vercel.app',
        }),
        'https://sbwt-api.onrender.com'
    );
});

test('resolveApiBaseUrl ignores a frontend-origin API base and keeps relative requests local in dev', () => {
    assert.equal(
        resolveApiBaseUrl({
            configuredBaseUrl: 'http://localhost:5173/',
            currentOrigin: 'http://localhost:5173',
        }),
        ''
    );
});

test('resolveApiBaseUrl ignores an invalid underscore host and uses the Render fallback', () => {
    assert.equal(
        resolveApiBaseUrl({
            configuredBaseUrl: 'https://student_behavioral_wellness_tracker.onrender.com',
            currentOrigin: 'https://studentbehavioralwellnesstracker.vercel.app',
        }),
        'https://sbwt-api.onrender.com'
    );
});
