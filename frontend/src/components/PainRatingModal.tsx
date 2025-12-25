import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { savePainRecord } from '@/utils/progressStore';
import { cn } from '@/lib/utils';

interface PainRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (painLevel: number) => void;
    timing: 'before' | 'after';
    bodyPart: string;
    sessionId?: string;
}

const PAIN_LEVELS = [
    { level: 1, emoji: '😊', label: 'No Pain', color: 'bg-green-500' },
    { level: 2, emoji: '🙂', label: 'Minimal', color: 'bg-green-400' },
    { level: 3, emoji: '😐', label: 'Mild', color: 'bg-lime-400' },
    { level: 4, emoji: '😕', label: 'Uncomfortable', color: 'bg-yellow-400' },
    { level: 5, emoji: '😟', label: 'Moderate', color: 'bg-yellow-500' },
    { level: 6, emoji: '😣', label: 'Distracting', color: 'bg-orange-400' },
    { level: 7, emoji: '😖', label: 'Distressing', color: 'bg-orange-500' },
    { level: 8, emoji: '😫', label: 'Intense', color: 'bg-red-400' },
    { level: 9, emoji: '😩', label: 'Severe', color: 'bg-red-500' },
    { level: 10, emoji: '😭', label: 'Worst', color: 'bg-red-600' },
];

export const PainRatingModal: React.FC<PainRatingModalProps> = ({
    isOpen,
    onClose,
    onComplete,
    timing,
    bodyPart,
    sessionId,
}) => {
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedLevel === null) return;

        setIsSubmitting(true);

        // Save the pain record
        savePainRecord({
            sessionId: sessionId || null,
            painLevel: selectedLevel,
            bodyPart,
            timing,
            notes: notes.trim() || undefined,
        });

        setIsSubmitting(false);
        onComplete(selectedLevel);
    };

    const handleSkip = () => {
        onComplete(0); // 0 indicates skipped
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-border">
                {/* Header */}
                <div className={cn(
                    "px-6 py-6 text-center",
                    timing === 'before'
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                )}>
                    <h2 className="font-display text-xl font-bold text-white mb-1">
                        {timing === 'before' ? 'Before We Start' : 'How Do You Feel Now?'}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {timing === 'before'
                            ? `Rate your current ${bodyPart} pain level`
                            : `Has your ${bodyPart} pain improved?`
                        }
                    </p>
                </div>

                {/* Pain Scale */}
                <div className="p-6">
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {PAIN_LEVELS.map(({ level, emoji, label, color }) => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level)}
                                className={cn(
                                    "flex flex-col items-center p-3 rounded-xl transition-all duration-200",
                                    "hover:scale-105 active:scale-95",
                                    selectedLevel === level
                                        ? `${color} text-white shadow-lg ring-2 ring-offset-2 ring-primary`
                                        : "bg-secondary hover:bg-secondary/80"
                                )}
                            >
                                <span className="text-2xl mb-1">{emoji}</span>
                                <span className="text-xs font-bold">{level}</span>
                            </button>
                        ))}
                    </div>

                    {/* Selected Level Label */}
                    {selectedLevel !== null && (
                        <div className="text-center mb-4 animate-fade-in">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                                <span className="text-lg">
                                    {PAIN_LEVELS.find(p => p.level === selectedLevel)?.emoji}
                                </span>
                                <span className="font-medium text-foreground">
                                    {selectedLevel}/10 - {PAIN_LEVELS.find(p => p.level === selectedLevel)?.label}
                                </span>
                            </span>
                        </div>
                    )}

                    {/* Notes (optional) */}
                    <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-2 block">
                            Additional notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe what you're feeling..."
                            className="w-full p-3 bg-secondary rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={2}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-2 border-muted-foreground/30 text-foreground hover:border-muted-foreground/50"
                            onClick={handleSkip}
                        >
                            Skip
                        </Button>
                        <Button
                            variant="hero"
                            className="flex-1"
                            onClick={handleSubmit}
                            disabled={selectedLevel === null || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PainRatingModal;
