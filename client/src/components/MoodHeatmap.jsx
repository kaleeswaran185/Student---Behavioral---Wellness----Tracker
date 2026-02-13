import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mock Heatmap Data (Days x Students)
const heatmapData = [
    { day: 'Mon', moods: ['happy', 'happy', 'stressed', 'tired', 'happy'] },
    { day: 'Tue', moods: ['happy', 'stressed', 'stressed', 'tired', 'sad'] },
    { day: 'Wed', moods: ['happy', 'happy', 'happy', 'sad', 'happy'] },
    { day: 'Thu', moods: ['happy', 'tired', 'stressed', 'happy', 'happy'] },
    { day: 'Fri', moods: ['happy', 'happy', 'happy', 'happy', 'tired'] },
];

const getColor = (mood) => {
    switch (mood) {
        case 'happy': return 'bg-yellow-200';
        case 'stressed': return 'bg-red-200';
        case 'sad': return 'bg-blue-200';
        case 'tired': return 'bg-purple-200';
        default: return 'bg-gray-200';
    }
};

const MoodHeatmap = () => {
    return (
        <Card className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-blue-500/10">
            <CardHeader>
                <CardTitle>Class Mood Trends (Weekly)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    {heatmapData.map((row, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-10 text-sm font-bold text-gray-500">{row.day}</div>
                            <div className="flex gap-1 flex-1">
                                {row.moods.map((mood, j) => (
                                    <div
                                        key={j}
                                        className={`h-8 flex-1 rounded-sm ${getColor(mood)} transition-all hover:opacity-80`}
                                        title={mood}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-200 rounded-sm"></div> Happy</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 rounded-sm"></div> Stressed</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-200 rounded-sm"></div> Sad</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-200 rounded-sm"></div> Tired</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MoodHeatmap;
