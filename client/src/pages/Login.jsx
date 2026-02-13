import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Mock login logic & Name Storage
        if (role === 'student') {
            const nameInput = document.getElementById('name')?.value || '';
            const emailInput = document.getElementById('email')?.value || '';

            // Prioritize explicit name, fallback to email extraction
            let displayName = nameInput.trim();
            if (!displayName && emailInput) {
                const namePart = emailInput.split('@')[0];
                displayName = namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : 'Student';
            }
            if (!displayName) displayName = 'Student';

            localStorage.setItem('student_name', displayName);
            navigate('/student-dashboard');
        } else {
            navigate('/teacher-dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[350px] bg-white/80 backdrop-blur-lg shadow-xl border-white/50">
                <CardHeader>
                    <CardTitle className="text-slate-700">Welcome Back</CardTitle>
                    <CardDescription className="text-slate-500">Enter your credentials to access the wellness tracker.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="role" className="text-sm font-medium leading-none text-slate-600">
                                    Select Role
                                </label>
                                <select
                                    id="role"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="name" className="text-sm font-medium leading-none text-slate-600">
                                    Full Name
                                </label>
                                <Input id="name" placeholder="John Doe" className="bg-white/50 border-slate-200 focus:ring-indigo-500" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="email" className="text-sm font-medium leading-none text-slate-600">
                                    Email
                                </label>
                                <Input id="email" placeholder="name@school.edu" className="bg-white/50 border-slate-200 focus:ring-indigo-500" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="password" className="text-sm font-medium leading-none text-slate-600">
                                    Password
                                </label>
                                <Input id="password" type="password" placeholder="••••••••" className="bg-white/50 border-slate-200 focus:ring-indigo-500" />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50">Cancel</Button>
                    <Button onClick={handleLogin} className="bg-indigo-500 hover:bg-indigo-600 text-white">Login</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
