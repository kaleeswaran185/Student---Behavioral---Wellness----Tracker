/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const moods = [
    { label: 'Happy', emoji: '😊', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' },
    { label: 'Stressed', emoji: '😣', color: 'bg-red-100 hover:bg-red-200' },
    { label: 'Sad', emoji: '😢', color: 'bg-blue-100 hover:bg-blue-200' },
    { label: 'Tired', emoji: '😴', color: 'bg-purple-100 hover:bg-purple-200' },
];

const CheckIn = ({ onMoodSelect }) => {
    const [selectedMood, setSelectedMood] = useState(null);

    const handleSelect = (mood) => {
        setSelectedMood(mood);
        if (onMoodSelect) onMoodSelect(mood);
    };

    return (
        <Card className="w-full bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-blue-500/10">
            <CardHeader>
                <CardTitle className="text-center">How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around gap-2">
                {moods.map((mood) => (
                    <motion.div
                        key={mood.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="outline"
                            className={cn(
                                "flex flex-col items-center h-24 w-24 gap-2 transition-all border-0 shadow-sm",
                                mood.color,
                                selectedMood?.label === mood.label && "ring-4 ring-indigo-300 ring-offset-2"
                            )}
                            onClick={() => handleSelect(mood)}
                        >
                            <span className="text-4xl">{mood.emoji}</span>
                            <span className="text-sm font-medium">{mood.label}</span>
                        </Button>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
};

export default CheckIn;
