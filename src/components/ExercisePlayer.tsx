import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Exercise } from './ExerciseCard';
import { X, Play, Pause, SkipForward, Camera, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExercisePlayerProps {
  exercise: Exercise;
  onClose: () => void;
  onStartMotionDetection: () => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  onClose,
  onStartMotionDetection
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-5xl rounded-3xl shadow-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="gradient-primary px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-primary-foreground">
              {exercise.name}
            </h2>
            <p className="text-sm text-primary-foreground/80">{exercise.targetArea}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Video Section */}
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-secondary shadow-soft">
              <iframe
                src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=0&rel=0`}
                title={exercise.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Video Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="glass"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="hero"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => setCurrentStep(Math.min(currentStep + 1, exercise.instructions.length - 1))}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Step-by-Step Instructions
              </h3>
              <div className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer',
                      currentStep === index
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
                    )}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm',
                      currentStep === index
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {index + 1}
                    </div>
                    <p className={cn(
                      'text-sm leading-relaxed',
                      currentStep === index ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 bg-secondary rounded-xl">
              <h4 className="font-medium text-foreground mb-2">Benefits</h4>
              <ul className="space-y-1">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Motion Detection CTA */}
            <Button
              variant="accent"
              size="xl"
              className="w-full"
              onClick={onStartMotionDetection}
            >
              <Camera className="w-5 h-5 mr-2" />
              Start AI Motion Detection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePlayer;
