import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Square, StopCircle } from 'lucide-react';
import { getExerciseConfig, ExerciseType } from '../utils/exercise-configs';
import { getExercisesForBodyPart, exerciseDatabase } from '../data/exercises';
import { saveSession, savePainRecord, Achievement } from '../utils/progressStore';
import SessionSummary from './SessionSummary';
import PainRatingModal from './PainRatingModal';
import { initVoiceCoach, resetVoiceCoach, announceStart, onRepComplete, onHoldProgress, announceCompletion } from '../utils/voiceCoach';

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
    const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');

    // Session tracking state  
    const [showSummary, setShowSummary] = useState(false);
    const [sessionStartTime] = useState(Date.now());
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
    const [formScores, setFormScores] = useState<number[]>([]);
    const [sessionData, setSessionData] = useState<{
        exerciseName: string;
        reps: number;
        duration: number;
        formScore: number;
        targetArea: string;
    } | null>(null);

    // Pain tracking state
    const [exercisePhase, setExercisePhase] = useState<'pain-before' | 'exercising' | 'pain-after' | 'complete'>(
        'pain-before'
    );
    const [painBefore, setPainBefore] = useState<number>(0);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Real-time form tracking
    const [liveFormScore, setLiveFormScore] = useState(100);
    const formScoreRef = useRef<number[]>([]);

    // Form quality tracking for dynamic scoring
    const lastMetricValueRef = useRef<number>(0);
    const metricHistoryRef = useRef<number[]>([]);

    // Voice coach tracking
    const lastRepAnnouncedRef = useRef(0);
    const lastHoldSecondRef = useRef(0);
    const hasAnnouncedStartRef = useRef(false);

    // Handle pain rating before starting
    const handlePainBeforeComplete = (painLevel: number) => {
        setPainBefore(painLevel);
        if (painLevel > 0) {
            savePainRecord({
                sessionId: null,
                painLevel,
                bodyPart: exerciseDetails?.targetArea || 'general',
                timing: 'before',
            });
        }
        setExercisePhase('exercising');
        // Announce start after pain rating
        if (!hasAnnouncedStartRef.current) {
            hasAnnouncedStartRef.current = true;
            announceStart();
        }
    };

    // Handle pain rating after exercise
    const handlePainAfterComplete = (painLevel: number) => {
        if (painLevel > 0 && currentSessionId) {
            savePainRecord({
                sessionId: currentSessionId,
                painLevel,
                bodyPart: exerciseDetails?.targetArea || 'general',
                timing: 'after',
            });
        }
        setExercisePhase('complete');
        setShowSummary(true);
    };

    // Handle ending the exercise
    const handleEndExercise = () => {
        // Stop the animation frame
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        // Stop the video stream
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        // Announce completion
        announceCompletion();

        // Calculate session data
        const duration = Math.round((Date.now() - sessionStartTime) / 1000);
        const reps = statsRef.current.count;
        const timer = statsRef.current.timer;

        // Calculate form score from tracked scores
        const formScore = formScoreRef.current.length > 0
            ? Math.round(formScoreRef.current.reduce((a, b) => a + b, 0) / formScoreRef.current.length)
            : Math.min(100, Math.round(
                config.type === 'REPS'
                    ? Math.min(100, reps * 20 + 40)
                    : Math.min(100, (timer / Math.max(1, duration)) * 100 + 20)
            ));

        const data = {
            exerciseName: exerciseDetails?.name || 'Unknown Exercise',
            reps: config.type === 'REPS' ? reps : timer,
            duration,
            formScore,
            targetArea: exerciseDetails?.targetArea || 'general',
            exerciseType: config.type, // Add exercise type for display
        };

        setSessionData(data);

        // Save the session and get achievements
        const achievements = saveSession({
            exerciseId: id || 'unknown',
            exerciseName: data.exerciseName,
            reps: data.reps,
            duration: data.duration,
            formScore: data.formScore,
            targetArea: data.targetArea,
        });

        setCurrentSessionId(`session_${Date.now()}`);
        setNewAchievements(achievements);

        // Show pain-after rating before summary
        setExercisePhase('pain-after');
    };

    // Refs for Loop
    const statsRef = useRef({ count: 0, timer: 0 });
    const stageRef = useRef<'START' | 'END' | 'HOLD' | null>(null);
    const lastTimeRef = useRef<number>(0);
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
    const requestRef = useRef<number>(null);
    const activeSideRef = useRef<'left' | 'right'>('left');
    const feedbackRef = useRef<string | null>(null);
    const autoSwitchScheduledRef = useRef(false);
    const lastSpokenRef = useRef<string | null>(null);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        activeSideRef.current = activeSide;
        // Reset all state when side changes
        statsRef.current = { count: 0, timer: 0 };
        setStats({ count: 0, timer: 0 });
        stageRef.current = null;
        lastTimeRef.current = 0;
        feedbackRef.current = null;
        setFeedback(null);
        autoSwitchScheduledRef.current = false;
        lastSpokenRef.current = null; // Reset TTS so messages can be spoken again
        // Cancel any pending speech when switching sides
        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        window.speechSynthesis?.cancel();
    }, [activeSide]);

    // Load Config
    // Note: If ID depends on side (e.g. left vs right knee), we might need to swap configs.
    // For simplicity, we assume the config handles landmarks relative to body, OR we offset them.
    // Let's implement simple index swapping for Side Support.
    const config = getExerciseConfig(id || 'default');

    useEffect(() => {
        const loadVoices = () => {
            // ... existing voice load logic
            const voices = window.speechSynthesis?.getVoices() || [];
            // ...
        };

        // Initialize voice coach
        initVoiceCoach();

        return () => {
            resetVoiceCoach();
        };
    }, []);

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
    }, []);
    // ...




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

                // 2. Draw Skeleton with Dynamic Colors based on Form Quality
                // Determine skeleton color based on live form score
                const getFormColor = (score: number): string => {
                    if (score >= 80) return '#22c55e'; // Green - Excellent form
                    if (score >= 50) return '#eab308'; // Yellow - Needs adjustment
                    return '#ef4444'; // Red - Poor form
                };

                const skeletonColor = getFormColor(liveFormScore);
                const jointColor = liveFormScore >= 80 ? '#10b981' : liveFormScore >= 50 ? '#f59e0b' : '#dc2626';

                for (const conn of config.connections) {
                    // Get actual landmarks
                    const startLm = getLandmark(landmark, conn.start, currentSide);
                    const endLm = getLandmark(landmark, conn.end, currentSide);

                    if (startLm && endLm && isVisible(startLm) && isVisible(endLm)) {
                        drawingUtils.drawConnectors([startLm, endLm], [{ start: 0, end: 1 }], { color: skeletonColor, lineWidth: 4 });
                        drawingUtils.drawLandmarks([startLm, endLm], { color: jointColor, lineWidth: 2, radius: 4 });
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

                    // Calculate dynamic form quality
                    let formQuality = 100;

                    // Factor 1: Visibility (40 points)
                    const visibilityScore = allVisible ? 40 : 20;

                    // Factor 2: Position accuracy (30 points)
                    let positionScore = 30;
                    if (config.type === 'REPS') {
                        // Check if in the middle of proper range
                        const { start, end } = config.thresholds;
                        if (start !== undefined && end !== undefined) {
                            const range = Math.abs(end - start);
                            const mid = (start + end) / 2;
                            const deviation = Math.abs(val - mid) / range;
                            positionScore = Math.max(10, 30 - deviation * 20);
                        }
                    } else {
                        // DURATION: check if within target range
                        const { min, max } = config.thresholds;
                        if (min !== undefined && max !== undefined) {
                            if (val >= min && val <= max) {
                                positionScore = 30;
                            } else {
                                const distance = val < min ? (min - val) : (val - max);
                                positionScore = Math.max(10, 30 - distance);
                            }
                        }
                    }

                    // Factor 3: Movement smoothness (30 points)
                    let smoothnessScore = 30;
                    metricHistoryRef.current.push(val);
                    if (metricHistoryRef.current.length > 10) {
                        metricHistoryRef.current.shift();
                    }
                    if (metricHistoryRef.current.length >= 3) {
                        // Calculate variance - lower variance = smoother = better
                        const recent = metricHistoryRef.current.slice(-5);
                        const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
                        const variance = recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length;
                        const normalizedVariance = Math.min(variance / 100, 1); // Normalize to 0-1
                        smoothnessScore = Math.max(15, 30 - normalizedVariance * 15);
                    }

                    formQuality = Math.round(Math.max(60, Math.min(100, visibilityScore + positionScore + smoothnessScore)));
                    setLiveFormScore(formQuality);

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

                                    // Voice coach - announce rep completion
                                    if (statsRef.current.count !== lastRepAnnouncedRef.current) {
                                        lastRepAnnouncedRef.current = statsRef.current.count;
                                        onRepComplete(statsRef.current.count);
                                    }

                                    // Track form score at rep completion
                                    formScoreRef.current.push(formQuality);
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

                                        // Update state to trigger re-render for live timer display
                                        setStats({ ...statsRef.current });

                                        // Voice coach - announce hold progress (every 5 seconds)
                                        const timer = statsRef.current.timer;
                                        if (timer % 5 === 0 && timer !== lastHoldSecondRef.current) {
                                            lastHoldSecondRef.current = timer;
                                            onHoldProgress(timer);
                                        }

                                        // Track good form score during hold
                                        formScoreRef.current.push(formQuality);
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
            feedbackRef.current = currentFeedback;

            // Text-to-Speech feedback
            if (currentFeedback && currentFeedback !== lastSpokenRef.current) {
                // Clear any pending speech timeout
                if (speechTimeoutRef.current) {
                    clearTimeout(speechTimeoutRef.current);
                }

                // Debounce speech to avoid rapid repetition
                speechTimeoutRef.current = setTimeout(() => {
                    if (window.speechSynthesis) {
                        // Cancel any ongoing speech
                        window.speechSynthesis.cancel();

                        const utterance = new SpeechSynthesisUtterance(currentFeedback);
                        utterance.rate = 1.0;
                        utterance.pitch = 1.1;
                        utterance.volume = 1.0;

                        // Use preloaded female voice
                        if (femaleVoiceRef.current) {
                            utterance.voice = femaleVoiceRef.current;
                        }

                        window.speechSynthesis.speak(utterance);
                        lastSpokenRef.current = currentFeedback;
                    }
                }, 500); // 500ms debounce
            }
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

    useEffect(() => {
        if (loaded) enableCam();
    }, [loaded]);

    return (
        <div className="flex flex-col items-center bg-neutral-950 text-white p-2 min-h-screen">
            <div className="w-full max-w-7xl mb-2 flex items-center justify-between">
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
                <Button
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleEndExercise}
                >
                    <StopCircle className="mr-2 h-4 w-4" /> End Exercise
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                {/* Left Panel: Camera */}
                <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/50" style={{ maxHeight: '80vh', aspectRatio: '4/3' }}>
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        style={{ transform: 'scaleX(-1)' }}
                    ></video>
                    <canvas
                        ref={canvasRef}
                        width="640"
                        height="480"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    ></canvas>

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
                        {/* Live Form Quality Score */}
                        {exercisePhase === 'exercising' && (
                            <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-gray-400 font-medium">Form Quality</span>
                                    <span className={`text-lg font-bold ${liveFormScore >= 80 ? 'text-green-400' :
                                        liveFormScore >= 50 ? 'text-yellow-400' :
                                            'text-red-400'
                                        }`}>
                                        {liveFormScore}%
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${liveFormScore >= 80 ? 'bg-green-400' :
                                            liveFormScore >= 50 ? 'bg-yellow-400' :
                                                'bg-red-400'
                                            }`}
                                        style={{ width: `${liveFormScore}%` }}
                                    />
                                </div>
                            </div>
                        )}
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
                <div className="w-full lg:w-72 flex flex-col gap-2 overflow-hidden" style={{ maxHeight: '80vh' }}>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-1 overflow-y-auto">
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

                            {/* Exercise Demo GIF */}
                            {exerciseDetails && (exerciseDetails.gifMale || exerciseDetails.gifFemale) && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Demo</h4>
                                        <div className="flex gap-1">
                                            {exerciseDetails.gifMale && (
                                                <button
                                                    onClick={() => setSelectedGender('male')}
                                                    className={`px-2 py-1 text-xs rounded ${selectedGender === 'male' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                                                >
                                                    Male
                                                </button>
                                            )}
                                            {exerciseDetails.gifFemale && (
                                                <button
                                                    onClick={() => setSelectedGender('female')}
                                                    className={`px-2 py-1 text-xs rounded ${selectedGender === 'female' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                                                >
                                                    Female
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <img
                                        src={selectedGender === 'male' ? exerciseDetails.gifMale : exerciseDetails.gifFemale}
                                        alt={`${exerciseDetails.name} demo`}
                                        className="rounded-lg border border-white/10 h-[175px] mx-auto"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pain Rating Modal - Before Exercise */}
            <PainRatingModal
                isOpen={exercisePhase === 'pain-before'}
                onClose={() => setExercisePhase('exercising')}
                onComplete={handlePainBeforeComplete}
                timing="before"
                bodyPart={exerciseDetails?.targetArea || 'general'}
            />

            {/* Pain Rating Modal - After Exercise */}
            <PainRatingModal
                isOpen={exercisePhase === 'pain-after'}
                onClose={() => {
                    setExercisePhase('complete');
                    setShowSummary(true);
                }}
                onComplete={handlePainAfterComplete}
                timing="after"
                bodyPart={exerciseDetails?.targetArea || 'general'}
                sessionId={currentSessionId || undefined}
            />

            {/* Session Summary Modal */}
            {sessionData && (
                <SessionSummary
                    isOpen={showSummary && exercisePhase === 'complete'}
                    onClose={() => {
                        setShowSummary(false);
                        navigate('/');
                    }}
                    sessionData={sessionData}
                    newAchievements={newAchievements}
                />
            )}
        </div>
    );
};

export default UniversalExerciseCounter;
