/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Award, Star, Zap, Sun, BookOpen, Smile } from 'lucide-react';

// 1. DATA STRUCTURE (The Brain)
export const achievements = [
    {
        id: 'first_step',
        title: 'First Step',
        icon: Smile, // Component reference, used in UI
        description: 'Complete your first daily check-in.',
        condition: (history) => history.length > 0 && history.some(h => h.type === 'Check-in'),
    },
    {
        id: 'streak_star',
        title: 'Streak Star',
        icon: Zap,
        description: 'Reach a 3-day check-in streak.',
        condition: (_history, streak) => streak >= 3,
    },
    {
        id: 'week_warrior',
        title: 'Week Warrior',
        icon: Award,
        description: 'Reach a 7-day check-in streak.',
        condition: (_history, streak) => streak >= 7,
    },
    {
        id: 'journal_pro',
        title: 'Journal Pro',
        icon: BookOpen,
        description: 'Save 5 journal entries.',
        condition: (history) => history.filter(h => h.type === 'Journal').length >= 5,
    },
    {
        id: 'zen_master',
        title: 'Zen Master',
        icon: Star,
        description: 'Use the "Calm Down" feature.',
        condition: (_history, _streak, stats) => stats.hasUsedCalmDown,
    },
    {
        id: 'early_bird',
        title: 'Early Bird',
        icon: Sun, // Assuming Sun icon is imported or available
        description: 'Check-in before 8:00 AM.',
        condition: (history) => history.some(h => {
            if (h.type !== 'Check-in') return false;
            // Parse time string "07:30 AM" or similar
            // Assuming time format "HH:mm AM/PM"
            // We can also check raw Date logic if available, but let's try strict parsing or just match standard
            try {
                const timeParts = h.time.match(/(\d+):(\d+)\s?(AM|PM)/);
                if (timeParts) {
                    let hours = parseInt(timeParts[1]);
                    parseInt(timeParts[2]);
                    const ampm = timeParts[3];
                    if (ampm === 'PM' && hours !== 12) hours += 12;
                    if (ampm === 'AM' && hours === 12) hours = 0;
                    return hours < 8; // Strictly before 8 AM
                }
                return false;
            } catch { return false; }
        }),
    },
];

// 2. THE LOGIC (The Engine)
export const useGamification = (history, streak, stats) => {
    // Load unlocked status from local storage
    const [unlocked, setUnlocked] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('unlockedAchievements')) || {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        let newUnlock = false;
        const updatedUnlocked = { ...unlocked };

        achievements.forEach(achievement => {
            if (!updatedUnlocked[achievement.id]) { // If not already unlocked
                if (achievement.condition(history, streak, stats)) {
                    updatedUnlocked[achievement.id] = {
                        unlockedAt: new Date().toLocaleDateString(),
                        id: achievement.id
                    };
                    newUnlock = true;
                    // Trigger Notification
                    // simple alert for now as requested/implied standard
                    // Ideally toast, but alert is robust
                    setTimeout(() => alert(`🏆 Unlocked: ${achievement.title}!`), 100);
                }
            }
        });

        if (newUnlock) {
            setUnlocked(updatedUnlocked);
            localStorage.setItem('unlockedAchievements', JSON.stringify(updatedUnlocked));
        }
    }, [history, streak, stats]);

    return { unlocked };
};
