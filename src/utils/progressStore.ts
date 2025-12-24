// Progress Store - localStorage-based data persistence for exercise tracking

export interface ExerciseSession {
    id: string;
    date: string; // ISO date string
    exerciseId: string;
    exerciseName: string;
    reps: number;
    duration: number; // seconds
    formScore: number; // 0-100
    targetArea: string;
}

export interface UserStats {
    totalSessions: number;
    totalReps: number;
    totalTime: number; // seconds
    currentStreak: number;
    longestStreak: number;
    lastExerciseDate: string | null;
    perfectScores: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: string;
    unlockedAt: string | null;
}

export interface Achievement {
    id: string;
    badgeId: string;
    unlockedAt: string;
    message: string;
}

// Pain tracking for progress monitoring
export interface PainRecord {
    id: string;
    date: string;
    sessionId: string | null;
    painLevel: number; // 1-10
    bodyPart: string;
    timing: 'before' | 'after';
    notes?: string;
}

// Badge definitions
export const BADGES: Badge[] = [
    { id: 'first-steps', name: 'First Steps', description: 'Complete your first exercise', icon: '🎯', requirement: '1 session', unlockedAt: null },
    { id: 'on-fire', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', requirement: '3-day streak', unlockedAt: null },
    { id: 'dedicated', name: 'Dedicated', description: 'Maintain a 7-day streak', icon: '💪', requirement: '7-day streak', unlockedAt: null },
    { id: 'champion', name: 'Champion', description: 'Complete 10 exercises', icon: '🏆', requirement: '10 sessions', unlockedAt: null },
    { id: 'perfect-form', name: 'Perfect Form', description: 'Get a 100% form score', icon: '⭐', requirement: '100% score', unlockedAt: null },
    { id: 'superstar', name: 'Superstar', description: 'Complete 25 exercises', icon: '🌟', requirement: '25 sessions', unlockedAt: null },
    { id: 'diamond', name: 'Diamond', description: 'Maintain a 14-day streak', icon: '💎', requirement: '14-day streak', unlockedAt: null },
    { id: 'master', name: 'Master', description: 'Complete 50 exercises', icon: '🎪', requirement: '50 sessions', unlockedAt: null },
    { id: 'gold-form', name: 'Gold Form', description: 'Get 5 perfect form scores', icon: '🏅', requirement: '5 perfect scores', unlockedAt: null },
    { id: 'legend', name: 'Legend', description: 'Maintain a 30-day streak', icon: '👑', requirement: '30-day streak', unlockedAt: null },
];

const STORAGE_KEYS = {
    sessions: 'physio_sessions',
    stats: 'physio_stats',
    badges: 'physio_badges',
    achievements: 'physio_achievements',
    painRecords: 'physio_pain_records',
};

// Initialize default stats
const getDefaultStats = (): UserStats => ({
    totalSessions: 0,
    totalReps: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastExerciseDate: null,
    perfectScores: 0,
});

// Get sessions from localStorage
export const getSessions = (): ExerciseSession[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.sessions);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Get user stats
export const getStats = (): UserStats => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.stats);
        return data ? JSON.parse(data) : getDefaultStats();
    } catch {
        return getDefaultStats();
    }
};

// Get badges with unlock status
export const getBadges = (): Badge[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.badges);
        if (data) {
            return JSON.parse(data);
        }
        // Initialize badges
        localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(BADGES));
        return BADGES;
    } catch {
        return BADGES;
    }
};

// Get achievements history
export const getAchievements = (): Achievement[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.achievements);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Check if two dates are consecutive days
const isConsecutiveDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};

// Check if date is today
const isToday = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

// Save a new session and update stats
export const saveSession = (session: Omit<ExerciseSession, 'id' | 'date'>): Achievement[] => {
    const sessions = getSessions();
    const stats = getStats();
    const badges = getBadges();
    const achievements = getAchievements();
    const newAchievements: Achievement[] = [];

    // Create new session
    const newSession: ExerciseSession = {
        ...session,
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
    };

    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));

    // Update stats
    stats.totalSessions += 1;
    stats.totalReps += session.reps;
    stats.totalTime += session.duration;

    if (session.formScore === 100) {
        stats.perfectScores += 1;
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastExerciseDate) {
        if (isToday(stats.lastExerciseDate)) {
            // Already exercised today, no streak change
        } else if (isConsecutiveDay(stats.lastExerciseDate, today)) {
            stats.currentStreak += 1;
        } else {
            stats.currentStreak = 1; // Reset streak
        }
    } else {
        stats.currentStreak = 1;
    }

    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastExerciseDate = today;

    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));

    // Check for badge unlocks
    const checkBadges: { id: string; condition: boolean }[] = [
        { id: 'first-steps', condition: stats.totalSessions >= 1 },
        { id: 'on-fire', condition: stats.currentStreak >= 3 },
        { id: 'dedicated', condition: stats.currentStreak >= 7 },
        { id: 'champion', condition: stats.totalSessions >= 10 },
        { id: 'perfect-form', condition: session.formScore === 100 },
        { id: 'superstar', condition: stats.totalSessions >= 25 },
        { id: 'diamond', condition: stats.currentStreak >= 14 },
        { id: 'master', condition: stats.totalSessions >= 50 },
        { id: 'gold-form', condition: stats.perfectScores >= 5 },
        { id: 'legend', condition: stats.currentStreak >= 30 },
    ];

    checkBadges.forEach(({ id, condition }) => {
        const badge = badges.find(b => b.id === id);
        if (badge && !badge.unlockedAt && condition) {
            badge.unlockedAt = new Date().toISOString();

            const achievement: Achievement = {
                id: `achievement_${Date.now()}_${id}`,
                badgeId: id,
                unlockedAt: new Date().toISOString(),
                message: `🎉 New Badge: ${badge.name}!`,
            };

            achievements.push(achievement);
            newAchievements.push(achievement);
        }
    });

    localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(badges));
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));

    return newAchievements;
};

// Get weekly activity data for charts
export const getWeeklyActivity = (): { day: string; sessions: number; reps: number }[] => {
    const sessions = getSessions();
    const today = new Date();
    const weekData: { day: string; sessions: number; reps: number }[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const daySessions = sessions.filter(s => s.date.split('T')[0] === dateStr);

        weekData.push({
            day: dayName,
            sessions: daySessions.length,
            reps: daySessions.reduce((sum, s) => sum + s.reps, 0),
        });
    }

    return weekData;
};

// Get recent sessions
export const getRecentSessions = (limit: number = 5): ExerciseSession[] => {
    const sessions = getSessions();
    return sessions.slice(-limit).reverse();
};

// Format time in minutes:seconds
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
        return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
};

// ============ Pain Tracking Functions ============

// Get all pain records
export const getPainRecords = (): PainRecord[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.painRecords);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Save a new pain record
export const savePainRecord = (record: Omit<PainRecord, 'id' | 'date'>): PainRecord => {
    const records = getPainRecords();

    const newRecord: PainRecord = {
        ...record,
        id: `pain_${Date.now()}`,
        date: new Date().toISOString(),
    };

    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.painRecords, JSON.stringify(records));

    return newRecord;
};

// Get pain progression data for charts (last 7 days)
export const getPainProgressionData = (bodyPart?: string): {
    date: string;
    before: number | null;
    after: number | null;
    improvement: number;
}[] => {
    const records = getPainRecords();
    const today = new Date();
    const progressData: { date: string; before: number | null; after: number | null; improvement: number }[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const dayRecords = records.filter(r => {
            const recordDate = r.date.split('T')[0];
            const matchesDate = recordDate === dateStr;
            const matchesBodyPart = !bodyPart || r.bodyPart.toLowerCase() === bodyPart.toLowerCase();
            return matchesDate && matchesBodyPart;
        });

        const beforeRecords = dayRecords.filter(r => r.timing === 'before');
        const afterRecords = dayRecords.filter(r => r.timing === 'after');

        const avgBefore = beforeRecords.length > 0
            ? beforeRecords.reduce((sum, r) => sum + r.painLevel, 0) / beforeRecords.length
            : null;
        const avgAfter = afterRecords.length > 0
            ? afterRecords.reduce((sum, r) => sum + r.painLevel, 0) / afterRecords.length
            : null;

        const improvement = (avgBefore !== null && avgAfter !== null)
            ? Math.round(((avgBefore - avgAfter) / avgBefore) * 100)
            : 0;

        progressData.push({
            date: dayName,
            before: avgBefore !== null ? Math.round(avgBefore * 10) / 10 : null,
            after: avgAfter !== null ? Math.round(avgAfter * 10) / 10 : null,
            improvement,
        });
    }

    return progressData;
};

// Get average pain level by body part
export const getAveragePainByBodyPart = (): { bodyPart: string; avgPain: number; recordCount: number }[] => {
    const records = getPainRecords();
    const bodyPartMap: Record<string, { total: number; count: number }> = {};

    records.forEach(record => {
        const part = record.bodyPart.toLowerCase();
        if (!bodyPartMap[part]) {
            bodyPartMap[part] = { total: 0, count: 0 };
        }
        bodyPartMap[part].total += record.painLevel;
        bodyPartMap[part].count += 1;
    });

    return Object.entries(bodyPartMap).map(([bodyPart, data]) => ({
        bodyPart: bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1),
        avgPain: Math.round((data.total / data.count) * 10) / 10,
        recordCount: data.count,
    }));
};

// Get pain improvement percentage (comparing first week to latest)
export const getPainImprovementStats = (): {
    overallImprovement: number;
    averageBeforePain: number;
    averageAfterPain: number;
    totalRecords: number;
} => {
    const records = getPainRecords();

    const beforeRecords = records.filter(r => r.timing === 'before');
    const afterRecords = records.filter(r => r.timing === 'after');

    const avgBefore = beforeRecords.length > 0
        ? beforeRecords.reduce((sum, r) => sum + r.painLevel, 0) / beforeRecords.length
        : 0;
    const avgAfter = afterRecords.length > 0
        ? afterRecords.reduce((sum, r) => sum + r.painLevel, 0) / afterRecords.length
        : 0;

    const improvement = avgBefore > 0
        ? Math.round(((avgBefore - avgAfter) / avgBefore) * 100)
        : 0;

    return {
        overallImprovement: improvement,
        averageBeforePain: Math.round(avgBefore * 10) / 10,
        averageAfterPain: Math.round(avgAfter * 10) / 10,
        totalRecords: records.length,
    };
};

// Clear all data (for testing)
export const clearAllData = (): void => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
