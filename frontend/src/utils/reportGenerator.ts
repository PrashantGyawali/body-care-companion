// Health Report PDF Generator using jsPDF
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import {
    getStats,
    getBadges,
    getSessions,
    getWeeklyActivity,
    getPainProgressionData,
    getPainImprovementStats,
    formatTime,
    UserStats,
    Badge,
    ExerciseSession,
} from './progressStore';

// Colors matching app theme
const COLORS = {
    primary: [99, 102, 241] as [number, number, number],      // Indigo-500
    secondary: [139, 92, 246] as [number, number, number],    // Violet-500
    success: [34, 197, 94] as [number, number, number],       // Green-500
    warning: [249, 115, 22] as [number, number, number],      // Orange-500
    text: [15, 23, 42] as [number, number, number],           // Slate-900
    textMuted: [100, 116, 139] as [number, number, number],   // Slate-500
    background: [248, 250, 252] as [number, number, number],  // Slate-50
};

// Helper to draw rounded rectangles
const drawRoundedRect = (
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: [number, number, number]
) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, width, height, radius, radius, 'F');
};

// Generate the PDF report
export const generateHealthReport = async (): Promise<void> => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Fetch all data
    const stats = getStats();
    const badges = getBadges();
    const sessions = getSessions();
    const weeklyActivity = getWeeklyActivity();
    const painData = getPainProgressionData();
    const painStats = getPainImprovementStats();
    const unlockedBadges = badges.filter(b => b.unlockedAt);

    // ============ PAGE 1: Header & Overview ============

    // Header background
    drawRoundedRect(doc, 0, 0, pageWidth, 50, 0, COLORS.primary);

    // Logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('PhysioAI', margin, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Personal Health & Exercise Report', margin, 35);

    // Date
    doc.setFontSize(10);
    doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth - margin - 35, 25);

    yPos = 60;

    // Summary Cards Section
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Progress Summary', margin, yPos);
    yPos += 10;

    // Stats cards
    const cardWidth = (pageWidth - margin * 2 - 15) / 4;
    const cardHeight = 30;
    const statsData = [
        { label: 'Total Sessions', value: stats.totalSessions.toString() },
        { label: 'Total Reps', value: stats.totalReps.toString() },
        { label: 'Total Time', value: formatTime(stats.totalTime) },
        { label: 'Current Streak', value: `${stats.currentStreak} days` },
    ];

    statsData.forEach((stat, i) => {
        const x = margin + i * (cardWidth + 5);
        drawRoundedRect(doc, x, yPos, cardWidth, cardHeight, 3, COLORS.background);

        doc.setTextColor(...COLORS.text);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, x + 5, yPos + 18);

        doc.setTextColor(...COLORS.textMuted);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label, x + 5, yPos + 25);

        doc.setTextColor(...COLORS.text);
    });

    yPos += cardHeight + 15;

    // Weekly Activity Chart (Simple bar representation)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Weekly Activity', margin, yPos);
    yPos += 8;

    const chartHeight = 35;
    const barWidth = (pageWidth - margin * 2) / 7 - 4;
    const maxSessions = Math.max(...weeklyActivity.map(d => d.sessions), 1);

    weeklyActivity.forEach((day, i) => {
        const x = margin + i * (barWidth + 4);
        const barHeight = (day.sessions / maxSessions) * (chartHeight - 10) || 2;

        // Bar
        drawRoundedRect(
            doc,
            x,
            yPos + chartHeight - barHeight - 5,
            barWidth,
            barHeight,
            2,
            day.sessions > 0 ? COLORS.primary : COLORS.background
        );

        // Day label
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.textMuted);
        doc.text(day.day, x + barWidth / 2 - 4, yPos + chartHeight);

        // Value on top
        if (day.sessions > 0) {
            doc.setTextColor(...COLORS.text);
            doc.text(day.sessions.toString(), x + barWidth / 2 - 2, yPos + chartHeight - barHeight - 8);
        }
    });

    yPos += chartHeight + 15;

    // Pain Improvement Section (if data exists)
    if (painStats.totalRecords > 0) {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Pain Improvement', margin, yPos);
        yPos += 10;

        // Improvement card
        const improvementColor = painStats.overallImprovement > 0 ? COLORS.success : COLORS.warning;
        drawRoundedRect(doc, margin, yPos, pageWidth - margin * 2, 25, 3, [...improvementColor.map(c => Math.min(255, c + 180)) as [number, number, number]]);

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...improvementColor);
        doc.text(`${Math.abs(painStats.overallImprovement)}%`, margin + 10, yPos + 16);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textMuted);
        doc.text('Overall Pain Reduction', margin + 45, yPos + 14);
        doc.text(`Before: ${painStats.averageBeforePain}/10  |  After: ${painStats.averageAfterPain}/10`, margin + 45, yPos + 20);

        yPos += 35;
    }

    // Achievements Section
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Achievements Earned (${unlockedBadges.length}/${badges.length})`, margin, yPos);
    yPos += 8;

    if (unlockedBadges.length > 0) {
        unlockedBadges.forEach((badge, i) => {
            if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = margin;
            }

            // Render badge without emoji - just the name
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}. ${badge.name}`, margin + 5, yPos + 5);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.textMuted);
            doc.text(`Earned: ${badge.unlockedAt ? format(new Date(badge.unlockedAt), 'MMM d, yyyy') : 'N/A'}`, margin + 50, yPos + 5);
            doc.setTextColor(...COLORS.text);
            yPos += 8;
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.textMuted);
        doc.text('Complete exercises to earn achievements!', margin, yPos + 5);
        yPos += 10;
    }

    yPos += 10;

    // ============ PAGE 2: Recent Sessions ============
    if (sessions.length > 0) {
        doc.addPage();
        yPos = margin;

        doc.setTextColor(...COLORS.text);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Exercise Sessions', margin, yPos);
        yPos += 10;

        // Table header
        doc.setFillColor(...COLORS.primary);
        doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', margin + 3, yPos + 5.5);
        doc.text('Exercise', margin + 35, yPos + 5.5);
        doc.text('Reps', margin + 100, yPos + 5.5);
        doc.text('Duration', margin + 120, yPos + 5.5);
        doc.text('Form Score', margin + 145, yPos + 5.5);
        yPos += 8;

        // Table rows
        const recentSessions = sessions.slice(-15).reverse();
        recentSessions.forEach((session, i) => {
            if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = margin;
            }

            const bgColor = i % 2 === 0 ? COLORS.background : [255, 255, 255] as [number, number, number];
            doc.setFillColor(...bgColor);
            doc.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');

            doc.setTextColor(...COLORS.text);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');

            doc.text(format(new Date(session.date), 'MMM d, HH:mm'), margin + 3, yPos + 5);
            doc.text(session.exerciseName.substring(0, 25), margin + 35, yPos + 5);
            doc.text(session.reps.toString(), margin + 100, yPos + 5);
            doc.text(formatTime(session.duration), margin + 120, yPos + 5);

            // Color-coded form score
            const scoreColor = session.formScore >= 80 ? COLORS.success :
                session.formScore >= 50 ? COLORS.warning : [239, 68, 68] as [number, number, number];
            doc.setTextColor(...scoreColor);
            doc.text(`${session.formScore}%`, margin + 145, yPos + 5);

            yPos += 7;
        });
    }

    // ============ Final Page: Recommendations ============
    doc.addPage();
    yPos = margin;

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Personalized Recommendations', margin, yPos);
    yPos += 12;

    const recommendations = generateRecommendations(stats, painStats, sessions);

    recommendations.forEach((rec, i) => {
        if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = margin;
        }

        drawRoundedRect(doc, margin, yPos, pageWidth - margin * 2, 18, 3, COLORS.background);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text(rec.title, margin + 5, yPos + 8);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textMuted);
        doc.text(rec.description, margin + 5, yPos + 14);

        yPos += 22;
    });

    // Footer
    yPos = pageHeight - 20;
    doc.setDrawColor(...COLORS.textMuted);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Generated by PhysioAI - Your Personal Physical Therapy Assistant', margin, yPos);
    doc.text(`Report Date: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth - margin - 45, yPos);
    yPos += 4;
    doc.text('Note: This report is for informational purposes only. Consult a healthcare professional for medical advice.', margin, yPos);

    // Save the PDF
    doc.save(`physioai-health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// Generate personalized recommendations based on user data
const generateRecommendations = (
    stats: UserStats,
    painStats: ReturnType<typeof getPainImprovementStats>,
    sessions: ExerciseSession[]
): { emoji: string; title: string; description: string }[] => {
    const recommendations: { emoji: string; title: string; description: string }[] = [];

    // Streak-based
    if (stats.currentStreak === 0) {
        recommendations.push({
            emoji: '*',
            title: 'Start a New Streak',
            description: 'Complete an exercise today to begin your journey to better health!'
        });
    } else if (stats.currentStreak < 3) {
        recommendations.push({
            emoji: '+',
            title: 'Build Your Streak',
            description: `${3 - stats.currentStreak} more day(s) to reach a 3-day streak! Keep it up!`
        });
    } else if (stats.currentStreak >= 7) {
        recommendations.push({
            emoji: '!',
            title: 'Amazing Consistency!',
            description: `Your ${stats.currentStreak}-day streak shows incredible dedication. You're building lasting habits!`
        });
    }

    // Session-based
    if (stats.totalSessions < 5) {
        recommendations.push({
            emoji: '+',
            title: 'Keep Exercising',
            description: 'Try to complete at least 5 sessions to see meaningful improvements in your condition.'
        });
    }

    // Form score-based
    const avgFormScore = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.formScore, 0) / sessions.length
        : 0;

    if (avgFormScore > 0 && avgFormScore < 60) {
        recommendations.push({
            emoji: '~',
            title: 'Focus on Form',
            description: 'Take your time with each exercise. Good form prevents injury and improves results.'
        });
    } else if (avgFormScore >= 80) {
        recommendations.push({
            emoji: '*',
            title: 'Excellent Form!',
            description: 'Your form is great! Consider increasing reps or trying more challenging exercises.'
        });
    }

    // Pain-based
    if (painStats.overallImprovement > 20) {
        recommendations.push({
            emoji: 'v',
            title: 'Great Progress!',
            description: `Your pain has reduced by ${painStats.overallImprovement}%! Keep up the consistent practice.`
        });
    } else if (painStats.totalRecords > 0 && painStats.overallImprovement <= 0) {
        recommendations.push({
            emoji: 'o',
            title: 'Adjust Your Approach',
            description: 'Pain not improving? Try different exercises or consult a physiotherapist.'
        });
    }

    // Time-based
    if (stats.totalTime < 300) { // Less than 5 minutes total
        recommendations.push({
            emoji: '@',
            title: 'Increase Session Duration',
            description: 'Aim for at least 5-10 minute sessions for better therapeutic effect.'
        });
    }

    // Default recommendation
    if (recommendations.length < 3) {
        recommendations.push({
            emoji: '+',
            title: 'Stay Consistent',
            description: 'Regular exercise, even short sessions, leads to the best long-term results.'
        });
    }

    return recommendations.slice(0, 5); // Max 5 recommendations
};

export default { generateHealthReport };
