import { Exercise } from '@/components/ExerciseCard';

export const exerciseDatabase: Record<string, Exercise[]> = {
  // Neck exercises
  neck: [
    {
      id: 'neck-stretch-1',
      name: 'Gentle Neck Stretches',
      description: 'Basic neck mobility exercises to relieve tension and improve range of motion.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Neck',
      youtubeId: '2N1Nh7M8kpY',
      instructions: [
        'Sit or stand with good posture, shoulders relaxed',
        'Slowly tilt your head to the right, bringing ear toward shoulder',
        'Hold for 15-30 seconds, feeling the stretch on the left side',
        'Return to center and repeat on the left side',
        'Perform 3 repetitions on each side'
      ],
      benefits: [
        'Reduces neck stiffness and tension',
        'Improves neck mobility',
        'Helps relieve headaches caused by neck tension'
      ]
    },
    {
      id: 'neck-rotation',
      name: 'Neck Rotation Exercise',
      description: 'Gentle rotation movements to increase neck flexibility and reduce pain.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Neck',
      youtubeId: 'wQylqaCl8Zo',
      instructions: [
        'Start in a neutral position looking straight ahead',
        'Slowly turn your head to the right as far as comfortable',
        'Hold for 5 seconds',
        'Return to center and repeat to the left',
        'Do 10 repetitions on each side'
      ],
      benefits: [
        'Increases rotational range of motion',
        'Loosens tight neck muscles',
        'Improves posture awareness'
      ]
    }
  ],

  // Shoulder exercises
  left_shoulder: [
    {
      id: 'shoulder-pendulum',
      name: 'Pendulum Shoulder Exercise',
      description: 'Gentle swinging motion to improve shoulder mobility without strain.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: 'E4KVt0bfpuk',
      instructions: [
        'Lean forward with one hand on a table for support',
        'Let your affected arm hang down loosely',
        'Gently swing your arm in small circles',
        'Gradually increase circle size as comfort allows',
        'Perform for 1-2 minutes, then reverse direction'
      ],
      benefits: [
        'Reduces shoulder stiffness',
        'Promotes blood flow to the joint',
        'Gentle enough for early rehabilitation'
      ]
    },
    {
      id: 'shoulder-stretch',
      name: 'Cross-Body Shoulder Stretch',
      description: 'Effective stretch for the posterior shoulder muscles.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: 'Hf9XCH4RwIk',
      instructions: [
        'Stand or sit with good posture',
        'Bring your left arm across your body',
        'Use your right hand to gently pull the left arm closer',
        'Hold for 20-30 seconds',
        'Repeat 3 times on each side'
      ],
      benefits: [
        'Stretches posterior shoulder muscles',
        'Improves shoulder flexibility',
        'Helps with rounded shoulder posture'
      ]
    }
  ],
  right_shoulder: [
    {
      id: 'shoulder-pendulum',
      name: 'Pendulum Shoulder Exercise',
      description: 'Gentle swinging motion to improve shoulder mobility without strain.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: 'E4KVt0bfpuk',
      instructions: [
        'Lean forward with one hand on a table for support',
        'Let your affected arm hang down loosely',
        'Gently swing your arm in small circles',
        'Gradually increase circle size as comfort allows',
        'Perform for 1-2 minutes, then reverse direction'
      ],
      benefits: [
        'Reduces shoulder stiffness',
        'Promotes blood flow to the joint',
        'Gentle enough for early rehabilitation'
      ]
    }
  ],

  // Back exercises
  upper_back: [
    {
      id: 'cat-cow',
      name: 'Cat-Cow Stretch',
      description: 'Classic yoga movement for spinal mobility and back pain relief.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Upper Back',
      youtubeId: 'kqnua4rHVVA',
      instructions: [
        'Start on hands and knees in tabletop position',
        'Inhale and arch your back, lifting head and tailbone (Cow)',
        'Exhale and round your spine, tucking chin and tailbone (Cat)',
        'Move slowly and smoothly between positions',
        'Repeat for 10-15 cycles'
      ],
      benefits: [
        'Improves spinal flexibility',
        'Releases back tension',
        'Promotes healthy posture'
      ]
    },
    {
      id: 'thoracic-rotation',
      name: 'Thoracic Spine Rotation',
      description: 'Rotation exercise to improve mid-back mobility.',
      duration: '6 min',
      difficulty: 'Medium',
      targetArea: 'Upper Back',
      youtubeId: 'RcMxZM0bPME',
      instructions: [
        'Start on all fours with hands under shoulders',
        'Place one hand behind your head',
        'Rotate your upper body, bringing elbow toward ceiling',
        'Return to start and repeat',
        'Do 10 reps on each side'
      ],
      benefits: [
        'Increases thoracic mobility',
        'Reduces upper back stiffness',
        'Helps with breathing capacity'
      ]
    }
  ],
  spine: [
    {
      id: 'child-pose',
      name: 'Child\'s Pose',
      description: 'Restorative pose for gentle spinal decompression.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Spine',
      youtubeId: 'eqVMAPM00DM',
      instructions: [
        'Kneel on the floor with toes together',
        'Sit back on your heels',
        'Fold forward, extending arms in front or alongside body',
        'Rest forehead on the floor',
        'Hold for 30 seconds to 2 minutes'
      ],
      benefits: [
        'Gently stretches the spine',
        'Relieves back and neck tension',
        'Promotes relaxation'
      ]
    }
  ],

  // Knee exercises
  left_knee: [
    {
      id: 'quad-stretch',
      name: 'Standing Quad Stretch',
      description: 'Stretch for the quadriceps to support knee health.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'YR7NBEGYeaQ',
      instructions: [
        'Stand near a wall for balance support',
        'Bend one knee and bring heel toward buttocks',
        'Hold your ankle with your hand',
        'Keep knees together and hips forward',
        'Hold for 30 seconds, repeat on other side'
      ],
      benefits: [
        'Stretches quadriceps muscles',
        'Reduces knee stiffness',
        'Improves flexibility'
      ]
    },
    {
      id: 'knee-extension',
      name: 'Seated Knee Extension',
      description: 'Strengthening exercise for the muscles around the knee.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'YWiyPRvz9-c',
      instructions: [
        'Sit in a chair with feet flat on the floor',
        'Slowly straighten one leg, raising foot',
        'Hold at the top for 3 seconds',
        'Lower slowly and repeat',
        'Do 10-15 reps on each leg'
      ],
      benefits: [
        'Strengthens quadriceps',
        'Supports knee stability',
        'Safe for most knee conditions'
      ]
    }
  ],
  right_knee: [
    {
      id: 'quad-stretch',
      name: 'Standing Quad Stretch',
      description: 'Stretch for the quadriceps to support knee health.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'YR7NBEGYeaQ',
      instructions: [
        'Stand near a wall for balance support',
        'Bend one knee and bring heel toward buttocks',
        'Hold your ankle with your hand',
        'Keep knees together and hips forward',
        'Hold for 30 seconds, repeat on other side'
      ],
      benefits: [
        'Stretches quadriceps muscles',
        'Reduces knee stiffness',
        'Improves flexibility'
      ]
    }
  ],

  // Lower back exercises
  buttocks: [
    {
      id: 'piriformis-stretch',
      name: 'Piriformis Stretch',
      description: 'Targeted stretch for the deep hip muscles that can affect the lower back.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Hips/Lower Back',
      youtubeId: 'nOufZDZs9hY',
      instructions: [
        'Lie on your back with knees bent',
        'Cross one ankle over the opposite knee',
        'Pull the uncrossed leg toward your chest',
        'Feel the stretch in your hip and buttock',
        'Hold for 30 seconds, repeat on other side'
      ],
      benefits: [
        'Relieves sciatic pain',
        'Loosens tight hip muscles',
        'Reduces lower back tension'
      ]
    }
  ],

  // Chest exercises
  chest: [
    {
      id: 'doorway-stretch',
      name: 'Doorway Chest Stretch',
      description: 'Effective stretch for opening up tight chest muscles.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Chest',
      youtubeId: 'SZb67eXHKqc',
      instructions: [
        'Stand in a doorway with arms at 90 degrees',
        'Place forearms on door frame',
        'Step forward with one foot',
        'Lean forward until you feel a stretch in your chest',
        'Hold for 30 seconds, repeat 3 times'
      ],
      benefits: [
        'Opens tight chest muscles',
        'Improves posture',
        'Helps with rounded shoulders'
      ]
    }
  ],

  // Default exercises for unmapped body parts
  default: [
    {
      id: 'general-stretch',
      name: 'Full Body Gentle Stretch',
      description: 'A comprehensive stretching routine suitable for general pain relief.',
      duration: '10 min',
      difficulty: 'Easy',
      targetArea: 'Full Body',
      youtubeId: 'sTANio_2E0Q',
      instructions: [
        'Start with deep breathing to relax',
        'Gently stretch your neck in all directions',
        'Roll your shoulders forward and backward',
        'Stretch your arms overhead',
        'Finish with gentle hip circles'
      ],
      benefits: [
        'Improves overall flexibility',
        'Reduces muscle tension',
        'Promotes relaxation'
      ]
    }
  ]
};

export const getExercisesForBodyPart = (bodyPartId: string): Exercise[] => {
  // Try exact match first
  if (exerciseDatabase[bodyPartId]) {
    return exerciseDatabase[bodyPartId];
  }
  
  // Try partial matches
  const partialMatches: Record<string, string> = {
    'head': 'neck',
    'back_head': 'neck',
    'back_neck': 'neck',
    'left_back_shoulder': 'left_shoulder',
    'right_back_shoulder': 'right_shoulder',
    'abdominal': 'spine',
    'groin': 'buttocks',
    'left_thigh': 'left_knee',
    'right_thigh': 'right_knee',
    'left_hamstring': 'left_knee',
    'right_hamstring': 'right_knee',
    'left_calf': 'left_knee',
    'right_calf': 'right_knee',
    'left_shin': 'left_knee',
    'right_shin': 'right_knee',
  };
  
  const mappedPart = partialMatches[bodyPartId];
  if (mappedPart && exerciseDatabase[mappedPart]) {
    return exerciseDatabase[mappedPart];
  }
  
  // Return default exercises
  return exerciseDatabase.default;
};
