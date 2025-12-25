import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import { UserStats, Badge } from '@/utils/progressStore';
import { Download, Share2, X, Sparkles, Flame, Dumbbell, Clock, Trophy } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: UserStats;
    badges: Badge[];
    recentBadge?: Badge;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    stats,
    badges,
    recentBadge,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [cardType, setCardType] = useState<'stats' | 'badge' | 'streak'>('stats');

    if (!isOpen) return null;

    const unlockedBadges = badges.filter(b => b.unlockedAt);

    const generateImage = async (): Promise<string | null> => {
        if (!cardRef.current) return null;

        setIsGenerating(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#1a1a2e',
            });
            return dataUrl;
        } catch (error) {
            console.error('Failed to generate image:', error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        const dataUrl = await generateImage();
        if (!dataUrl) return;

        const link = document.createElement('a');
        link.download = `physioai-${cardType}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    };

    const handleShare = async () => {
        const dataUrl = await generateImage();
        if (!dataUrl) return;

        try {
            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'physioai-achievement.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My PhysioAI Progress',
                    text: 'Check out my exercise progress on PhysioAI! 💪',
                });
            } else {
                // Fallback to download
                handleDownload();
            }
        } catch (error) {
            console.error('Share failed:', error);
            handleDownload();
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        if (mins >= 60) {
            const hours = Math.floor(mins / 60);
            return `${hours}h ${mins % 60}m`;
        }
        return `${mins}m`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-display font-bold text-lg text-foreground">
                        Share Your Progress
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Card Type Selector */}
                <div className="flex gap-2 p-4 bg-secondary/50">
                    {[
                        { id: 'stats', label: 'Stats', icon: Dumbbell },
                        { id: 'streak', label: 'Streak', icon: Flame },
                        { id: 'badge', label: 'Badges', icon: Trophy },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setCardType(id as typeof cardType)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all ${cardType === id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-card hover:bg-card/80 text-muted-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Card Preview */}
                <div className="p-6 flex justify-center">
                    <div
                        ref={cardRef}
                        className="w-80 rounded-2xl overflow-hidden shadow-2xl"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                        {/* Card Background */}
                        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 relative">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                            {/* Logo */}
                            <div className="relative flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-white text-lg">PhysioAI</span>
                            </div>

                            {/* Content based on card type */}
                            <div className="relative">
                                {cardType === 'stats' && (
                                    <>
                                        <h3 className="text-white/80 text-sm mb-2">My Progress</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                                <Dumbbell className="w-5 h-5 text-white/70 mb-2" />
                                                <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                                                <p className="text-xs text-white/70">Exercises</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                                <Clock className="w-5 h-5 text-white/70 mb-2" />
                                                <p className="text-2xl font-bold text-white">{formatTime(stats.totalTime)}</p>
                                                <p className="text-xs text-white/70">Total Time</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                                <Flame className="w-5 h-5 text-orange-300 mb-2" />
                                                <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                                                <p className="text-xs text-white/70">Day Streak</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                                <Trophy className="w-5 h-5 text-yellow-300 mb-2" />
                                                <p className="text-2xl font-bold text-white">{unlockedBadges.length}</p>
                                                <p className="text-xs text-white/70">Badges</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {cardType === 'streak' && (
                                    <div className="text-center py-4">
                                        <div className="text-6xl mb-4">🔥</div>
                                        <p className="text-6xl font-bold text-white mb-2">{stats.currentStreak}</p>
                                        <p className="text-xl text-white/80">Day Streak!</p>
                                        <p className="text-sm text-white/60 mt-2">
                                            Best: {stats.longestStreak} days
                                        </p>
                                    </div>
                                )}

                                {cardType === 'badge' && (
                                    <div className="text-center py-4">
                                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                                            {unlockedBadges.slice(0, 6).map(badge => (
                                                <div key={badge.id} className="text-3xl">
                                                    {badge.icon}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-3xl font-bold text-white">
                                            {unlockedBadges.length}/{badges.length}
                                        </p>
                                        <p className="text-white/80">Badges Unlocked</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="relative mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                                <p className="text-xs text-white/60">physioai.app</p>
                                <p className="text-xs text-white/60">
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleDownload}
                        disabled={isGenerating}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Download'}
                    </Button>
                    <Button
                        variant="hero"
                        className="flex-1"
                        onClick={handleShare}
                        disabled={isGenerating}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
