import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, UserPlus, Eye, Mail, AlertCircle, CheckCircle, HelpCircle, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDirectory = ({ students: propStudents, onAddStudent }) => {
    // Use props if available (when called from Dashboard), otherwise fall back to local state (legacy/standalone)
    const [localStudents, setLocalStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("All"); // 'All', 'High'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', grade: '', risk: 'Low' });

    // Determining which data source to use
    const students = propStudents || localStudents;

    // Only fetch if NOT receiving props
    useEffect(() => {
        if (!propStudents) {
            fetchStudents();
        } else {
            setLoading(false);
        }
    }, [propStudents]);

    // MOCK DATA FALLBACK (Same as Dashboard for consistency)
    const MOCK_STUDENTS = [
        { _id: '1', username: "Alice Johnson", grade: "10-A", risk: "Low", status: "Happy", level: 5, streak: 12, email: "alice@school.edu", avatar: "👩‍🎓" },
        { _id: '2', username: "Bob Smith", grade: "10-B", risk: "High", status: "Sad", level: 2, streak: 0, email: "bob@school.edu", avatar: "👨‍🎓" },
        { _id: '3', username: "Charlie Brown", grade: "10-A", risk: "Medium", status: "Tired", level: 3, streak: 4, email: "charlie@school.edu", avatar: "🧑‍🎓" },
        { _id: '4', username: "Diana Prince", grade: "11-C", risk: "Low", status: "Happy", level: 4, streak: 8, email: "diana@school.edu", avatar: "🦸‍♀️" },
        { _id: '5', username: "Evan Wright", grade: "10-B", risk: "High", status: "Anxious", level: 1, streak: 0, email: "evan@school.edu", avatar: "🏃‍♂️" },
        { _id: '6', username: "Fiona Gallagher", grade: "11-A", risk: "Medium", status: "Stressed", level: 2, streak: 2, email: "fiona@school.edu", avatar: "🎨" },
        { _id: '7', username: "George Martin", grade: "12-B", risk: "Low", status: "Calm", level: 3, streak: 15, email: "george@school.edu", avatar: "🦁" },
        { _id: '8', username: "Hannah Lee", grade: "10-A", risk: "Low", status: "Happy", level: 5, streak: 20, email: "hannah@school.edu", avatar: "⛸️" },
        { _id: '9', username: "Ian Curtis", grade: "12-A", risk: "High", status: "Sad", level: 1, streak: 0, email: "ian@school.edu", avatar: "🎸" },
        { _id: '10', username: "Julia Roberts", grade: "11-B", risk: "Medium", status: "Tired", level: 3, streak: 3, email: "julia@school.edu", avatar: "🎭" }
    ];

    const fetchStudents = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for demo

        // Load custom students from local storage
        const customStudents = JSON.parse(localStorage.getItem('custom_students') || '[]');

        try {
            const response = await fetch('http://localhost:5000/api/students', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            // Merge API data with custom local data
            setStudents(data.length > 0 ? [...data, ...customStudents] : [...MOCK_STUDENTS, ...customStudents]);
            setLoading(false);
        } catch (error) {
            console.warn("API Error or Timeout, using mock data:", error);
            // Merge Mock data with custom local data
            setStudents([...MOCK_STUDENTS, ...customStudents]);
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();

        const optimisticStudent = {
            _id: Date.now().toString(),
            username: newStudent.name,
            email: newStudent.email,
            grade: newStudent.grade,
            risk: newStudent.risk,
            status: 'Happy', // Default status
            level: 1,
            streak: 0,
            avatar: "👤"
        };

        // If parent handler exists, use it and close modal
        if (onAddStudent) {
            const success = onAddStudent(optimisticStudent);
            if (success) {
                setIsModalOpen(false);
                setNewStudent({ name: '', email: '', grade: '', risk: 'Low' });
            }
            return;
        }

        // Legacy / Standalone Logic (Fallback)
        try {
            const response = await fetch('http://localhost:5000/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStudent)
            });

            if (response.ok) {
                await fetchStudents(); // Refresh from server
            } else {
                throw new Error("API call failed");
            }
        } catch (error) {
            console.warn("Backend offline, adding locally:", error);

            // Save to LocalStorage for persistence
            const existingCustom = JSON.parse(localStorage.getItem('custom_students') || '[]');
            localStorage.setItem('custom_students', JSON.stringify([...existingCustom, optimisticStudent]));

            // Fallback: update local state directly so user sees it
            setLocalStudents(prev => [...prev, optimisticStudent]);
        }

        setIsModalOpen(false);
        setNewStudent({ name: '', email: '', grade: '', risk: 'Low' });
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === "High" ? student.risk === "High" : true;
        return matchesSearch && matchesRisk;
    });

    const getRiskBadge = (level) => {
        switch (level) {
            case "High":
                return (
                    <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold border border-red-100">
                        <AlertCircle size={12} className="text-red-600" />
                        High Risk
                    </span>
                );
            case "Medium":
                return (
                    <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold border border-yellow-100">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Medium
                    </span>
                );
            default: // Low or Stable
                return (
                    <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-100">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Stable
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative">
            {/* Header / Controls */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Student Directory</h2>
                    <p className="text-sm text-slate-500">Manage your class roster and monitor student wellness.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Add Student Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <UserPlus size={18} />
                        Add Student
                    </button>

                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdown Simulator */}
                    <button
                        onClick={() => setFilterRisk(filterRisk === "All" ? "High" : "All")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <Filter size={16} />
                        {filterRisk === "High" ? "Risk: High Only" : "Filter: All Risks"}
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                {loading ? (
                    <div className="p-10 text-center text-slate-500">Loading students...</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentorship</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {student.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">{student.username}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Mail size={10} /> {student.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                                Active
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRiskBadge(student.risk || 'Low')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 shadow-sm transition-all">
                                            <UserPlus size={14} />
                                            Assign Mentor
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-all" title="View Profile">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && filteredStudents.length === 0 && (
                    <div className="p-10 text-center text-slate-500">
                        <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p>No students found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Add New Student</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        placeholder="e.g. john@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Grade/Class</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            value={newStudent.grade}
                                            onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                                            placeholder="e.g. 10-A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Risk</label>
                                        <select
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            value={newStudent.risk}
                                            onChange={(e) => setNewStudent({ ...newStudent, risk: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all"
                                    >
                                        Add Student
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDirectory;
