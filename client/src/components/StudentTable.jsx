import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mock Data
const students = [
    { id: 1, name: "Alice Johnson", mood: "Happy", emoji: "😊", alert: false },
    { id: 2, name: "Bob Smith", mood: "Stressed", emoji: "😣", alert: true },
    { id: 3, name: "Charlie Brown", mood: "Tired", emoji: "😴", alert: false },
    { id: 4, name: "Diana Prince", mood: "Happy", emoji: "😊", alert: false },
    { id: 5, name: "Evan Wright", mood: "Sad", emoji: "😢", alert: false },
];

const StudentTable = () => {
    return (
        <Card className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl shadow-blue-500/10">
            <CardHeader>
                <CardTitle>Student Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Student Name</th>
                                <th className="px-6 py-3">Current Mood</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xl mr-2">{student.emoji}</span>
                                        {student.mood}
                                    </td>
                                    <td className="px-6 py-4">
                                        {student.alert ? (
                                            <span className="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:bg-red-700 dark:text-red-100">
                                                Check In Needed
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
                                                Stable
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default StudentTable;
