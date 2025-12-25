import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatTime, Achievement, Badge, getBadges, getStats } from '@/utils/progressStore';
import { ShareModal } from '@/components/ShareModal';
import {
    Trophy,
    Clock,
    Dumbbell,
    Target,
    ArrowRight,
    Home,
    TrendingUp,
    Sparkles,
    Star,
    Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SessionSummaryProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: {
        exerciseName: string;
        reps: number;
        duration: number;
        formScore: number;
        targetArea: string;
        exerciseType?: 'REPS' | 'DURATION'; // Added to distinguish display
    };
    newAchievements: Achievement[];
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
    isOpen,
    onClose,
    sessionData,
    newAchievements,
}) => {
    const navigate = useNavigate();
    const hasPlayedConfetti = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        if (isOpen && !hasPlayedConfetti.current) {
            hasPlayedConfetti.current = true;

            // Play confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();

            // Play completion sound
            playCompletionSound();
        }

        // Reset when closing
        if (!isOpen) {
            hasPlayedConfetti.current = false;
        }
    }, [isOpen]);

    const playCompletionSound = () => {
        try {
            // Create audio context for a pleasant completion sound
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create a pleasant chord
            const playNote = (frequency: number, delay: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.1);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + 0.5);

                oscillator.start(audioContext.currentTime + delay);
                oscillator.stop(audioContext.currentTime + delay + 0.6);
            };

            // Play a pleasant ascending chord (C major arpeggio)
            playNote(523.25, 0);    // C5
            playNote(659.25, 0.1);  // E5
            playNote(783.99, 0.2);  // G5
            playNote(1046.50, 0.3); // C6
        } catch (e) {
            console.log('Audio not supported');
        }
    };

    if (!isOpen) return null;

    const badges = getBadges();
    const newBadges = newAchievements.map(a => badges.find(b => b.id === a.badgeId)).filter(Boolean) as Badge[];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent!';
        if (score >= 80) return 'Great Job!';
        if (score >= 60) return 'Good Effort!';
        if (score >= 40) return 'Keep Practicing!';
        return 'Try Again!';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-foreground/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card w-full max-w-lg rounded-3xl shadow-card overflow-hidden animate-scale-in border border-border">
                {/* Header */}
                <div className="gradient-primary px-6 py-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoMnY0aC0yem0tNiAwaC0ydi00aDJ2NHptMC02di00aDJ2NGgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                    <div className="relative">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 animate-bounce-soft">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-white mb-2">
                            Exercise Complete!
                        </h2>
                        <p className="text-white/80">
                            {sessionData.exerciseName}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-secondary rounded-xl">
                            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{formatTime(sessionData.duration)}</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded-xl">
                            <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                            <p className={`text-2xl font-bold ${getScoreColor(sessionData.formScore)}`}>
                                {sessionData.formScore}%
                            </p>
                            <p className="text-xs text-muted-foreground">Form Score</p>
                        </div>
                    </div>

                    {/* Score Assessment */}
                    <div className="text-center mb-6 py-3 bg-primary/5 rounded-xl border border-primary/20">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className={`font-semibold ${getScoreColor(sessionData.formScore)}`}>
                                {getScoreLabel(sessionData.formScore)}
                            </span>
                        </div>
                    </div>

                    {/* New Badges */}
                    {newBadges.length > 0 && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-foreground">New Achievements!</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {newBadges.map(badge => (
                                    <div
                                        key={badge.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-black/20 rounded-lg"
                                    >
                                        <span className="text-xl">{badge.icon}</span>
                                        <span className="text-sm font-medium text-foreground">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-2 border-muted-foreground/30 text-foreground hover:border-muted-foreground/50"
                            onClick={() => navigate('/')}
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-2 border-muted-foreground/30 text-foreground hover:border-muted-foreground/50"
                            onClick={() => setShowShareModal(true)}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button
                            variant="hero"
                            className="flex-1"
                            onClick={() => navigate('/dashboard')}
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Progress
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                stats={getStats()}
                badges={getBadges()}
            />
        </div>
    );
};

export default SessionSummary;
