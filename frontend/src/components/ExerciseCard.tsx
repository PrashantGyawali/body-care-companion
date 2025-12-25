import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Clock, Target, ChevronRight, Camera } from 'lucide-react';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetArea: string;
  youtubeId: string;
  thumbnail?: string; // Optional custom thumbnail path (relative to public folder)
  gifMale?: string; // Optional GIF for male demonstration
  gifFemale?: string; // Optional GIF for female demonstration
  instructions: string[];
  benefits: string[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  onStartExercise: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onStartExercise }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);



  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="gradient-card rounded-2xl shadow-card border border-border overflow-hidden hover:shadow-glow transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        <img
          src={exercise.thumbnail || `https://img.youtube.com/vi/${exercise.youtubeId}/maxresdefault.jpg`}
          alt={exercise.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback to YouTube thumbnail if custom thumbnail fails
            if (!e.currentTarget.src.includes('youtube.com')) {
              e.currentTarget.src = `https://img.youtube.com/vi/${exercise.youtubeId}/maxresdefault.jpg`;
            } else if (e.currentTarget.src.includes('maxresdefault')) {
              e.currentTarget.src = `https://img.youtube.com/vi/${exercise.youtubeId}/hqdefault.jpg`;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border',
              getDifficultyColor(exercise.difficulty)
            )}>
              {exercise.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{exercise.duration}</span>
          </div>
        </div>

        {/* Play button overlay */}
        <button
          onClick={() => onStartExercise(exercise)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
            {exercise.name}
          </h3>
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            <Target className="w-3 h-3" />
            {exercise.targetArea}
          </span>
        </div>

        <div className="mb-4">
          <p className={cn(
            "text-sm text-muted-foreground",
            !isDescriptionExpanded && "line-clamp-1"
          )}>
            {exercise.description}
          </p>
        </div>

        {/* Expandable section */}
        <div className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-96' : 'max-h-0'
        )}>
          <div className="pt-4 border-t border-border space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Instructions:</h4>
              <ol className="space-y-1">
                {exercise.instructions.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary font-medium">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Benefits:</h4>
              <ul className="space-y-1">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={() => onStartExercise(exercise)}
            variant="hero"
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Start with AI
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsExpanded(!isExpanded)
              setIsDescriptionExpanded(!isDescriptionExpanded);
            }}
            className={cn(
              'transition-transform duration-300',
              isExpanded && 'rotate-90'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
