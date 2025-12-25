import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

// Define connections for specific body parts
// MediaPipe landmarks: 11=left_shoulder, 13=left_elbow, 15=left_wrist
// 12=right_shoulder, 14=right_elbow, 16=right_wrist
const LEFT_ARM_CONNECTIONS = [
    { start: 11, end: 13 },
    { start: 13, end: 15 }
];

const RIGHT_ARM_CONNECTIONS = [
    { start: 12, end: 14 },
    { start: 14, end: 16 }
];

const BicepCurlCounter: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [count, setCount] = useState(0);
    const [stage, setStage] = useState<'UP' | 'DOWN' | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [selectedArm, setSelectedArm] = useState<'left' | 'right'>('left');
    const [feedback, setFeedback] = useState<string | null>(null);

    // Refs for logic loop
    const countRef = useRef(0);
    const stageRef = useRef<'UP' | 'DOWN' | null>(null);
    // Track arm selection in ref for loop access without closure staleness
    const selectedArmRef = useRef<'left' | 'right'>('left');
    const feedbackRef = useRef<string | null>(null);
    const lastCountTimeRef = useRef<number>(0);

    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
    const requestRef = useRef<number>(null);
    const navigate = useNavigate();

    // Update ref when state changes
    useEffect(() => {
        selectedArmRef.current = selectedArm;
        // Reset count on arm switch? Optional. Let's reset for clarity.
        countRef.current = 0;
        stageRef.current = null;
        setCount(0);
        setStage(null);
    }, [selectedArm]);

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
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (poseLandmarkerRef.current) {
                poseLandmarkerRef.current.close();
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const calculateAngle = (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) {
            angle = 360 - angle;
        }
        return angle;
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
            console.error('Error accessing webcam:', err);
        }
    };

    const isVisible = (landmark: NormalizedLandmark) => {
        // Check visibility score standard (usually > 0.5 is good) and constraints
        return (landmark.visibility ?? 1) > 0.5;
    };

    const predictWebcam = () => {
        if (!poseLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;

        if (videoRef.current.videoWidth === 0) {
            requestRef.current = requestAnimationFrame(predictWebcam);
            return;
        }

        const startTimeMs = performance.now();
        const result = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const drawingUtils = new DrawingUtils(canvasCtx);
        const activeArm = selectedArmRef.current;
        let currentFeedback = null;

        if (result.landmarks.length > 0) {
            for (const landmark of result.landmarks) {
                // Positioning Check
                // 11: left shoulder, 12: right shoulder, 23: left hip, 24: right hip
                const leftShoulder = landmark[11];
                const rightShoulder = landmark[12];
                const leftHip = landmark[23];
                const rightHip = landmark[24];

                // If any of these are not visible or out of frame (roughly)
                const requiredLandmarks = [leftShoulder, rightShoulder, leftHip, rightHip];
                const isPositionBad = requiredLandmarks.some(lm => !lm || !isVisible(lm));

                if (isPositionBad) {
                    currentFeedback = "Move back! Show full upper body.";
                    // Optionally draw a box or warning color
                } else {
                    // Check bounds strictly if needed, usually visibility is enough for 'cut off'
                    // but let's check y < 1 to ensure hips are actually on screen
                    const areHipsOnScreen = leftHip.y < 1 && rightHip.y < 1;
                    if (!areHipsOnScreen) {
                        currentFeedback = "Move back! Hips not visible.";
                    }
                }

                if (currentFeedback) {
                    // Draw warning or stop processing logic
                    // We still draw the skeleton if possible to help user adjust
                }

                // Determine relevant landmarks based on active arm
                const isLeft = activeArm === 'left';
                const shoulderIdx = isLeft ? 11 : 12;
                const elbowIdx = isLeft ? 13 : 14;
                const wristIdx = isLeft ? 15 : 16;
                const connectionList = isLeft ? LEFT_ARM_CONNECTIONS : RIGHT_ARM_CONNECTIONS;

                // Draw only specific connections
                for (const connection of connectionList) {
                    const startLandmark = landmark[connection.start];
                    const endLandmark = landmark[connection.end];

                    // Draw Connector
                    if (startLandmark && endLandmark) {
                        drawingUtils.drawConnectors(
                            [startLandmark, endLandmark],
                            [{ start: 0, end: 1 }],
                            { color: '#ffffff', lineWidth: 4 }
                        );
                    }
                    // Draw Landmarks
                    if (startLandmark) drawingUtils.drawLandmarks([startLandmark], { color: '#FF0000', lineWidth: 2, radius: 4 });
                    if (endLandmark) drawingUtils.drawLandmarks([endLandmark], { color: '#FF0000', lineWidth: 2, radius: 4 });
                }

                // Counting Logic - ONLY if positioning is good
                if (!currentFeedback) {
                    const shoulder = landmark[shoulderIdx];
                    const elbow = landmark[elbowIdx];
                    const wrist = landmark[wristIdx];

                    if (shoulder && elbow && wrist) {
                        const angle = calculateAngle(shoulder, elbow, wrist);

                        // Visualize Angle
                        canvasCtx.font = "30px Arial";
                        canvasCtx.fillStyle = "white";
                        canvasCtx.fillText(Math.round(angle).toString(),
                            elbow.x * canvasRef.current.width,
                            elbow.y * canvasRef.current.height
                        );

                        // Counting Logic
                        if (angle > 160) {
                            stageRef.current = "DOWN";
                        }
                        if (angle < 30 && stageRef.current === "DOWN") {
                            const now = Date.now();
                            // Debounce: Allow only 1 rep every 800ms
                            if (now - lastCountTimeRef.current > 800) {
                                stageRef.current = "UP";
                                countRef.current += 1;
                                lastCountTimeRef.current = now;
                            }
                        }
                    }
                }
            }
        } else {
            currentFeedback = "No person detected.";
        }

        // Update Feedback State
        if (feedbackRef.current !== currentFeedback) {
            feedbackRef.current = currentFeedback;
            setFeedback(currentFeedback);
        }

        setCount((prev) => {
            if (prev !== countRef.current) return countRef.current;
            return prev;
        });
        setStage((prev) => {
            if (prev !== stageRef.current) return stageRef.current;
            return prev;
        });

        canvasCtx.restore();
        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    useEffect(() => {
        if (loaded) {
            enableCam();
        }
    }, [loaded]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
            <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
                <Button variant="ghost" className="text-white hover:text-emerald-400" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                        AI Bicep Curl Counter
                    </h1>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setSelectedArm('left')}
                            className={`${selectedArm === 'left' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            Left Arm
                        </Button>
                        <Button
                            onClick={() => setSelectedArm('right')}
                            className={`${selectedArm === 'right' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            Right Arm
                        </Button>
                    </div>
                </div>
                <div className="w-[100px]"></div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    style={{ width: '640px', height: '480px', transform: 'scaleX(-1)' }}
                ></video>
                <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                ></canvas>

                {/* Feedback Overlay */}
                {feedback && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-4 p-8 text-center">
                            <AlertTriangle className="w-16 h-16 text-yellow-500 animate-bounce" />
                            <h2 className="text-3xl font-bold text-white">{feedback}</h2>
                            <p className="text-gray-300">Make sure your shoulders and hips are visible.</p>
                        </div>
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Reps ({selectedArm})</span>
                        <span className="text-4xl font-mono font-bold text-emerald-400">{count}</span>
                    </div>
                </div>

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex flex-col gap-1 text-right">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Status</span>
                        <span className={`text-2xl font-bold ${stage === 'UP' ? 'text-green-500' : 'text-blue-400'}`}>
                            {stage || "READY"}
                        </span>
                    </div>
                </div>

                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-emerald-400 font-medium animate-pulse">Loading AI Model...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-gray-400 max-w-lg text-center">
                <p>Perform bicep curls with your <span className="text-white font-bold uppercase">{selectedArm}</span> arm.</p>
            </div>
        </div>
    );
};

export default BicepCurlCounter;
