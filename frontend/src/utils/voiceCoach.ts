// AI Voice Coach - Motivational feedback system for exercise guidance

// Voice message categories
export const VOICE_MESSAGES = {
    encouragement: [
        "Great job! Keep going!",
        "You're doing amazing!",
        "Perfect! Maintain that form!",
        "Excellent work! Stay focused!",
        "That's it! You've got this!",
        "Wonderful form! Keep it up!",
        "You're crushing it!",
        "Amazing effort! Don't stop now!",
    ],

    milestones: {
        3: "Three reps complete! Great start!",
        5: "Five reps! You're warming up nicely!",
        10: "Ten reps! Halfway there, keep pushing!",
        15: "Fifteen! You're on fire!",
        20: "Twenty reps! Almost done!",
        25: "Twenty-five! Incredible endurance!",
    } as Record<number, string>,

    holdMilestones: {
        5: "Five seconds! Great start!",
        10: "Ten seconds! Feel the stretch!",
        15: "Fifteen seconds! Halfway there!",
        20: "Twenty seconds! You're doing amazing!",
        25: "Twenty-five seconds! Almost there!",
        30: "Thirty seconds! Excellent hold!",
    } as Record<number, string>,

    formCorrections: {
        adjustPosition: "Adjust your position slightly for better form",
        slowDown: "Try to slow down a bit for better control",
        breathe: "Remember to breathe steadily",
        relax: "Relax your shoulders and neck",
        goodForm: "Perfect form! Keep it up!",
    },

    completion: [
        "Exercise complete! Great workout!",
        "Excellent session! You did amazing!",
        "Workout finished! Be proud of yourself!",
        "All done! Your body thanks you!",
    ],

    starting: [
        "Let's begin! You've got this!",
        "Starting exercise. Focus on your form!",
        "Here we go! Take it at your own pace!",
        "Ready? Let's make this count!",
    ],

    streakCelebration: [
        "You're on a streak! Keep the momentum going!",
        "Another day, another workout! Amazing dedication!",
        "Your streak is growing! Consistency is key!",
    ],
};

// Track what's been spoken to avoid repetition
let lastSpokenMessage = '';
let lastMilestoneSpoken = 0;
let speechQueue: string[] = [];
let isSpeaking = false;
let femaleVoice: SpeechSynthesisVoice | null = null;

// Initialize voice - call this on component mount
export const initVoiceCoach = (): void => {
    const loadVoices = () => {
        const voices = window.speechSynthesis?.getVoices() || [];
        femaleVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('victoria') ||
            voice.name.toLowerCase().includes('karen') ||
            voice.name.includes('Google UK English Female') ||
            voice.name.includes('Google US English')
        ) || null;
    };

    loadVoices();
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
};

// Reset the voice coach state
export const resetVoiceCoach = (): void => {
    lastSpokenMessage = '';
    lastMilestoneSpoken = 0;
    speechQueue = [];
    isSpeaking = false;
    window.speechSynthesis?.cancel();
};

// Speak a message with debouncing
const speakMessage = (message: string, priority: boolean = false): void => {
    if (!window.speechSynthesis) return;

    // Avoid repeating the same message
    if (message === lastSpokenMessage && !priority) return;

    if (priority) {
        // Cancel current speech and speak immediately
        window.speechSynthesis.cancel();
        speechQueue = [message];
    } else {
        // Add to queue
        speechQueue.push(message);
    }

    processQueue();
};

const processQueue = (): void => {
    if (isSpeaking || speechQueue.length === 0 || !window.speechSynthesis) return;

    const message = speechQueue.shift();
    if (!message) return;

    isSpeaking = true;
    lastSpokenMessage = message;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;

    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
        isSpeaking = false;
        // Process next message after a short delay
        setTimeout(processQueue, 300);
    };

    utterance.onerror = () => {
        isSpeaking = false;
        setTimeout(processQueue, 100);
    };

    window.speechSynthesis.speak(utterance);
};

// Get a random message from an array
const getRandomMessage = (messages: string[]): string => {
    return messages[Math.floor(Math.random() * messages.length)];
};

// ============ Public API ============

// Call when exercise starts
export const announceStart = (): void => {
    speakMessage(getRandomMessage(VOICE_MESSAGES.starting), true);
};

// Call on each rep completion
export const onRepComplete = (repCount: number): void => {
    // Check for milestone
    const milestone = VOICE_MESSAGES.milestones[repCount];
    if (milestone && lastMilestoneSpoken !== repCount) {
        lastMilestoneSpoken = repCount;
        speakMessage(milestone);
        return;
    }

    // Random encouragement every 3 reps (not on milestones)
    if (repCount % 3 === 0 && repCount > 0 && !milestone) {
        speakMessage(getRandomMessage(VOICE_MESSAGES.encouragement));
    }
};

// Call for duration exercises (every 5 seconds)
export const onHoldProgress = (seconds: number): void => {
    const milestone = VOICE_MESSAGES.holdMilestones[seconds];
    if (milestone && lastMilestoneSpoken !== seconds) {
        lastMilestoneSpoken = seconds;
        speakMessage(milestone);
    }
};

// Call when good form is detected
export const announceGoodForm = (): void => {
    speakMessage(VOICE_MESSAGES.formCorrections.goodForm);
};

// Call when form needs correction
export const announceFormCorrection = (type: keyof typeof VOICE_MESSAGES.formCorrections): void => {
    speakMessage(VOICE_MESSAGES.formCorrections[type]);
};

// Call when exercise is complete
export const announceCompletion = (): void => {
    speakMessage(getRandomMessage(VOICE_MESSAGES.completion), true);
};

// Call for streak celebration
export const celebrateStreak = (streak: number): void => {
    if (streak >= 3) {
        speakMessage(getRandomMessage(VOICE_MESSAGES.streakCelebration));
    }
};

// Call for position feedback (use sparingly)
export const announceFeedback = (message: string): void => {
    speakMessage(message);
};

export default {
    initVoiceCoach,
    resetVoiceCoach,
    announceStart,
    onRepComplete,
    onHoldProgress,
    announceGoodForm,
    announceFormCorrection,
    announceCompletion,
    celebrateStreak,
    announceFeedback,
};
