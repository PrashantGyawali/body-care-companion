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
        sideSpecific: false,
        instruction: 'Twist your upper body to one side, then the other.',
        requiredLandmarks: [0, 11, 12, 23, 24], // Nose, Shoulders and Hips
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 23, end: 24 }, // Hip line
            { start: 11, end: 23 }, // Torso Sides
            { start: 12, end: 24 }
        ],
        calculateMetric: (landmarks) => {
            // Track thoracic rotation by measuring nose offset relative to hip center
            // When sitting still, nose is near the hip horizontal midpoint.
            // When twisting, the nose moves significantly relative to the static hip baseline.

            const nose = landmarks[0];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            const hipMidX = (leftHip.x + rightHip.x) / 2;
            const hipWidth = Math.abs(rightHip.x - leftHip.x);

            if (hipWidth < 0.01) return 0;

            // Offset of nose relative to hips
            // Positive: Twist Right (Nose moves toward/past Right Hip)
            // Negative: Twist Left (Nose moves toward/past Left Hip)
            const offset = (nose.x - hipMidX) / hipWidth * 100;
            return offset;
        },
        thresholds: {
            start: 35,   // Twist Right (Nose moved significantly right of hips)
            end: -35,    // Twist Left (Nose moved significantly left of hips)
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

    // --- Straight Leg Raises ---
    'straight-leg-raise': {
        id: 'straight-leg-raise',
        type: 'REPS',
        instruction: 'Lie on your back. Keep leg straight and lift about 12 inches.',
        requiredLandmarks: [23, 25, 27], // Hip, Knee, Ankle
        connections: [
            { start: 23, end: 25 }, // Hip to Knee
            { start: 25, end: 27 }  // Knee to Ankle
        ],
        calculateMetric: (landmarks) => {
            // Calculate the angle at the hip (between torso and leg)
            // We need to create a reference point above the hip for the "torso" direction
            // Using shoulder (11) and hip (23) to define torso line
            // Then measure angle between torso and leg (hip to ankle)

            const hip = landmarks[23];
            const knee = landmarks[25];
            const ankle = landmarks[27];
            const shoulder = landmarks[11];

            // Calculate the vertical angle of the leg relative to horizontal
            // When lying down, a raised leg will have the ankle higher (smaller Y) than hip
            // We'll measure the angle at the hip joint

            // Create a virtual point to the right of hip for horizontal reference
            const horizontalRef = {
                x: hip.x + 0.1,
                y: hip.y,
                z: hip.z,
                visibility: 1
            };

            // Calculate angle: horizontal-ref -> hip -> ankle
            // This gives us the leg elevation angle
            const angle = calculateAngle(horizontalRef as NormalizedLandmark, hip, ankle);

            return angle;
        },
        thresholds: {
            start: 20,  // Leg raised (elevated from floor)
            end: 5,     // Leg lowered (resting on floor)
        },
        targetReps: 10
    },

    // --- Seated Heel Slides ---
    'heel-slide': {
        id: 'heel-slide',
        type: 'REPS',
        instruction: 'Sit on a chair. Slide heel back towards chair, then forward.',
        requiredLandmarks: [23, 25, 27], // Hip, Knee, Ankle
        connections: [
            { start: 23, end: 25 }, // Hip to Knee
            { start: 25, end: 27 }  // Knee to Ankle
        ],
        calculateMetric: (landmarks) => {
            // Calculate knee angle (Hip-Knee-Ankle)
            // Extended leg (heel forward): ~170-180 degrees
            // Flexed leg (heel back): ~90-120 degrees
            return calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
        },
        thresholds: {
            start: 120,  // Heel slid back (knee bent)
            end: 160,    // Heel slid forward (knee extended)
        },
        targetReps: 10
    },

    // --- Supported Mini Squats ---
    'mini-squat': {
        id: 'mini-squat',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Stand with feet shoulder-width apart. Bend knees slightly (30-45 degrees).',
        requiredLandmarks: [23, 24, 25, 26, 27, 28], // Both Hips, Knees, Ankles
        connections: [
            { start: 11, end: 23 }, { start: 12, end: 24 }, // Body
            { start: 23, end: 25 }, { start: 24, end: 26 }, // Thighs
            { start: 25, end: 27 }, { start: 26, end: 28 }  // Shins
        ],
        calculateMetric: (landmarks) => {
            // Calculate average knee angle for both legs
            const leftAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
            const rightAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
            return (leftAngle + rightAngle) / 2;
        },
        thresholds: {
            start: 155,  // Standing (nearly straight legs)
            end: 130,    // Mini squat (30-45 degree bend, less deep than full squat)
        },
        targetReps: 10
    },

    // --- Standing Calf Raises ---
    'calf-raise': {
        id: 'calf-raise',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Stand holding a chair. Rise up onto your toes, then lower back down.',
        requiredLandmarks: [23, 24, 25, 26, 27, 28, 29, 30], // Hips, Knees, Ankles, Heels
        connections: [
            { start: 23, end: 25 }, { start: 24, end: 26 }, // Thighs
            { start: 25, end: 27 }, { start: 26, end: 28 }, // Shins
            { start: 27, end: 31 }, { start: 28, end: 32 }  // Feet
        ],
        calculateMetric: (landmarks) => {
            // Track heel elevation by measuring vertical distance between ankle and knee
            // When on toes, ankle Y becomes smaller (moves up) relative to knee Y
            // We'll normalize by the thigh length to be scale-invariant

            const leftKnee = landmarks[25];
            const rightKnee = landmarks[26];
            const leftAnkle = landmarks[27];
            const rightAnkle = landmarks[28];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            // Calculate thigh length for normalization (hip to knee distance)
            const leftThighLength = Math.sqrt(
                Math.pow(leftHip.x - leftKnee.x, 2) +
                Math.pow(leftHip.y - leftKnee.y, 2)
            );
            const rightThighLength = Math.sqrt(
                Math.pow(rightHip.x - rightKnee.x, 2) +
                Math.pow(rightHip.y - rightKnee.y, 2)
            );
            const avgThighLength = (leftThighLength + rightThighLength) / 2;

            if (avgThighLength < 0.01) return 0;

            // Calculate vertical distance from knee to ankle (normalized)
            // When standing flat: ankle is below knee (positive Y difference)
            // When on toes: ankle moves up, reducing Y difference
            const leftDist = (leftAnkle.y - leftKnee.y) / avgThighLength;
            const rightDist = (rightAnkle.y - rightKnee.y) / avgThighLength;
            const avgDist = (leftDist + rightDist) / 2;

            // Return as percentage (multiply by 100 for easier threshold values)
            return avgDist * 100;
        },
        thresholds: {
            start: 40,   // Heels down (flat on floor)
            end: 20,     // On toes (heels raised)
        },
        targetReps: 15
    },

    // --- Seated Cat-Cow ---
    'seated-cat-cow': {
        id: 'seated-cat-cow',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Sit on edge of chair. Arch back and look up (Cow), then round spine and look down (Cat).',
        requiredLandmarks: [0, 11, 12, 23, 24], // Nose, Shoulders, Hips
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 23, end: 24 }, // Hip line
            { start: 11, end: 23 }, // Left torso
            { start: 12, end: 24 }  // Right torso
        ],
        calculateMetric: (landmarks) => {
            // Track spinal flexion/extension by measuring:
            // 1. Vertical distance between shoulders and hips (torso height)
            // 2. Head position (nose) relative to shoulders

            const nose = landmarks[0];
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            // Calculate midpoints
            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
            const hipMidY = (leftHip.y + rightHip.y) / 2;

            // Calculate torso length for normalization
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const hipMidX = (leftHip.x + rightHip.x) / 2;
            const torsoLength = Math.sqrt(
                Math.pow(shoulderMidX - hipMidX, 2) +
                Math.pow(shoulderMidY - hipMidY, 2)
            );

            if (torsoLength < 0.01) return 0;

            // Measure head position relative to shoulders (normalized)
            // Cat: head down (nose Y > shoulder Y, positive value)
            // Cow: head up (nose Y < shoulder Y, negative value)
            const headPosition = (nose.y - shoulderMidY) / torsoLength;

            // Return as percentage for easier thresholds
            return headPosition * 100;
        },
        thresholds: {
            start: -15,  // Cow position (head up, back arched)
            end: 15,     // Cat position (head down, spine rounded)
        },
        targetReps: 10
    },

    // --- Standing Back Extension ---
    'standing-extension': {
        id: 'standing-extension',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Stand tall. Place hands on lower back. Gently lean backward, looking up slightly.',
        requiredLandmarks: [0, 11, 12, 23, 24], // Nose, Shoulders, Hips
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 23, end: 24 }, // Hip line
            { start: 11, end: 23 }, // Left torso
            { start: 12, end: 24 }  // Right torso
        ],
        calculateMetric: (landmarks) => {
            // Track backward lean by measuring torso angle from vertical
            // Calculate the angle between vertical and the line from hips to shoulders

            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const nose = landmarks[0];

            // Calculate midpoints
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
            const hipMidX = (leftHip.x + leftHip.x) / 2;
            const hipMidY = (leftHip.y + rightHip.y) / 2;

            // Calculate torso vector (from hip to shoulder)
            const dx = shoulderMidX - hipMidX;
            const dy = shoulderMidY - hipMidY;

            // Calculate angle from vertical (negative Y axis)
            // When standing straight: dx ≈ 0, angle ≈ 0
            // When leaning back: dx becomes more negative (shoulders behind hips), angle increases
            const angle = Math.atan2(Math.abs(dx), Math.abs(dy)) * 180 / Math.PI;

            // Also consider head position for looking up
            // When looking up, nose Y < shoulder Y
            const headUp = shoulderMidY - nose.y;
            const torsoLength = Math.sqrt(dx * dx + dy * dy);
            const headFactor = torsoLength > 0.01 ? (headUp / torsoLength) * 20 : 0;

            // Combine torso lean and head position
            return angle + headFactor;
        },
        thresholds: {
            start: 5,    // Standing upright (neutral)
            end: 20,     // Leaning backward (extended)
        },
        targetReps: 10
    },

    // --- Seated Side Bends ---
    'seated-side-bend': {
        id: 'seated-side-bend',
        type: 'REPS',
        instruction: 'Sit tall. Reach one arm overhead and lean to the opposite side.',
        requiredLandmarks: [11, 12, 23, 24], // Shoulders and Hips
        connections: [
            { start: 11, end: 12 }, // Shoulder line
            { start: 23, end: 24 }, // Hip line
            { start: 11, end: 23 }, // Left torso
            { start: 12, end: 24 }, // Right torso
            { start: 11, end: 13 }, { start: 13, end: 15 }, // Left arm
            { start: 12, end: 14 }, { start: 14, end: 16 }  // Right arm
        ],
        calculateMetric: (landmarks) => {
            // Track lateral flexion by measuring shoulder tilt
            // When bending left: left shoulder drops (higher Y), right shoulder rises (lower Y)
            // When bending right: right shoulder drops (higher Y), left shoulder rises (lower Y)

            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];

            // Calculate shoulder tilt angle
            const shoulderDx = rightShoulder.x - leftShoulder.x;
            const shoulderDy = rightShoulder.y - leftShoulder.y;

            // Avoid division by zero
            if (Math.abs(shoulderDx) < 0.001) return 0;

            // Calculate tilt angle in degrees
            // Positive: bending right (right shoulder lower)
            // Negative: bending left (left shoulder lower)
            const tiltAngle = Math.atan(shoulderDy / shoulderDx) * 180 / Math.PI;

            return tiltAngle;
        },
        thresholds: {
            start: 15,   // Bending to one side (right shoulder lower)
            end: -15,    // Bending to opposite side (left shoulder lower)
        },
        targetReps: 10
    },

    // --- Seated Chair Marches ---
    'chair-march': {
        id: 'chair-march',
        type: 'REPS',
        sideSpecific: false,
        instruction: 'Sit tall without leaning back. Lift one knee up, then alternate legs.',
        requiredLandmarks: [23, 24, 25, 26, 27, 28], // Hips, Knees, Ankles
        connections: [
            { start: 11, end: 23 }, { start: 12, end: 24 }, // Torso
            { start: 23, end: 25 }, { start: 24, end: 26 }, // Thighs
            { start: 25, end: 27 }, { start: 26, end: 28 }  // Shins
        ],
        calculateMetric: (landmarks) => {
            // Track alternating knee lifts by measuring knee height relative to hips
            // We'll track the difference in knee heights to detect alternating pattern

            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const leftKnee = landmarks[25];
            const rightKnee = landmarks[26];

            // Calculate hip midpoint Y
            const hipMidY = (leftHip.y + rightHip.y) / 2;

            // Calculate how high each knee is relative to hip (normalized)
            // When knee is lifted: knee Y < hip Y (smaller value = higher on screen)
            // Negative value = knee is above hip (lifted)
            const leftKneeHeight = leftKnee.y - hipMidY;
            const rightKneeHeight = rightKnee.y - hipMidY;

            // Calculate the difference between left and right knee heights
            // Positive: left knee higher (lifted)
            // Negative: right knee higher (lifted)
            const heightDifference = rightKneeHeight - leftKneeHeight;

            // Normalize by hip width for scale invariance
            const hipWidth = Math.abs(leftHip.x - rightHip.x);
            if (hipWidth < 0.01) return 0;

            const normalizedDiff = (heightDifference / hipWidth) * 100;

            return normalizedDiff;
        },
        thresholds: {
            start: 20,   // Left knee lifted (left knee higher than right)
            end: -20,    // Right knee lifted (right knee higher than left)
        },
        targetReps: 20
    },

    // --- Chin Tucks ---
    'chin-tuck': {
        id: 'chin-tuck',
        type: 'DURATION',
        sideSpecific: false,
        instruction: 'Sit tall looking straight ahead. Gently pull chin straight back (make a double chin). Hold for 5 seconds.',
        requiredLandmarks: [0, 7, 8, 11, 12], // Nose, Ears, Shoulders
        connections: [
            { start: 7, end: 8 },    // Ear to ear (head)
            { start: 11, end: 12 },  // Shoulders
            { start: 0, end: 7 },    // Nose to left ear
            { start: 0, end: 8 }     // Nose to right ear
        ],
        calculateMetric: (landmarks) => {
            // Track horizontal chin retraction (forward/backward movement)
            // The key is measuring how far back the nose moves relative to the ears

            const nose = landmarks[0];
            const leftEar = landmarks[7];
            const rightEar = landmarks[8];

            // Calculate ear midpoint
            const earMidX = (leftEar.x + rightEar.x) / 2;
            const earMidY = (leftEar.y + rightEar.y) / 2;

            // Calculate head size for normalization (ear to ear distance)
            const headWidth = Math.sqrt(
                Math.pow(rightEar.x - leftEar.x, 2) +
                Math.pow(rightEar.y - leftEar.y, 2)
            );

            if (headWidth < 0.01) return 100; // Invalid, return out of range

            // Calculate the horizontal (X) distance from nose to ear midpoint
            // This is the key metric for chin tucks - we want HORIZONTAL retraction
            const horizontalDistance = Math.abs(nose.x - earMidX);

            // Normalize by head width and convert to percentage
            // When chin is tucked: nose moves back, horizontal distance decreases
            // When chin is forward: horizontal distance increases
            const normalizedDistance = (horizontalDistance / headWidth) * 100;

            return normalizedDistance;
        },
        thresholds: {
            min: 30,   // Chin tucked back (nose closer to ear line horizontally)
            max: 50    // Maximum distance while still considered tucked
        },
        targetDuration: 5,
        targetRepsForDuration: 10 // Hold for 5 seconds, repeat 10 times
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
