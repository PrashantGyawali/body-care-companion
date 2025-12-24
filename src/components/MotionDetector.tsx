import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Exercise } from './ExerciseCard';
import { X, Camera, CameraOff, Volume2, VolumeX, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MotionDetectorProps {
  exercise: Exercise;
  onClose: () => void;
}

interface FeedbackItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export const MotionDetector: React.FC<MotionDetectorProps> = ({ exercise, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [score, setScore] = useState(0);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        // Simulate AI feedback
        startSimulatedFeedback();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      addFeedback('warning', 'Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const addFeedback = (type: 'success' | 'warning' | 'info', message: string) => {
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };
    setFeedback(prev => [newFeedback, ...prev].slice(0, 5));

    // Speak feedback if not muted
    if (!isMuted) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const startSimulatedFeedback = () => {
    // Simulate MediaPipe-style feedback
    const feedbackMessages = [
      { type: 'info' as const, message: 'Position detected. Starting exercise tracking...' },
      { type: 'success' as const, message: 'Great form! Keep your back straight.' },
      { type: 'warning' as const, message: 'Try to extend your arm fully.' },
      { type: 'success' as const, message: 'Excellent! Rep 1 complete.' },
      { type: 'success' as const, message: 'Perfect range of motion!' },
      { type: 'info' as const, message: 'Hold this position for 3 seconds...' },
      { type: 'success' as const, message: 'Well done! Rep 2 complete.' },
    ];

    feedbackMessages.forEach((fb, index) => {
      setTimeout(() => {
        addFeedback(fb.type, fb.message);
        if (fb.message.includes('complete')) {
          setReps(prev => prev + 1);
          setScore(prev => Math.min(100, prev + 15));
        } else if (fb.type === 'success') {
          setScore(prev => Math.min(100, prev + 5));
        }
      }, (index + 1) * 3000);
    });
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-6xl rounded-3xl shadow-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="gradient-primary px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-primary-foreground">
              AI Motion Detection
            </h2>
            <p className="text-sm text-primary-foreground/80">{exercise.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* Camera View */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-secondary rounded-2xl overflow-hidden shadow-soft">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  'w-full h-full object-cover scale-x-[-1]',
                  !isCameraActive && 'hidden'
                )}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-center px-4">
                    Enable your camera to start AI-powered motion detection
                  </p>
                  <Button variant="hero" size="lg" onClick={startCamera}>
                    <Camera className="w-5 h-5 mr-2" />
                    Enable Camera
                  </Button>
                </div>
              )}

              {/* Score overlay */}
              {isCameraActive && (
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft">
                    <p className="text-xs text-muted-foreground">Reps</p>
                    <p className="text-2xl font-bold text-primary">{reps}</p>
                  </div>
                  <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft">
                    <p className="text-xs text-muted-foreground">Form Score</p>
                    <p className={cn(
                      'text-2xl font-bold',
                      score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      {score}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera controls */}
            {isCameraActive && (
              <div className="flex justify-center gap-3">
                <Button variant="destructive" onClick={stopCamera}>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current instruction */}
            <div className="bg-secondary rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-2">Current Step</h4>
              <p className="text-sm text-muted-foreground">
                {exercise.instructions[currentStep]}
              </p>
              <div className="flex gap-1 mt-3">
                {exercise.instructions.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Real-time feedback */}
            <div className="bg-secondary rounded-xl p-4">
              <h4 className="font-medium text-foreground mb-3">AI Feedback</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {feedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Start the exercise to receive real-time feedback...
                  </p>
                ) : (
                  feedback.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-2 p-2 rounded-lg animate-slide-up',
                        item.type === 'success' && 'bg-green-500/10',
                        item.type === 'warning' && 'bg-yellow-500/10',
                        item.type === 'info' && 'bg-primary/10'
                      )}
                    >
                      {getFeedbackIcon(item.type)}
                      <p className="text-sm text-foreground">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <h4 className="font-medium text-primary mb-2">💡 Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Position yourself so your full body is visible</li>
                <li>• Ensure good lighting for accurate detection</li>
                <li>• Follow the audio cues for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionDetector;
