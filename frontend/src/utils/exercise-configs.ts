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
    targetRepsForDuration?: number; // For DURATION type: count reps internally, end after N reps (not displayed)
    sideSpecific?: boolean; // Default true. If false, hides Left/Right buttons.
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

    // --- Active Neck Extension ---
    'neck-extension': {
        id: 'neck-extension',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Sit tall. Look up towards ceiling, then return to neutral.',
        requiredLandmarks: [11, 12, 7, 8], // Shoulders, Ears
        connections: [
            { start: 11, end: 12 },
            { start: 7, end: 8 }
        ],
        calculateMetric: (landmarks) => {
            // Calculate Head Pitch (Looking Up/Down)
            // Using Ear relative to Eye? Or Nose relative to Ear?
            // When looking UP: Nose (0) goes UP relative to Ear (7,8). 
            // Normalized direction vector of Ear->Nose.

            // Average Ear Y
            const midEarY = (landmarks[7].y + landmarks[8].y) / 2;
            const noseY = landmarks[0].y;

            // Normalizing by head scale (Ear to Ear dist)
            const headSize = Math.abs(landmarks[7].x - landmarks[8].x);
            // Glitch protection: If head size is too small (too far or invalid detect), 
            // return a safe 'Neutral' value (e.g. 0) to prevent state jumping?
            // BUT if we return 0 (Neutral), and we were in HOLD, it might falsely count a REP!
            // Better to return NaN and handle it, or return a value that doesn't trigger state change.
            // For now, let's just be strict about headSize.
            if (headSize < 0.02) return 0;

            const diffY = (midEarY - noseY) / headSize;

            // Smoothed return? 
            // To prevent jitter, maybe the calling code should smooth it. 
            // Looking at UniversalExerciseCounter, it pushes to history (for smoothness score) but USES the raw 'val' for logic.
            // We'll rely on the 800ms debounce in Counter to handle quick glitches.

            return diffY * 100;
        },
        thresholds: {
            start: 15,   // Neutral / Rest (< 15) - Increased slightly to make it easier to register 'Rest'
            end: 45,     // Looking Up / Action (> 45) - Increased to ensure clear extension (reduce false positives)
        },
        targetReps: 5
    },

    // --- Isometric Side Bending ---
    'isometric-side-bend': {
        id: 'isometric-side-bend',
        type: 'DURATION',
        instruction: 'Place hand on side of head. Push head into hand without moving.',
        requiredLandmarks: [11, 12, 7, 8], // Shoulders and Ears (for head tracking)
        connections: [
            { start: 11, end: 12 },  // Shoulders
            { start: 7, end: 8 },    // Head
            { start: 11, end: 13 }, { start: 13, end: 15 } // Arm (for hand position)
        ],
        calculateMetric: (landmarks) => {
            // Check distance between Active Hand (Wrist) and Active Ear
            // We need to know if it's Left or Right side.
            // The component handles landmarks relative to Active Side?
            // "UniversalExerciseCounter" passes `virtualLandmarks` where [15] is ALWAYS the active wrist. [7] is active ear.

            const ear = landmarks[7];
            const wrist = landmarks[15];
            const shoulder = landmarks[11];

            // Calculate distance
            const dist = Math.sqrt(Math.pow(wrist.x - ear.x, 2) + Math.pow(wrist.y - ear.y, 2));

            // Normalize by shoulder width to be scale-invariant
            const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);
            if (shoulderWidth < 0.01) return 100; // invalid

            const normalizedDist = dist / shoulderWidth;
            return normalizedDist;
        },
        thresholds: {
            min: 0,    // Hand touching head
            max: 0.6   // Tolerant range (hand near head)
        },
        targetDuration: 10
    },

    // --- Upper Trapezius Stretch ---
    'trapezius-stretch': {
        id: 'trapezius-stretch',
        type: 'DURATION',
        instruction: 'Tilt head away from side. Pull gently with other hand.',
        // Minimal Requirements: Shoulders only.
        // We handle Head/Arm tracking softly in the metric calculation.
        requiredLandmarks: [11, 12],
        connections: [
            { start: 11, end: 12 },
            { start: 12, end: 14 }, { start: 14, end: 16 } // Draw Opposite Arm
        ],
        calculateMetric: (landmarks) => {
            // Logic: Tilt head to Opposite Side (Right). Usage Opposite Hand (Right).
            // Context: virtualLandmarks are normalized to Left Side Active.

            // 1. Hand/Arm Detection (Opposite side)
            // Ideally Wrist (16) is near Ear (8) or Head.
            // Fallback: Elbow (14) is raised (above shoulder).
            const wrist = landmarks[16];
            const elbow = landmarks[14];
            const ear = landmarks[8]; // Opposite Ear
            const shoulderRy = landmarks[12].y;

            let armInPosition = false;

            // Check Wrist Proximity if visible
            if ((wrist.visibility ?? 1) > 0.5 && (ear.visibility ?? 1) > 0.5) {
                const dist = Math.sqrt(Math.pow(wrist.x - ear.x, 2) + Math.pow(wrist.y - ear.y, 2));
                if (dist < 0.3) armInPosition = true;
            }

            // Fallback: Check if Elbow is raised (Y is smaller than shoulder Y)
            // And Elbow is somewhat close to body center (not reached out far)
            if (!armInPosition && (elbow.visibility ?? 1) > 0.5) {
                // Elbow Y < Shoulder Y (remember Y increases downwards)
                if (elbow.y < shoulderRy) armInPosition = true;
            }

            if (!armInPosition) return 0; // Arm not involved

            // 2. Head Tilt Detection
            // Preferred: Eye Angle (Left Eye 2, Right Eye 5)
            const leftEye = landmarks[2];
            const rightEye = landmarks[5];
            const nose = landmarks[0];
            const shoulderMidX = (landmarks[11].x + landmarks[12].x) / 2;
            const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);

            let angle = 0;

            // Try Eye Angle
            if ((leftEye.visibility ?? 1) > 0.6 && (rightEye.visibility ?? 1) > 0.6) {
                const dx = rightEye.x - leftEye.x;
                const dy = rightEye.y - leftEye.y;
                if (Math.abs(dx) > 0.001 && dy > 0) { // dy > 0 means Right Eye is Lower (Tilt Right)
                    angle = Math.abs(Math.atan(dy / dx) * 180 / Math.PI);
                }
            }

            // Fallback: Nose Offset (Nose moves to Right of Center)
            if (angle < 10 && (nose.visibility ?? 1) > 0.5 && shoulderWidth > 0.01) {
                const offset = (nose.x - shoulderMidX) / shoulderWidth;
                // Offset > 0 means Nose is to the Right
                if (offset > 0.1) {
                    // Approximate angle from offset (0.1 offset ~ 15 degrees)
                    angle = offset * 100; // Fake scale mapping
                }
            }

            return angle;
        },
        thresholds: {
            min: 15, // At least 15 deg tilt (or equivalent offset score)
            max: 90
        },
        targetDuration: 30
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

    // --- Shoulder Pendulum ---
    'shoulder-pendulum': {
        id: 'shoulder-pendulum',
        type: 'REPS',
        instruction: 'Lean forward, let arm hang. Swing in small circles.',
        requiredLandmarks: [11, 13, 15], // Shoulder, Elbow, Wrist
        connections: [
            { start: 11, end: 13 },  // Shoulder to Elbow
            { start: 13, end: 15 },  // Elbow to Wrist
        ],
        calculateMetric: (landmarks) => {
            // Track wrist horizontal position relative to shoulder
            // Pendulum swing = wrist moves left/right while hanging down
            const shoulderX = landmarks[11].x;
            const wristX = landmarks[15].x;

            // Calculate horizontal offset (positive = right, negative = left)
            const offset = (wristX - shoulderX) * 100;
            return offset;
        },
        thresholds: {
            start: 5,    // Swing right
            end: -5,     // Swing left
        },
        targetReps: 10
    },

    // --- Cross-Body Shoulder Stretch ---
    'shoulder-stretch': {
        id: 'shoulder-stretch',
        type: 'REPS',
        instruction: 'Bring arm across body. Pull gently with other hand. Repeat each side.',
        requiredLandmarks: [11, 12, 15], // Both Shoulders and Left Wrist
        connections: [
            { start: 11, end: 12 },  // Shoulder line
            { start: 11, end: 13 },  // Left Shoulder to Elbow
            { start: 13, end: 15 },  // Left Elbow to Wrist
        ],
        calculateMetric: (landmarks) => {
            // Detect cross-body: left wrist should cross past right shoulder
            // Calculate how far left wrist is past the midline (toward right shoulder)
            const leftShoulderX = landmarks[11].x;
            const rightShoulderX = landmarks[12].x;
            const leftWristX = landmarks[15].x;

            const shoulderWidth = Math.abs(rightShoulderX - leftShoulderX);
            if (shoulderWidth < 0.01) return 0;

            // How far past center the wrist is (positive = crossed to right side)
            const midX = (leftShoulderX + rightShoulderX) / 2;
            const crossAmount = (leftWristX - midX) / shoulderWidth * 100;

            return crossAmount;
        },
        thresholds: {
            start: 30,   // Arm crossed far to the right
            end: -20,    // Arm back to starting position (near left side)
        },
        targetReps: 3
    },

    // --- Active Elbow Flexion ---
    'elbow-flexion': {
        id: 'elbow-flexion',
        type: 'REPS',
        instruction: 'Bend your elbow fully, then straighten it completely.',
        requiredLandmarks: [11, 13, 15], // Shoulder, Elbow, Wrist (Left default, swapped by component if right)
        connections: [{ start: 11, end: 13 }, { start: 13, end: 15 }],
        calculateMetric: (landmarks) => calculateAngle(landmarks[11], landmarks[13], landmarks[15]),
        thresholds: {
            start: 45,  // Flexed (hand to shoulder)
            end: 150,   // Extended (arm straight)
        },
        targetReps: 10
    },

    // --- Seated Thoracic Rotation (Spine Twist) ---
    'spine-twist': {
        id: 'spine-twist',
        type: 'REPS',
        instruction: 'Twist your upper body to one side, then the other.',
        requiredLandmarks: [11, 12, 23, 24], // Shoulders and Hips
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 23, end: 24 }, // Hip line
            { start: 11, end: 23 }, // Torso Sides
            { start: 12, end: 24 }
        ],
        calculateMetric: (landmarks) => {
            // Calculate shoulder rotation relative to hips
            // When facing forward, shoulder width / hip width is roughly constant (~1.4 usually)
            // When twisting, the projected shoulder width decreases relative to hips (or vice versa depending on camera)

            // Better metric: Nose position relative to Hip Center?
            // Let's use Nose X relative to Shoulder Center X (similar to neck rotation but we want TORSO movement)
            // Actually, for thoracic rotation, the shoulders rotate while hips stay still.
            // So the Shoulders turn. We can reuse the "Nose relative to Shoulders" logic BUT
            // if the whole torso turns, the nose AND shoulders move together relative to the hips.

            // Let's calculate the X-offset of the Shoulder Center relative to the Hip Center.
            const shoulderMidX = (landmarks[11].x + landmarks[12].x) / 2;
            const hipMidX = (landmarks[23].x + landmarks[24].x) / 2;

            // Normalize by Hip Width to be distance-invariant
            const hipWidth = Math.abs(landmarks[23].x - landmarks[24].x);
            if (hipWidth < 0.01) return 0;

            const offset = (shoulderMidX - hipMidX) / hipWidth * 100;
            return offset;
        },
        thresholds: {
            start: 20,   // Twist Right (Shoulders moved right of hips)
            end: -20,    // Twist Left (Shoulders moved left of hips)
        },
        targetReps: 10
    },

    // --- Shoulder Flexion ---
    'shoulder-flexion': {
        id: 'shoulder-flexion',
        type: 'REPS',
        instruction: 'Raise your arm straight forward and up.',
        requiredLandmarks: [11, 13, 23], // Shoulder, Elbow, Hip
        connections: [{ start: 23, end: 11 }, { start: 11, end: 13 }, { start: 13, end: 15 }], // Torso side and arm
        calculateMetric: (landmarks) => {
            // Calculate angle between torso (Hip-Shoulder) and Arm (Shoulder-Elbow)
            // Use calculateAngle(Hip, Shoulder, Elbow)
            // Start (arm down) approx 0-20 degrees
            // End (arm up) approx 170-180 degrees
            return calculateAngle(landmarks[23], landmarks[11], landmarks[13]);
        },
        thresholds: {
            start: 25,  // Arm down (near torso)
            end: 140,   // Arm up (flexed forward)
        },
        targetReps: 10
    },

    // --- Shoulder Abduction ---
    'shoulder-abduction': {
        id: 'shoulder-abduction',
        type: 'REPS',
        instruction: 'Raise your arm out to the side.',
        requiredLandmarks: [11, 12, 13], // Shoulder, Opposite Shoulder, Elbow (No Hips needed)
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 11, end: 13 }, { start: 13, end: 15 } // Active Arm
        ],
        calculateMetric: (landmarks) => {
            // Angle at Shoulder (11), formed by Opposite Shoulder (12) and Elbow (13).
            // Arm Down: ~90 degrees.
            // Arm Side (Abducted): ~180 degrees.
            return calculateAngle(landmarks[12], landmarks[11], landmarks[13]);
        },
        thresholds: {
            start: 110,  // Arm down (allowing for slight abduction 90-110)
            end: 150,    // Arm up (significant abduction)
        },
        targetReps: 10
    },

    // --- Wall Slides ---
    'wall-slide': {
        id: 'wall-slide',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Stand against wall. Slide arms up and down.',
        requiredLandmarks: [11, 12, 15, 16], // Both shoulders, both wrists
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 11, end: 13 }, { start: 13, end: 15 }, // Left arm
            { start: 12, end: 14 }, { start: 14, end: 16 }  // Right arm
        ],
        calculateMetric: (landmarks) => {
            // Calculate average wrist height relative to shoulders
            // This measures how high the arms are raised
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];

            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
            const wristMidY = (leftWrist.y + rightWrist.y) / 2;

            // Normalize by shoulder width for scale invariance
            const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
            if (shoulderWidth < 0.01) return 0;

            // Positive value = wrists above shoulders (arms raised)
            // Negative value = wrists below shoulders (arms down)
            const normalizedHeight = (shoulderMidY - wristMidY) / shoulderWidth;

            return normalizedHeight;
        },
        thresholds: {
            start: 0.3,  // Arms down (W position - wrists near or below shoulders)
            end: 1.0,    // Arms up (overhead - wrists well above shoulders)
        },
        targetReps: 10
    },

    // --- Scapular Squeezes ---
    'scapular-squeeze': {
        id: 'scapular-squeeze',
        type: 'DURATION',
        sideSpecific: false,
        instruction: 'Squeeze shoulder blades together. Hold for 5 seconds.',
        requiredLandmarks: [11, 12], // Both shoulders
        connections: [
            { start: 11, end: 12 } // Shoulder line
        ],
        calculateMetric: (landmarks) => {
            // Measure shoulder width change to detect retraction
            // When squeezing shoulder blades together, shoulders move slightly inward
            // We'll track the ratio of current width to a baseline

            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];

            // Calculate current shoulder width
            const currentWidth = Math.abs(leftShoulder.x - rightShoulder.x);

            // We need a baseline width to compare against
            // Since we don't have historical data, we'll use a different approach:
            // Measure the shoulder width as a ratio and look for reduction
            // A smaller value indicates shoulders are closer together (squeezed)

            // Return the width directly - smaller = more squeezed
            // We'll normalize by a typical shoulder width range
            // Typical shoulder width in normalized coords: 0.15-0.25
            // When squeezed, it might reduce by 5-15%

            return currentWidth;
        },
        thresholds: {
            min: 0.10,  // Minimum width when squeezed (shoulders closer together)
            max: 0.18   // Maximum width still considered squeezed
        },
        targetDuration: 5
    },

    // --- External Rotation (Wall) ---
    'external-rotation': {
        id: 'external-rotation',
        type: 'DURATION',
        sideSpecific: false,
        instruction: 'Stand facing forward. Press both hands into wall at sides. Hold 5 seconds.',
        requiredLandmarks: [11, 12, 13, 14, 15, 16], // Both shoulders, elbows, wrists
        connections: [
            { start: 11, end: 13 }, { start: 13, end: 15 }, // Left arm
            { start: 12, end: 14 }, { start: 14, end: 16 }  // Right arm
        ],
        calculateMetric: (landmarks) => {
            // Measure both elbow angles to verify 90-degree position
            // This is an isometric hold with both arms
            const leftShoulder = landmarks[11];
            const leftElbow = landmarks[13];
            const leftWrist = landmarks[15];

            const rightShoulder = landmarks[12];
            const rightElbow = landmarks[14];
            const rightWrist = landmarks[16];

            // Calculate the angle at both elbows
            const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
            const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

            // Return average of both angles
            return (leftAngle + rightAngle) / 2;
        },
        thresholds: {
            min: 70,   // Minimum elbow angle (allowing some flexibility)
            max: 110   // Maximum elbow angle (should be around 90 degrees)
        },
        targetDuration: 5,
        targetRepsForDuration: 10 // Count 10 holds internally, end exercise after 10 reps
    },

    // --- Gentle Arm Circles ---
    'arm-circles': {
        id: 'arm-circles',
        type: 'REPS',
        instruction: 'Extend arms to sides. Make small circles, gradually increasing size.',
        requiredLandmarks: [11, 12, 15, 16], // Both shoulders and wrists
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 11, end: 13 }, { start: 13, end: 15 }, // Left arm
            { start: 12, end: 14 }, { start: 14, end: 16 }  // Right arm
        ],
        calculateMetric: (landmarks) => {
            // Track wrist position relative to shoulder to detect circular motion
            // We'll track the horizontal (X) position of the wrists
            // A circle involves moving forward and backward
            const leftWrist = landmarks[15];
            const rightWrist = landmarks[16];
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];

            // Calculate average horizontal displacement from shoulders
            const leftOffset = (leftWrist.x - leftShoulder.x) * 100;
            const rightOffset = (rightWrist.x - rightShoulder.x) * 100;

            // Average the offsets (both arms should move together)
            return (leftOffset + rightOffset) / 2;
        },
        thresholds: {
            start: -10,  // Arms moved backward (back of circle)
            end: 10,     // Arms moved forward (front of circle)
        },
        targetReps: 10,
        sideSpecific: false
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
