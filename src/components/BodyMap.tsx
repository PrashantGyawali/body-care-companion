import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface BodyPart {
  id: string;
  name: string;
  path: string;
  side: 'front' | 'back';
}

// SVG paths for body parts - simplified and interactive
const bodyPartsData: BodyPart[] = [
  // Front body - Head
  { id: 'head', name: 'Head', path: 'M 100 30 C 80 30, 70 50, 70 70 C 70 90, 85 105, 100 105 C 115 105, 130 90, 130 70 C 130 50, 120 30, 100 30 Z', side: 'front' },
  
  // Front body - Neck
  { id: 'neck', name: 'Neck', path: 'M 90 105 L 90 125 L 110 125 L 110 105 Z', side: 'front' },
  
  // Front body - Shoulders
  { id: 'left_shoulder', name: 'Left Shoulder', path: 'M 110 125 Q 140 130, 145 145 L 130 150 Q 120 140, 110 140 Z', side: 'front' },
  { id: 'right_shoulder', name: 'Right Shoulder', path: 'M 90 125 Q 60 130, 55 145 L 70 150 Q 80 140, 90 140 Z', side: 'front' },
  
  // Front body - Chest
  { id: 'chest', name: 'Chest', path: 'M 70 145 L 70 200 L 130 200 L 130 145 Q 110 140, 100 140 Q 90 140, 70 145 Z', side: 'front' },
  
  // Front body - Abdominal
  { id: 'abdominal', name: 'Abdominal', path: 'M 70 200 L 70 260 L 130 260 L 130 200 Z', side: 'front' },
  
  // Front body - Arms
  { id: 'left_upper_arm', name: 'Left Upper Arm', path: 'M 130 150 L 145 145 L 155 200 L 140 205 Z', side: 'front' },
  { id: 'right_upper_arm', name: 'Right Upper Arm', path: 'M 70 150 L 55 145 L 45 200 L 60 205 Z', side: 'front' },
  { id: 'left_elbow', name: 'Left Elbow', path: 'M 140 205 L 155 200 L 160 230 L 145 235 Z', side: 'front' },
  { id: 'right_elbow', name: 'Right Elbow', path: 'M 60 205 L 45 200 L 40 230 L 55 235 Z', side: 'front' },
  { id: 'left_forearm', name: 'Left Forearm', path: 'M 145 235 L 160 230 L 165 290 L 150 295 Z', side: 'front' },
  { id: 'right_forearm', name: 'Right Forearm', path: 'M 55 235 L 40 230 L 35 290 L 50 295 Z', side: 'front' },
  { id: 'left_hand', name: 'Left Hand', path: 'M 150 295 L 165 290 L 170 330 L 155 335 L 145 320 Z', side: 'front' },
  { id: 'right_hand', name: 'Right Hand', path: 'M 50 295 L 35 290 L 30 330 L 45 335 L 55 320 Z', side: 'front' },
  
  // Front body - Groin
  { id: 'groin', name: 'Hip/Groin', path: 'M 70 260 L 70 290 L 100 300 L 130 290 L 130 260 Z', side: 'front' },
  
  // Front body - Legs
  { id: 'left_thigh', name: 'Left Thigh', path: 'M 100 300 L 130 290 L 135 380 L 105 385 Z', side: 'front' },
  { id: 'right_thigh', name: 'Right Thigh', path: 'M 100 300 L 70 290 L 65 380 L 95 385 Z', side: 'front' },
  { id: 'left_knee', name: 'Left Knee', path: 'M 105 385 L 135 380 L 138 420 L 108 425 Z', side: 'front' },
  { id: 'right_knee', name: 'Right Knee', path: 'M 95 385 L 65 380 L 62 420 L 92 425 Z', side: 'front' },
  { id: 'left_shin', name: 'Left Shin', path: 'M 108 425 L 138 420 L 140 510 L 110 515 Z', side: 'front' },
  { id: 'right_shin', name: 'Right Shin', path: 'M 92 425 L 62 420 L 60 510 L 90 515 Z', side: 'front' },
  { id: 'left_ankle', name: 'Left Ankle', path: 'M 110 515 L 140 510 L 142 540 L 112 545 Z', side: 'front' },
  { id: 'right_ankle', name: 'Right Ankle', path: 'M 90 515 L 60 510 L 58 540 L 88 545 Z', side: 'front' },
  { id: 'left_foot', name: 'Left Foot', path: 'M 112 545 L 142 540 L 150 570 L 110 570 Z', side: 'front' },
  { id: 'right_foot', name: 'Right Foot', path: 'M 88 545 L 58 540 L 50 570 L 90 570 Z', side: 'front' },
  
  // Back body - using offset of 220
  { id: 'back_head', name: 'Back of Head', path: 'M 320 30 C 300 30, 290 50, 290 70 C 290 90, 305 105, 320 105 C 335 105, 350 90, 350 70 C 350 50, 340 30, 320 30 Z', side: 'back' },
  { id: 'back_neck', name: 'Back of Neck', path: 'M 310 105 L 310 125 L 330 125 L 330 105 Z', side: 'back' },
  { id: 'upper_back', name: 'Upper Back', path: 'M 290 145 L 290 200 L 350 200 L 350 145 Q 330 140, 320 140 Q 310 140, 290 145 Z', side: 'back' },
  { id: 'spine', name: 'Lower Back / Spine', path: 'M 290 200 L 290 260 L 350 260 L 350 200 Z', side: 'back' },
  { id: 'buttocks', name: 'Buttocks', path: 'M 290 260 L 290 310 L 320 320 L 350 310 L 350 260 Z', side: 'back' },
  { id: 'left_hamstring', name: 'Left Hamstring', path: 'M 320 320 L 350 310 L 355 400 L 325 405 Z', side: 'back' },
  { id: 'right_hamstring', name: 'Right Hamstring', path: 'M 320 320 L 290 310 L 285 400 L 315 405 Z', side: 'back' },
  { id: 'left_calf', name: 'Left Calf', path: 'M 325 440 L 358 435 L 360 520 L 330 525 Z', side: 'back' },
  { id: 'right_calf', name: 'Right Calf', path: 'M 315 440 L 282 435 L 280 520 L 310 525 Z', side: 'back' },
];

interface BodyMapProps {
  onBodyPartSelect: (part: { id: string; name: string }) => void;
  selectedParts: string[];
}

export const BodyMap: React.FC<BodyMapProps> = ({ onBodyPartSelect, selectedParts }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const getPartStyle = (partId: string) => {
    const isSelected = selectedParts.includes(partId);
    const isHovered = hoveredPart === partId;
    
    if (isSelected) {
      return {
        fill: 'hsl(var(--accent) / 0.6)',
        stroke: 'hsl(var(--accent))',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 8px hsl(var(--accent) / 0.5))',
      };
    }
    if (isHovered) {
      return {
        fill: 'hsl(var(--primary) / 0.4)',
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.3))',
      };
    }
    return {
      fill: 'hsl(var(--primary) / 0.15)',
      stroke: 'hsl(var(--primary) / 0.3)',
      strokeWidth: 1,
    };
  };

  const frontParts = bodyPartsData.filter(p => p.side === 'front');
  const backParts = bodyPartsData.filter(p => p.side === 'back');

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-3xl shadow-card border border-border p-6 md:p-8">
        <svg
          viewBox="0 0 420 600"
          className="w-full h-auto max-h-[600px]"
          style={{ aspectRatio: '420/600' }}
        >
          <defs>
            <linearGradient id="bodyBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--muted))" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="420" height="600" rx="20" fill="url(#bodyBg)" />

          {/* Labels */}
          <text x="100" y="590" textAnchor="middle" className="fill-muted-foreground text-sm font-medium" fontSize="14">
            Front
          </text>
          <text x="320" y="590" textAnchor="middle" className="fill-muted-foreground text-sm font-medium" fontSize="14">
            Back
          </text>

          {/* Divider */}
          <line x1="210" y1="20" x2="210" y2="575" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />

          {/* Front body parts */}
          {frontParts.map((part) => {
            const style = getPartStyle(part.id);
            return (
              <path
                key={part.id}
                d={part.path}
                style={{
                  ...style,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={() => onBodyPartSelect({ id: part.id, name: part.name })}
              />
            );
          })}

          {/* Back body parts */}
          {backParts.map((part) => {
            const style = getPartStyle(part.id);
            return (
              <path
                key={part.id}
                d={part.path}
                style={{
                  ...style,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={() => onBodyPartSelect({ id: part.id, name: part.name })}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPart && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-card border border-border animate-fade-in z-10">
            <span className="text-sm font-medium text-foreground">
              {bodyPartsData.find(p => p.id === hoveredPart)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Selected parts indicator */}
      {selectedParts.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center animate-slide-up">
          {selectedParts.map((partId) => {
            const part = bodyPartsData.find(p => p.id === partId);
            return (
              <span
                key={partId}
                className="px-4 py-2 gradient-primary text-primary-foreground rounded-full text-sm font-medium shadow-glow"
              >
                {part?.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BodyMap;
