import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getExerciseConfig, ExerciseType } from '../utils/exercise-configs';
import { getExercisesForBodyPart, exerciseDatabase } from '../data/exercises';

// Find exercise details by ID
const findExerciseById = (id: string) => {
    for (const category in exerciseDatabase) {
        const found = exerciseDatabase[category].find(e => e.id === id);
        if (found) return found;
    }
    return null;
};

const UniversalExerciseCounter: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const exerciseDetails = id ? findExerciseById(id) : null;

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State
    const [stats, setStats] = useState({ count: 0, timer: 0 }); // Count for REPS, Timer for DURATION
    const [stage, setStage] = useState<'START' | 'END' | 'HOLD' | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [activeSide, setActiveSide] = useState<'left' | 'right'>('left'); // Default to left

    // Refs for Loop
    const statsRef = useRef({ count: 0, timer: 0 });
    const stageRef = useRef<'START' | 'END' | 'HOLD' | null>(null);
    const lastTimeRef = useRef<number>(0);
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
    const requestRef = useRef<number>(null);
    const activeSideRef = useRef<'left' | 'right'>('left');
    const feedbackRef = useRef<string | null>(null);
    const autoSwitchScheduledRef = useRef(false);

    useEffect(() => {
        activeSideRef.current = activeSide;
        // Reset all state when side changes
        statsRef.current = { count: 0, timer: 0 };
        setStats({ count: 0, timer: 0 });
        stageRef.current = null;
        lastTimeRef.current = 0;
        lastTimeRef.current = 0;
        feedbackRef.current = null;
        setFeedback(null);
        autoSwitchScheduledRef.current = false; // Reset the checking flag
        // Clear collision of feedback if any
    }, [activeSide]);

    // Load Config
    // Note: If ID depends on side (e.g. left vs right knee), we might need to swap configs.
    // For simplicity, we assume the config handles landmarks relative to body, OR we offset them.
    // Let's implement simple index swapping for Side Support.
    const config = getExerciseConfig(id || 'default');

    useEffect(() => {
        const initMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

            poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numPoses: 1,
                minPoseDetectionConfidence: 0.8,
                minPosePresenceConfidence: 0.8,
                minTrackingConfidence: 0.8,
            });

            setLoaded(true);
        };

        initMediaPipe();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
        };
    }, []);

    const enableCam = async () => {
        if (!poseLandmarkerRef.current || !videoRef.current) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
            });
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
        } catch (err) {
            console.error(err);
        }
    };

    const isVisible = (landmark: NormalizedLandmark) => (landmark.visibility ?? 1) > 0.6;

    // Side Swapper Helper
    // If user selects "Right", we swap Left(11,13,15...) with Right(12,14,16...) landmarks logic?
    // OR we just assume the config has the correct indices. 
    // To be truly universal, let's just mirror the indices if the config is built for "left" (default) but side is "right".
    // Left: 1,3,5 (eye), 7(ear), 9(mouth), 11(sho), 13(elb), 15(wri), 17(pinky), 19(index), 21(thumb), 23(hip), 25(knee), 27(ank), 29(heel), 31(foot)
    // Right: even numbers +1. 
    // Note: MediaPipe uses: Left=Odd, Right=Even (11=Left Shoulder, 12=Right Shoulder).
    // Actually: 11=Left, 12=Right. 
    const getLandmark = (landmarks: NormalizedLandmark[], index: number, side: 'left' | 'right') => {
        // If the config assumes "Left" indices (odd usually), but we want "Right"
        // We can just swap 11<->12, 13<->14, etc.
        // Simple map for swapping
        if (side === 'left') return landmarks[index];

        // Swap Logic (Simple version for limbs)
        // 11<=>12, 13<=>14, 15<=>16, 23<=>24, 25<=>26, 27<=>28
        const map: Record<number, number> = {
            11: 12, 12: 11,
            13: 14, 14: 13,
            15: 16, 16: 15,
            23: 24, 24: 23,
            25: 26, 26: 25,
            27: 28, 28: 27,
            29: 30, 30: 29,
            31: 32, 32: 31
        };
        const newIndex = map[index] ?? index;
        return landmarks[newIndex];
    };

    const predictWebcam = () => {
        if (!poseLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;

        let startTimeMs = performance.now();
        if (lastTimeRef.current > 0) {
            // 
        }

        const result = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const drawingUtils = new DrawingUtils(canvasCtx);

        const currentSide = activeSideRef.current;
        let currentFeedback = null;

        if (result.landmarks.length > 0) {
            for (const landmark of result.landmarks) {
                // 1. Positioning Check
                // Use config's required landmarks, tailored to side
                const requiredIndices = config.requiredLandmarks || [11, 12, 23, 24];
                const mappedIndices = requiredIndices.map(i => getLandmark(landmark, i, currentSide) === landmark[i] ? i : (i % 2 === 0 ? i - 1 : i + 1)); // rough check

                // Better: iterate config requirements, swap index if needed, check visibility
                let allVisible = true;
                for (const idx of requiredIndices) {
                    const lm = getLandmark(landmark, idx, currentSide);
                    if (!lm || !isVisible(lm)) allVisible = false;
                }

                if (!allVisible) {
                    currentFeedback = "Adjust position. Body parts not visible.";
                }

                // 2. Draw Skeleton
                for (const conn of config.connections) {
                    // Get actual landmarks
                    const startLm = getLandmark(landmark, conn.start, currentSide);
                    const endLm = getLandmark(landmark, conn.end, currentSide);

                    if (startLm && endLm && isVisible(startLm) && isVisible(endLm)) {
                        drawingUtils.drawConnectors([startLm, endLm], [{ start: 0, end: 1 }], { color: '#ffffff', lineWidth: 4 });
                        drawingUtils.drawLandmarks([startLm, endLm], { color: '#FF0000', lineWidth: 2, radius: 4 });
                    }
                }

                // 3. Metric & Counting
                if (!currentFeedback) {
                    // Create a virtual landmark list where indices are swapped if needed
                    // So calculateMetric can just use [11], [13] etc and get the Right side if activeSide=Right
                    const virtualLandmarks = [...landmark];

                    // Simple swap for common limbs AND face (for neck stretches)
                    if (currentSide === 'right') {
                        const pairs = [
                            [1, 4], [2, 5], [3, 6], // Eyes
                            [7, 8], // Ears
                            [9, 10], // Mouth
                            [11, 12], [13, 14], [15, 16], // Arms
                            [23, 24], [25, 26], [27, 28], [29, 30], [31, 32] // Legs
                        ];
                        pairs.forEach(([l, r]) => {
                            const temp = virtualLandmarks[l];
                            virtualLandmarks[l] = virtualLandmarks[r];
                            virtualLandmarks[r] = temp;
                        });
                    }

                    const val = config.calculateMetric(virtualLandmarks);

                    // Display Metric
                    canvasCtx.font = "30px Arial";
                    canvasCtx.fillStyle = "white";
                    canvasCtx.fillText(Math.round(val).toString(), 50, 50);

                    // Logic
                    const now = Date.now();
                    const { thresholds } = config;

                    if (config.type === 'REPS') {
                        // Rep Logic
                        if (thresholds.start !== undefined && thresholds.end !== undefined) {

                            // Determine direction
                            const isAction = (v: number) => thresholds.end! < thresholds.start! ? v < thresholds.end! : v > thresholds.end!;
                            const isRest = (v: number) => thresholds.end! < thresholds.start! ? v > thresholds.start! : v < thresholds.start!;

                            if (isAction(val)) {
                                stageRef.current = 'HOLD'; // Using HOLD as "In Action"
                            }
                            if (stageRef.current === 'HOLD' && isRest(val)) {
                                if (now - lastTimeRef.current > 800) { // Debounce
                                    statsRef.current.count += 1;
                                    lastTimeRef.current = now;
                                    stageRef.current = 'START';
                                }
                            }
                        }
                    } else if (config.type === 'DURATION') {
                        // Timer logic
                        if (thresholds.min !== undefined && thresholds.max !== undefined) {
                            if (val >= thresholds.min && val <= thresholds.max) {
                                // In Position
                                if (stageRef.current !== 'HOLD') {
                                    stageRef.current = 'HOLD';
                                    lastTimeRef.current = now; // Start measuring hold time
                                } else {
                                    // Add delta
                                    const delta = (now - lastTimeRef.current) / 1000;
                                    if (delta >= 1) { // Apply every second
                                        statsRef.current.timer += 1;
                                        lastTimeRef.current = now;
                                    }
                                }

                                if (config.targetDuration && statsRef.current.timer >= config.targetDuration) {
                                    currentFeedback = "Great job! Switching sides...";

                                    // Auto-switch side after 2 seconds
                                    if (!autoSwitchScheduledRef.current) {
                                        autoSwitchScheduledRef.current = true;
                                        setTimeout(() => {
                                            setActiveSide(prev => prev === 'left' ? 'right' : 'left');
                                        }, 2000);
                                    }
                                }
                            } else {
                                stageRef.current = 'START'; // Not holding
                            }
                        }
                    }
                }
            }
        } else {
            currentFeedback = "No person detected.";
        }

        // Sync State
        if (feedbackRef.current !== currentFeedback) {
            setFeedback(currentFeedback);
            feedbackRef.current = currentFeedback; // using separate ref if needed or just relying on state in render
        }

        setStats(prev => {
            if (prev.count !== statsRef.current.count || prev.timer !== statsRef.current.timer) {
                return { ...statsRef.current };
            }
            return prev;
        });
        setStage(stageRef.current);

        canvasCtx.restore();
        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    useEffect(() => {
        if (loaded) enableCam();
    }, [loaded]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
            <div className="w-full max-w-7xl mb-4 flex items-center justify-between">
                <Button variant="ghost" className="text-white hover:text-emerald-400" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                        {exerciseDetails?.name || 'Exercise'}
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => setActiveSide('left')}
                            className={`${activeSide === 'left' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                        >
                            Left
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setActiveSide('right')}
                            className={`${activeSide === 'right' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                        >
                            Right
                        </Button>
                    </div>
                </div>
                <div className="w-[100px]"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
                {/* Left Panel: Camera */}
                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline></video>
                    <canvas ref={canvasRef} width="640" height="480" className="absolute inset-0 w-full h-full object-cover"></canvas>

                    {feedback && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                            <div className={`text-center p-6 bg-black/50 rounded-xl border ${feedback.includes('Great') ? 'border-emerald-500/50' : 'border-yellow-500/30'}`}>
                                {feedback.includes('Great') ? (
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                                ) : (
                                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2 animate-bounce" />
                                )}
                                <h3 className={`text-xl font-bold ${feedback.includes('Great') ? 'text-emerald-100' : 'text-yellow-100'}`}>{feedback}</h3>
                            </div>
                        </div>
                    )}

                    {/* Stats Overlay */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                        <div className="uppercase text-xs text-gray-400 font-bold tracking-wider mb-1">{config.type}</div>
                        <div className="text-5xl font-mono font-bold text-emerald-400 tabular-nums leading-none">
                            {config.type === 'REPS' ? stats.count : `${stats.timer}s`}
                        </div>
                    </div>

                    {!loaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-emerald-400 font-medium animate-pulse">Initializing AI...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Instructions */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            Instructions
                        </h3>
                        <div className="space-y-4">
                            {exerciseDetails?.instructions?.map((step, index) => (
                                <div key={index} className="flex gap-3 text-sm group">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-emerald-400 font-bold flex items-center justify-center text-xs group-hover:bg-emerald-500/20 transition-colors">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                                        {step}
                                    </p>
                                </div>
                            ))}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tips</h4>
                                <p className="text-sm text-gray-400 italic">
                                    "{config.instruction}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalExerciseCounter;
