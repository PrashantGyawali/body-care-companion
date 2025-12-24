import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type ExerciseType = 'REPS' | 'DURATION';

export interface ExerciseConfig {
    id: string; // Matches ID in exercises.ts
    type: ExerciseType;
    instruction: string;
    // Relevant landmarks to check for visibility (e.g., [11, 12] for shoulders)
    requiredLandmarks: number[];
    // Function to calculate metric (angle, position)
    calculateMetric: (landmarks: NormalizedLandmark[]) => number;
    // Thresholds for counting/timer
    thresholds: {
        // For REPS: count when metric goes from start -> end -> start
        // For DURATION: hold when metric is within [min, max]
        min?: number;
        max?: number;
        start?: number; // e.g., < 30 (flexed)
        end?: number;   // e.g., > 160 (extended)
    };
    // Which skeletal connections to draw
    connections: { start: number; end: number }[];
    // Optional: Target count or duration for success
    targetDuration?: number;
    targetReps?: number;
}

// Helper: Calculate angle between 3 points (A-B-C)
const calculateAngle = (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
};

// Config Database
export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
    // --- Bicep Curls (Left) ---
    // Note: We might want to keep the explicit ID if it exists, or map general ones
    'bicep-curl-left': {
        id: 'bicep-curl-left',
        type: 'REPS',
        instruction: 'Keep your elbow close to your body. Curl up fully.',
        requiredLandmarks: [11, 13, 15], // Left Shoulder, Elbow, Wrist
        connections: [{ start: 11, end: 13 }, { start: 13, end: 15 }],
        calculateMetric: (landmarks) => calculateAngle(landmarks[11], landmarks[13], landmarks[15]),
        thresholds: {
            start: 30,  // Curled up
            end: 160,   // Extended down
        },
        targetReps: 10
    },

    // --- Knee Extension (Left) ---
    'knee-extension': { // Assuming active selection logic handles left/right
        id: 'knee-extension',
        type: 'REPS',
        instruction: 'Sit on a chair. Straighten your leg fully.',
        requiredLandmarks: [23, 25, 27], // Left Hip, Knee, Ankle
        connections: [{ start: 23, end: 25 }, { start: 25, end: 27 }],
        calculateMetric: (landmarks) => calculateAngle(landmarks[23], landmarks[25], landmarks[27]),
        thresholds: {
            start: 160, // Straight
            end: 90,    // Bent (Sitting)
        },
        targetReps: 10
    },

    // --- Squats / Chair Sit-to-Stand (General) ---
    'squats': {
        id: 'squats',
        type: 'REPS',
        instruction: 'Stand with feet shoulder-width apart. Lower your hips back and down.',
        requiredLandmarks: [23, 25, 27], // Hip, Knee, Ankle (using Left side for calculation)
        connections: [
            { start: 11, end: 23 }, { start: 12, end: 24 }, // Body
            { start: 23, end: 25 }, { start: 24, end: 26 }, // Thighs
            { start: 25, end: 27 }, { start: 26, end: 28 }  // Shins
        ],
        calculateMetric: (landmarks) => {
            // Average knee angle or just use left
            const leftAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
            const rightAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
            return (leftAngle + rightAngle) / 2;
        },
        thresholds: {
            start: 170, // Standing
            end: 100,   // Squatting/Sitting
        },
        targetReps: 10
    },

    // --- Neck Stretch (Left) ---
    'neck-stretch-1': {
        id: 'neck-stretch-1',
        type: 'DURATION',
        instruction: 'Tilt your head to the side. Hold the stretch.',
        requiredLandmarks: [7, 8, 11, 12], // Ears and Shoulders
        connections: [{ start: 7, end: 3 }, { start: 8, end: 6 }, { start: 11, end: 12 }], // Face/Shoulders
        calculateMetric: (landmarks) => {
            // Calculate head tilt relative to horizontal using eyes
            // We use atan (not atan2) to get the slope angle (-90 to 90) regardless of direction
            const dx = landmarks[5].x - landmarks[2].x; // Right Eye - Left Eye
            const dy = landmarks[5].y - landmarks[2].y;

            // Avoid division by zero
            if (Math.abs(dx) < 0.001) return 90;

            // Enforce Direction:
            // "Left" (Default) Tilt means Ear to Left Shoulder.
            // Left Eye (2) should be LOWER (Higher Y value) than Right Eye (5).
            // dy = Right_Y (small) - Left_Y (large) should be NEGATIVE.
            // If dy > 0, we are tilting the wrong way (or active side is wrong).
            if (dy > 0) return 0; // Wrong side

            const angle = Math.abs(Math.atan(dy / dx) * 180 / Math.PI);
            return angle;
        },
        thresholds: {
            min: 30, // Head tilted at least 15 degrees
            max: 70
        },
        targetDuration: 5
    },

    // --- Neck Rotation ---
    'neck-rotation': {
        id: 'neck-rotation',
        type: 'REPS',
        instruction: 'Turn your head slowly to each side. Keep shoulders still.',
        requiredLandmarks: [0, 11, 12], // Nose and Shoulders
        connections: [
            { start: 11, end: 12 },  // Shoulder line
            { start: 7, end: 8 },    // Ear to ear (head)
            { start: 0, end: 7 },    // Nose to left ear
            { start: 0, end: 8 },    // Nose to right ear
        ],
        calculateMetric: (landmarks) => {
            // Calculate how far the nose is from the center line between shoulders
            const shoulderMidX = (landmarks[11].x + landmarks[12].x) / 2;
            const noseX = landmarks[0].x;

            // Calculate horizontal offset as percentage of shoulder width
            const shoulderWidth = Math.abs(landmarks[12].x - landmarks[11].x);
            if (shoulderWidth < 0.01) return 0; // Avoid division by zero

            const offset = (noseX - shoulderMidX) / shoulderWidth;

            // Convert to a 0-100 scale: 0 = center, 50 = turned left, -50 = turned right
            return offset * 100;
        },
        thresholds: {
            start: 30,  // Turned right (nose past center toward right shoulder)
            end: -30,   // Turned left (nose past center toward left shoulder)
        },
        targetReps: 10
    },

    // --- Manual catch-all for undefined exercises ---
    'default': {
        id: 'default',
        type: 'DURATION',
        instruction: 'Perform the exercise as shown in the video.',
        requiredLandmarks: [11, 12, 23, 24], // Core
        connections: [
            { start: 11, end: 13 }, { start: 13, end: 15 },
            { start: 12, end: 14 }, { start: 14, end: 16 },
            { start: 11, end: 23 }, { start: 12, end: 24 }
        ],
        calculateMetric: () => 0,
        thresholds: { min: -1, max: 1 } // Always strictly true if logic allows
    }
};

// Helper: Get Config or Default
export const getExerciseConfig = (id: string, activeSide: 'left' | 'right' = 'left'): ExerciseConfig => {
    // Check for specific side overrides if needed, e.g. "knee-extension-right"
    // For now we assume the ID from the card + UI side selection handles it.

    // NOTE: In a full app, we'd dynamically generate these based on side.
    // Here implies we need to handle "activeSide" in the component 
    // by mirroring the landmarks if needed.

    const config = EXERCISE_CONFIGS[id] || EXERCISE_CONFIGS['default'];
    return config;
};
