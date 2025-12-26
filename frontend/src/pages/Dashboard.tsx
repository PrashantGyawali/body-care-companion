import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BadgeGallery } from '@/components/dashboard/BadgeGallery';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { PainProgressionChart } from '@/components/dashboard/PainProgressionChart';
import { ShareModal } from '@/components/ShareModal';
import { generateHealthReport } from '@/utils/reportGenerator';
import {
    getStats,
    getBadges,
    getWeeklyActivity,
    getRecentSessions,
    getPainProgressionData,
    formatTime,
    ExerciseSession,
    UserStats,
    Badge,
} from '@/utils/progressStore';
import {
    ArrowLeft,
    Activity,
    Flame,
    Clock,
    Dumbbell,
    Target,
    Trophy,
    Calendar,
    TrendingUp,
    Share2,
    FileText,
    Download,
    Lock,
} from 'lucide-react';
import axios from 'axios';
import api from '@/lib/axios';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [weeklyData, setWeeklyData] = useState<{ day: string; sessions: number; reps: number }[]>([]);
    const [recentSessions, setRecentSessions] = useState<ExerciseSession[]>([]);
    const [painData, setPainData] = useState<{ date: string; before: number | null; after: number | null; improvement: number }[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [gettingPro, setGettingPro] = useState(false);

    useEffect(() => {
        // Load all data
        setStats(getStats());
        setBadges(getBadges());
        setWeeklyData(getWeeklyActivity());
        setRecentSessions(getRecentSessions(5));
        setPainData(getPainProgressionData());
    }, []);
    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            await generateHealthReport();
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const getPro = async () => {
        setGettingPro(true);
        try {
            await api.post('/auth/subscribe/pro')
        } catch (error) {
            console.error('Failed to get Pro subscription:', error);
        } finally {
            setGettingPro(false);
        }
    }

    if (!stats) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center">
                <div className="animate-pulse text-primary">Loading...</div>
            </div>
        );
    }

    const unlockedBadgesCount = badges.filter(b => b.unlockedAt).length;
    const isPro = user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'enterprise';

    return (
        <div className="min-h-screen gradient-hero relative">
            {!isPro && (
                <div className="absolute inset-0 z-50 backdrop-blur-sm bg-background/50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-2xl p-8 text-center space-y-6 animate-scale-in">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Detailed Progress Locked</h2>
                            <p className="text-muted-foreground">
                                Upgrade to Pro to view detailed analytics, charts, and track your complete history.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button size="lg" className="w-full bg-primary hover:bg-primary/90" asChild>
                                <button onClick={getPro}>Upgrade to Pro</button>
                            </Button>
                            <Button variant="ghost" asChild>
                                <Link to="/">Return Home</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className={!isPro ? "filter blur-md pointer-events-none select-none overflow-hidden h-screen" : ""}>
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                                <TrendingUp className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-display font-bold text-xl text-foreground">Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowShareModal(true)}
                                className="hidden sm:flex"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateReport}
                                disabled={isGeneratingReport}
                                className="hidden sm:flex"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                {isGeneratingReport ? 'Generating...' : 'Export PDF'}
                            </Button>
                        </div>
                    </div>
                </nav>

                <main className="pt-24 pb-12 container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8 animate-slide-up">
                        <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                            Your Progress Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Track your journey to better health
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatsCard
                            title="Total Sessions"
                            value={stats.totalSessions}
                            icon={<Activity className="w-6 h-6 text-primary-foreground" />}
                            subtitle="exercises completed"
                        />
                        <StatsCard
                            title="Current Streak"
                            value={`${stats.currentStreak} days`}
                            icon={<Flame className="w-6 h-6 text-primary-foreground" />}
                            subtitle={`Best: ${stats.longestStreak} days`}
                            className={stats.currentStreak >= 3 ? "ring-2 ring-orange-500/50" : ""}
                        />
                        <StatsCard
                            title="Total Reps"
                            value={stats.totalReps}
                            icon={<Dumbbell className="w-6 h-6 text-primary-foreground" />}
                            subtitle="repetitions"
                        />
                        <StatsCard
                            title="Total Time"
                            value={formatTime(stats.totalTime)}
                            icon={<Clock className="w-6 h-6 text-primary-foreground" />}
                            subtitle="spent exercising"
                        />
                    </div>

                    {/* Charts and Badges Row */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        {/* Weekly Chart */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <WeeklyChart data={weeklyData} />
                        </div>

                        {/* Achievements Section */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <BadgeGallery badges={badges} />
                        </div>
                    </div>

                    {/* Pain Progression */}
                    <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                        <PainProgressionChart data={painData} />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display font-semibold text-lg text-foreground">
                                Recent Activity
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Last 5 sessions</span>
                            </div>
                        </div>

                        {recentSessions.length === 0 ? (
                            <div className="text-center py-12">
                                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">No exercises completed yet</p>
                                <Button variant="hero" onClick={() => navigate('/')}>
                                    Start Your First Exercise
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentSessions.map((session, index) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Dumbbell className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{session.exerciseName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(session.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="font-semibold text-foreground">{session.reps}</p>
                                                <p className="text-muted-foreground">reps</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-foreground">{formatTime(session.duration)}</p>
                                                <p className="text-muted-foreground">time</p>
                                            </div>
                                            <div className="text-center">
                                                <p className={`font-semibold ${session.formScore >= 80 ? 'text-green-500' :
                                                    session.formScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {session.formScore}%
                                                </p>
                                                <p className="text-muted-foreground">form</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Motivational Footer */}
                    {stats.totalSessions > 0 && (
                        <div className="mt-8 text-center animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
                                <Trophy className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium text-primary">
                                    {unlockedBadgesCount === badges.length
                                        ? "🎉 You've unlocked all badges! You're a legend!"
                                        : `${badges.length - unlockedBadgesCount} more badges to unlock. Keep going!`}
                                </span>
                            </div>
                        </div>
                    )}
                </main>

                {/* Share Modal */}
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    stats={stats}
                    badges={badges}
                />
            </div>
        </div>
    );
};

export default Dashboard;
