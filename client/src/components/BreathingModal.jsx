/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BreathingModal = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState('Inhale');

    useEffect(() => {
        if (isOpen) {
            const interval = setInterval(() => {
                setPhase((prev) => (prev === 'Inhale' ? 'Exhale' : 'Inhale'));
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 flex flex-col items-center gap-8"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <h2 className="text-2xl font-bold text-slate-800">Breathe with me</h2>

                        <div className="relative flex items-center justify-center h-48 w-48">
                            <motion.div
                                animate={{
                                    scale: phase === 'Inhale' ? 1.5 : 1,
                                    opacity: phase === 'Inhale' ? 0.6 : 0.3,
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-full bg-blue-400 blur-xl"
                            />
                            <motion.div
                                animate={{
                                    scale: phase === 'Inhale' ? 1.2 : 1,
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                                className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 shadow-inner flex items-center justify-center z-10"
                            >
                                <span className="text-xl font-medium text-white tracking-widest uppercase">
                                    {phase}
                                </span>
                            </motion.div>
                        </div>

                        <p className="text-center text-slate-600">
                            Focus on the circle. Inhale as it expands, exhale as it shrinks.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BreathingModal;
