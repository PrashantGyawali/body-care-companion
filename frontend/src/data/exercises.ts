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
      thumbnail: '/neck-stretch-1-thumbnail.png',
      gifMale: '/neck-stretch-1-male.gif',
      gifFemale: '/neck-stretch-1-female.gif',
      instructions: [
        'Sit or stand with good posture, shoulders relaxed',
        'Slowly tilt your head to the left, bringing ear toward shoulder',
        'Hold for 5 seconds, feeling the stretch on the right side',
        'Return to center and repeat on the right side',
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
      gifMale: '/neck-rotation-male.gif',
      gifFemale: '/neck-rotation-female.gif',
      instructions: [
        'Start in a neutral position looking straight ahead',
        'Slowly turn your head to either right or left according to selected position',
        'Return to center and repeat on the opposite side',
        'Do 10 repetitions on each side'
      ],
      benefits: [
        'Increases rotational range of motion',
        'Loosens tight neck muscles',
        'Improves posture awareness'
      ]
    },
    {
      id: 'chin-tuck',
      name: 'Chin Tucks',
      description: 'Strengthens deep neck flexors and improves head posture.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Neck',
      youtubeId: '7gXL6j7C1SA',
      thumbnail: '/chin-tuck-thumbnail.png',
      gifMale: '/chin-tucks-male.gif',
      gifFemale: '/chin-tucks-female.gif',
      instructions: [
        'Sit tall and look straight ahead.',
        'Gently draw your chin straight back like making a "double chin".',
        'Do not tilt your head up or down.',
        'Hold for 5 seconds.',
        'Relax and repeat 10 times.'
      ],
      benefits: [
        'Corrects forward head posture',
        'Relieves tension at base of skull',
        'Strengthens deep neck muscles'
      ]
    },
    {
      id: 'isometric-side-bend',
      name: 'Isometric Side Bending',
      description: 'Strengthening neck muscles without joint movement.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Neck',
      youtubeId: 'Vf3TPltK_UI',
      thumbnail: '/isometric-side-bending-thumbnail.png',
      gifMale: '/isometric-side-bending-male.gif',
      gifFemale: '/isometric-side-bending-female.gif',
      instructions: [
        'Place your hand on the side of your head.',
        'Push your head into your hand, but resist movement.',
        'Keep your head perfectly still.',
        'Hold for 10 seconds.',
        'Repeat 5 times on each side.'
      ],
      benefits: [
        'Safe strengthening for painful necks',
        'Improves stability',
        'No joint aggravation'
      ]
    },
    {
      id: 'trapezius-stretch',
      name: 'Upper Trapezius Stretch',
      description: 'Relieves stress and tightness in the shoulders and neck.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Neck',
      youtubeId: '0U0F4mF1c5M',
      thumbnail: '/upper-trapezius-stretch-thumbnail.png',
      gifMale: '/upper-trapezius-stretch-male.gif',
      gifFemale: '/upper-trapezius-stretch-female.gif',
      instructions: [
        'Sit with one hand anchoring you to the chair seat.',
        'Tilt your head away from that shoulder.',
        'Gently use your other hand to increase the stretch.',
        'Hold for 30 seconds.',
        'Repeat twice on each side.'
      ],
      benefits: [
        'Reduces stress tension',
        'Relieves "tight shoulders"',
        'Improves neck flexibility'
      ]
    },
    {
      id: 'neck-extension',
      name: 'Active Neck Extension',
      description: 'Counteracts "text neck" by extending the cervical spine.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Neck',
      youtubeId: 'zM2I0IlbO9w',
      thumbnail: '/active-neck-extension-thumbnail.png',
      gifMale: '/active-neck-extension-male.gif',
      gifFemale: '/active-neck-extension-female.gif',
      instructions: [
        'Sit tall with shoulders relaxed.',
        'Slowly look up towards the ceiling.',
        'Go as far as comfortable without dizziness.',
        'Hold for 2 seconds.',
        'Return to neutral and repeat 5 times.'
      ],
      benefits: [
        'Reverses "tech neck" posture',
        'Improves extension range',
        'Relieves hunching'
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
      thumbnail: '/shoulder-pendulum-thumbnail.png',
      gifMale: '/shoulder-pendulum-male.gif',
      gifFemale: '/shoulder-pendulum-female.gif',
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
      thumbnail: '/shoulder-stretch-thumbnail.png',
      gifMale: '/shoulder-stretch-male.gif',
      gifFemale: '/shoulder-stretch-female.gif',
      instructions: [
        'Stand or sit with good posture',
        'Bring your left arm across your body',
        'Use your right hand to gently pull the left arm closer',
        'Do for at least 15 Reps',
        'Repeat 3 times on each side'
      ],
      benefits: [
        'Stretches posterior shoulder muscles',
        'Improves shoulder flexibility',
        'Helps with rounded shoulder posture'
      ]
    },
    {
      id: 'shoulder-flexion',
      name: 'Active Shoulder Flexion',
      description: 'Raises the arm forward to improve vertical range of motion.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: 'AsO4gB-7PKQ',
      thumbnail: '/shoulder-flexion-thumbnail.png',
      gifMale: '/active-shoulder-flexion-male.gif',
      gifFemale: '/active-shoulder-flexion-female.gif',
      instructions: [
        'Stand with good posture, arm at your side',
        'Slowly raise your arm forward and up',
        'Keep your elbow straight',
        'Go as high as comfortable without shrugging',
        'Lower slowly back to start'
      ],
      benefits: [
        'Increases forward reach',
        'Strengthens shoulder flexors',
        'Improves overhead mobility'
      ]
    },
    {
      id: 'shoulder-abduction',
      name: 'Active Shoulder Abduction',
      description: 'Raises the arm to the side to strengthen the deltoid and improve mobility.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: 'qk1aE1j_4no',
      thumbnail: '/active-shoulder-abduction-thumbnail.png',
      gifMale: '/active-shoulder-abduction-male.gif',
      gifFemale: '/active-shoulder-abduction-female.gif',
      instructions: [
        'Stand tall with arm at your side',
        'Raise your arm out to the side',
        'Keep palm facing forward or down',
        'Lift to shoulder height if possible',
        'Lower slowly with control'
      ],
      benefits: [
        'Strengthens medial deltoid',
        'Improves side-reaching ability',
        'Enhances shoulder stability'
      ]
    },
    {
      id: 'wall-slide',
      name: 'Wall Slides',
      description: 'Active range of motion exercise for overhead mobility.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: 'SWtMmj5g1nM',
      thumbnail: '/wall-slides-thumbnail.png',
      gifMale: '/wall-slides-male.gif',
      gifFemale: '/wall-slides-female.gif',
      instructions: [
        'Stand with back against a wall.',
        'Place arms against wall in a "W" position.',
        'Slide hands up as high as possible while keeping contact.',
        'Slide back down to start.',
        'Perform 10 repetitions.'
      ],
      benefits: [
        'Improves overhead reach',
        'Strengthens upper back',
        'Corrects scapular mechanics'
      ]
    },
    {
      id: 'scapular-squeeze',
      name: 'Scapular Squeezes',
      description: 'Retraction exercise to improve posture and shoulder stability.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: 'L83Uji4Y_eE',
      thumbnail: '/scapular-squeezes-thumbnail.png',
      gifMale: '/scapular-squeezes-male.gif',
      gifFemale: '/scapular-squeezes-female.gif',
      instructions: [
        'Sit or stand with arms at sides.',
        'Squeeze your shoulder blades together.',
        'Think about holding a pencil between them.',
        'Hold for 5 seconds.',
        'Relax and repeat 10 times.'
      ],
      benefits: [
        'Fixes rounded shoulders',
        'Reduces upper back pain',
        'Improves posture'
      ]
    },
    {
      id: 'external-rotation',
      name: 'External Rotation (Wall)',
      description: 'Strengthens the rotator cuff muscles against a wall.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: '0_ZgLjv0a9o',
      thumbnail: '/external-rotation-(Wall)-thumbnail.png',
      gifMale: '/external-rotation-female.gif',
      gifFemale: '/external-rotation-female.gif',
      instructions: [
        'Stand sideways to a wall.',
        'Bend elbow to 90 degrees.',
        'Press the back of your hand into the wall.',
        'Hold for 5 seconds.',
        'Relax and repeat 10 times.'
      ],
      benefits: [
        'Strengthens rotator cuff',
        'Improves shoulder stability',
        'Essential for shoulder rehab'
      ]
    },
    {
      id: 'arm-circles',
      name: 'Gentle Arm Circles',
      description: 'Warm-up exercise to increase blood flow and mobility.',
      duration: '2 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: '1w37q1k75jU',
      thumbnail: '/gentle-arm-circles-thumbnail.png',
      gifMale: '/gentle-arm-circles-male.gif',
      gifFemale: '/gentle-arm-circles-female.gif',
      instructions: [
        'Stand with feet shoulder-width apart.',
        'Extend arms out to sides.',
        'Make small forward circles 10 times.',
        'Make small backward circles 10 times.',
        'Gradually increase circle size.'
      ],
      benefits: [
        'Warms up shoulder joint',
        'Improves synovial fluid circulation',
        'Reduces stiffness'
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
      thumbnail: '/shoulder-pendulum-thumbnail.png',
      gifMale: '/shoulder-pendulum-male.gif',
      gifFemale: '/shoulder-pendulum-female.gif',
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
      thumbnail: '/shoulder-stretch-thumbnail.png',
      gifMale: '/shoulder-stretch-male.gif',
      gifFemale: '/shoulder-stretch-female.gif',
      instructions: [
        'Stand or sit with good posture',
        'Bring your right arm across your body',
        'Use your left hand to gently pull the right arm closer',
        'Do for at least 15 Reps',
        'Repeat 3 times on each side'
      ],
      benefits: [
        'Stretches posterior shoulder muscles',
        'Improves shoulder flexibility',
        'Helps with rounded shoulder posture'
      ]
    },
    {
      id: 'shoulder-flexion',
      name: 'Active Shoulder Flexion',
      description: 'Raises the arm forward to improve vertical range of motion.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: 'AsO4gB-7PKQ',
      thumbnail: '/shoulder-flexion-thumbnail.png',
      gifMale: '/active-shoulder-flexion-male.gif',
      gifFemale: '/active-shoulder-flexion-female.gif',
      instructions: [
        'Stand with good posture, arm at your side',
        'Slowly raise your arm forward and up',
        'Keep your elbow straight',
        'Go as high as comfortable without shrugging',
        'Lower slowly back to start'
      ],
      benefits: [
        'Increases forward reach',
        'Strengthens shoulder flexors',
        'Improves overhead mobility'
      ]
    },
    {
      id: 'shoulder-abduction',
      name: 'Active Shoulder Abduction',
      description: 'Raises the arm to the side to strengthen the deltoid and improve mobility.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: 'qk1aE1j_4no',
      thumbnail: '/active-shoulder-abduction-thumbnail.png',
      gifMale: '/active-shoulder-abduction-male.gif',
      gifFemale: '/active-shoulder-abduction-female.gif',
      instructions: [
        'Stand tall with arm at your side',
        'Raise your arm out to the side',
        'Keep palm facing forward or down',
        'Lift to shoulder height if possible',
        'Lower slowly with control'
      ],
      benefits: [
        'Strengthens medial deltoid',
        'Improves side-reaching ability',
        'Enhances shoulder stability'
      ]
    },
    {
      id: 'wall-slide',
      name: 'Wall Slides',
      description: 'Active range of motion exercise for overhead mobility.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: 'SWtMmj5g1nM',
      thumbnail: '/wall-slides-thumbnail.png',
      gifMale: '/wall-slides-male.gif',
      gifFemale: '/wall-slides-female.gif',
      instructions: [
        'Stand with back against a wall.',
        'Place arms against wall in a "W" position.',
        'Slide hands up as high as possible while keeping contact.',
        'Slide back down to start.',
        'Perform 10 repetitions.'
      ],
      benefits: [
        'Improves overhead reach',
        'Strengthens upper back',
        'Corrects scapular mechanics'
      ]
    },
    {
      id: 'scapular-squeeze',
      name: 'Scapular Squeezes',
      description: 'Retraction exercise to improve posture and shoulder stability.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: 'L83Uji4Y_eE',
      thumbnail: '/scapular-squeezes-thumbnail.png',
      gifMale: '/scapular-squeezes-male.gif',
      gifFemale: '/scapular-squeezes-female.gif',
      instructions: [
        'Sit or stand with arms at sides.',
        'Squeeze your shoulder blades together.',
        'Think about holding a pencil between them.',
        'Hold for 5 seconds.',
        'Relax and repeat 10 times.'
      ],
      benefits: [
        'Fixes rounded shoulders',
        'Reduces upper back pain',
        'Improves posture'
      ]
    },
    {
      id: 'external-rotation',
      name: 'External Rotation (Wall)',
      description: 'Strengthens the rotator cuff muscles against a wall.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Shoulder',
      youtubeId: '0_ZgLjv0a9o',
      thumbnail: '/external-rotation-(Wall)-thumbnail.png',
      gifMale: '/external-rotation-female.gif',
      gifFemale: '/external-rotation-female.gif',
      instructions: [
        'Stand sideways to a wall.',
        'Bend elbow to 90 degrees.',
        'Press the back of your hand into the wall.',
        'Hold for 5 seconds.',
        'Relax and repeat 10 times.'
      ],
      benefits: [
        'Strengthens rotator cuff',
        'Improves shoulder stability',
        'Essential for shoulder rehab'
      ]
    },
    {
      id: 'arm-circles',
      name: 'Gentle Arm Circles',
      description: 'Warm-up exercise to increase blood flow and mobility.',
      duration: '2 min',
      difficulty: 'Easy',
      targetArea: 'Shoulder',
      youtubeId: '1w37q1k75jU',
      thumbnail: '/gentle-arm-circles-thumbnail.png',
      gifMale: '/gentle-arm-circles-male.gif',
      gifFemale: '/gentle-arm-circles-female.gif',
      instructions: [
        'Stand with feet shoulder-width apart.',
        'Extend arms out to sides.',
        'Make small forward circles for 30 seconds.',
        'Make small backward circles for 30 seconds.',
        'Gradually increase circle size.'
      ],
      benefits: [
        'Warms up shoulder joint',
        'Improves synovial fluid circulation',
        'Reduces stiffness'
      ]
    }
  ],

  // Knee exercises
  left_knee: [
    {
      id: 'knee-extension',
      name: 'Seated Knee Extension',
      description: 'Strengthening exercise for the muscles around the knee.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'YWiyPRvz9-c',
      thumbnail: '/knee-extension-thumbnail.png',
      gifMale: '/knee-extension-male.gif',
      gifFemale: '/knee-extension-female.gif',
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
    },
    {
      id: 'straight-leg-raise',
      name: 'Straight Leg Raises',
      description: 'Strengthens quadriceps without putting pressure on the knee joint.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Knee',
      youtubeId: 'L83Uji4Y_eE',
      thumbnail: '/straight-leg-raises-thumbnail.png',
      gifMale: '/straight-leg-raise-male.gif',
      gifFemale: '/straight-leg-raises-female.gif',
      instructions: [
        'Lie on your back with one leg bent and the other straight.',
        'Tighten the thigh muscles of the straight leg.',
        'Lift your leg about 12 inches off the floor.',
        'Hold for 5 seconds.',
        'Slowly lower and repeat 10 times.'
      ],
      benefits: [
        'Safe for acute knee pain',
        'Builds quad strength',
        'Zero joint impact'
      ]
    },
    {
      id: 'heel-slide',
      name: 'Seated Heel Slides',
      description: 'Improves knee flexion range of motion.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: '6_5k0LqHj9A',
      thumbnail: '/seated-heel-slides-thumbnail.png',
      gifMale: '/seated-heel-slides-male.gif',
      gifFemale: '/seated-heel-slides-female.gif',
      instructions: [
        'Sit on a firm chair.',
        'Extend your leg forward with heel on the floor.',
        'Slide your heel back towards the chair as far as possible.',
        'Hold for 5 seconds.',
        'Slide back to start. Repeat 10 times.'
      ],
      benefits: [
        'Increases bending range',
        'Reduces stiffness',
        'Good for post-surgery rehab'
      ]
    },
    {
      id: 'mini-squat',
      name: 'Supported Mini Squats',
      description: 'Functional strengthening for the entire leg.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Knee',
      youtubeId: '7Xw3n8_F1pE',
      thumbnail: '/supported-mini-squats-thumbnail.png',
      gifMale: '/supported-mini-squats-male.gif',
      gifFemale: '/supported-mini-squats-female.gif',
      instructions: [
        'Stand holding onto a chair back for support.',
        'Feet shoulder-width apart.',
        'Bend knees slightly (about 30-45 degrees).',
        'Keep weight in heels and back straight.',
        'Return to standing. Repeat 10 times.'
      ],
      benefits: [
        'Functional leg strength',
        'Improves ability to sit/stand',
        'Safe loading of the knee'
      ]
    },
    {
      id: 'calf-raise',
      name: 'Standing Calf Raises',
      description: 'Strengthens the lower leg muscles to support the knee.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'gwLzBJYoWlI',
      thumbnail: '/standing-calf-raises-thumbnail.png',
      gifMale: '/standing-calf-raises-male.gif',
      gifFemale: '/standing-calf-raises-female.gif',
      instructions: [
        'Stand holding a chair for balance.',
        'Rise up onto your toes.',
        'Hold briefly at the top.',
        'Lower slowly back down.',
        'Repeat 15 times.'
      ],
      benefits: [
        'Improves ankle stability',
        'Supports knee joint',
        'Better balance'
      ]
    }
  ],
  right_knee: [
    {
      id: 'knee-extension',
      name: 'Seated Knee Extension',
      description: 'Strengthening exercise for the muscles around the knee.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'YWiyPRvz9-c',
      thumbnail: '/knee-extension-thumbnail.png',
      gifMale: '/knee-extension-male.gif',
      gifFemale: '/knee-extension-female.gif',
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
    },
    {
      id: 'straight-leg-raise',
      name: 'Straight Leg Raises',
      description: 'Strengthens quadriceps without putting pressure on the knee joint.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Knee',
      youtubeId: 'L83Uji4Y_eE',
      thumbnail: '/straight-leg-raises-thumbnail.png',
      gifMale: '/straight-leg-raise-male.gif',
      gifFemale: '/straight-leg-raises-female.gif',
      instructions: [
        'Lie on your back with one leg bent and the other straight.',
        'Tighten the thigh muscles of the straight leg.',
        'Lift your leg about 12 inches off the floor.',
        'Hold for 5 seconds.',
        'Slowly lower and repeat 10 times.'
      ],
      benefits: [
        'Safe for acute knee pain',
        'Builds quad strength',
        'Zero joint impact'
      ]
    },
    {
      id: 'heel-slide',
      name: 'Seated Heel Slides',
      description: 'Improves knee flexion range of motion.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: '6_5k0LqHj9A',
      thumbnail: '/seated-heel-slides-thumbnail.png',
      gifMale: '/seated-heel-slides-male.gif',
      gifFemale: '/seated-heel-slides-female.gif',
      instructions: [
        'Sit on a firm chair.',
        'Extend your leg forward with heel on the floor.',
        'Slide your heel back towards the chair as far as possible.',
        'Hold for 5 seconds.',
        'Slide back to start. Repeat 10 times.'
      ],
      benefits: [
        'Increases bending range',
        'Reduces stiffness',
        'Good for post-surgery rehab'
      ]
    },
    {
      id: 'mini-squat',
      name: 'Supported Mini Squats',
      description: 'Functional strengthening for the entire leg.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Knee',
      youtubeId: '7Xw3n8_F1pE',
      thumbnail: '/supported-mini-squats-thumbnail.png',
      gifMale: '/supported-mini-squats-male.gif',
      gifFemale: '/supported-mini-squats-female.gif',
      instructions: [
        'Stand holding onto a chair back for support.',
        'Feet shoulder-width apart.',
        'Bend knees slightly (about 30-45 degrees).',
        'Keep weight in heels and back straight.',
        'Return to standing. Repeat 10 times.'
      ],
      benefits: [
        'Functional leg strength',
        'Improves ability to sit/stand',
        'Safe loading of the knee'
      ]
    },
    {
      id: 'calf-raise',
      name: 'Standing Calf Raises',
      description: 'Strengthens the lower leg muscles to support the knee.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Knee',
      youtubeId: 'gwLzBJYoWlI',
      thumbnail: '/standing-calf-raises-thumbnail.png',
      gifMale: '/standing-calf-raises-male.gif',
      gifFemale: '/standing-calf-raises-female.gif',
      instructions: [
        'Stand holding a chair for balance.',
        'Rise up onto your toes.',
        'Hold briefly at the top.',
        'Lower slowly back down.',
        'Repeat 15 times.'
      ],
      benefits: [
        'Improves ankle stability',
        'Supports knee joint',
        'Better balance'
      ]
    }
  ],

  // Elbow exercises
  left_elbow: [
    {
      id: 'elbow-flexion',
      name: 'Active Elbow Flexion',
      description: 'Controlled bending and straightening of the elbow to restore range of motion.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Elbow',
      youtubeId: '3l7s_z1Vd78',
      thumbnail: '/elbow-flexion-thumbnail.png',
      gifMale: '/elbow-flexion-male.gif',
      gifFemale: '/elbow-flexion-female.gif',
      instructions: [
        'Sit or stand with arm at your side',
        'Slowly bend your elbow, bringing hand toward shoulder',
        'Hold briefly at the top range',
        'Slowly lower back to straight position',
        'Keep movement smooth and controlled'
      ],
      benefits: [
        'Improves elbow flexion and extension',
        'Reduces joint stiffness',
        'Maintains muscle tone'
      ]
    }
  ],
  right_elbow: [
    {
      id: 'elbow-flexion',
      name: 'Active Elbow Flexion',
      description: 'Controlled bending and straightening of the elbow to restore range of motion.',
      duration: '4 min',
      difficulty: 'Easy',
      targetArea: 'Elbow',
      youtubeId: '3l7s_z1Vd78',
      thumbnail: '/elbow-flexion-thumbnail.png',
      gifMale: '/elbow-flexion-male.gif',
      gifFemale: '/elbow-flexion-female.gif',
      instructions: [
        'Sit or stand with arm at your side',
        'Slowly bend your elbow, bringing hand toward shoulder',
        'Hold briefly at the top range',
        'Slowly lower back to straight position',
        'Keep movement smooth and controlled'
      ],
      benefits: [
        'Improves elbow flexion and extension',
        'Reduces joint stiffness',
        'Maintains muscle tone'
      ]
    }
  ],

  // Spine exercises
  spine: [
    {
      id: 'spine-twist',
      name: 'Seated Thoracic Rotation',
      description: 'Gentle spinal twist to improve upper back mobility.',
      duration: '5 min',
      difficulty: 'Easy',
      targetArea: 'Spine',
      youtubeId: 'fqb3gTjgC3E',
      thumbnail: '/spine-twist-thumbnail.png',
      gifMale: '/spine-twist-male.gif',
      gifFemale: '/spine-twist-female.gif',
      instructions: [
        'Sit tall in a chair with feet flat',
        'Cross arms over chest or place hands behind head',
        'Gently rotate your upper body to one side',
        'Hold for a few seconds',
        'Return to center and rotate to the other side'
      ],
      benefits: [
        'Increases spinal mobility',
        'Reduces mid-back stiffness',
        'Improves posture'
      ]
    },
    {
      id: 'seated-cat-cow',
      name: 'Seated Cat-Cow',
      description: 'Gentle spinal flexion and extension mobilization.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Spine',
      youtubeId: 'w_W9G6F8a_k',
      thumbnail: '/seated-cat-cow-thumbnail.png',
      gifMale: '/seated-cat-cow-female.gif',
      gifFemale: '/seated-cat-cow-female.gif',
      instructions: [
        'Sit on edge of chair with hands on knees.',
        'Inhale, arch your back, and look up (Cow).',
        'Exhale, round your spine, and look down (Cat).',
        'Move slowly and rhythmically.',
        'Repeat for 1 minute.'
      ],
      benefits: [
        'Mobilizes entire spine',
        'Relieves lower back stiffness',
        'Safe for elderly'
      ]
    },
    {
      id: 'standing-extension',
      name: 'Standing Back Extension',
      description: 'Counteracts flexion from prolonged sitting.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Spine',
      youtubeId: 'OpK4CjG1y_M',
      thumbnail: '/standing-back-extension-thumbnail.png',
      gifMale: '/standing-back-extension-male.gif',
      gifFemale: '/standing-back-extension-female.gif',
      instructions: [
        'Stand with feet shoulder-width apart.',
        'Place hands on your lower back for support.',
        'Gently lean backward, looking up slightly.',
        'Do not force the movement.',
        'Hold for 3 seconds. Repeat 10 times.'
      ],
      benefits: [
        'Relieves disc pressure',
        'Improves lumbar range',
        'Corrects posture'
      ]
    },
    {
      id: 'seated-side-bend',
      name: 'Seated Side Bends',
      description: 'Lateral spinal mobility exercise.',
      duration: '3 min',
      difficulty: 'Easy',
      targetArea: 'Spine',
      youtubeId: 'pS-uXhQmJ9c',
      thumbnail: '/seated-side-bends-thumbnail.png',
      gifMale: '/seated-side-bends-female.gif',
      gifFemale: '/seated-side-bends-female.gif',
      instructions: [
        'Sit tall with feet flat.',
        'Reach one arm overhead and lean to the opposite side.',
        'Keep your hips grounded on the chair.',
        'Hold for 5 seconds.',
        'Return to center and switch sides. Repeat 10 times.'
      ],
      benefits: [
        'Stretches lateral muscles (QL)',
        'Improves rib cage mobility',
        'Reduces stiffness'
      ]
    },
    {
      id: 'chair-march',
      name: 'Seated Chair Marches',
      description: 'Core stability and hip mobility exercise.',
      duration: '4 min',
      difficulty: 'Medium',
      targetArea: 'Spine',
      youtubeId: 'T8jI4RnHHf0',
      thumbnail: '/seated-chair-marches-thumbnail.png',
      gifMale: '/seated-chair-marches-male.gif',
      gifFemale: '/seated-chair-marches-female.gif',
      instructions: [
        'Sit tall without leaning back.',
        'Engage your abdominal muscles.',
        'Lift one knee up as high as comfortable.',
        'Lower firmly. Alternate legs.',
        'Perform for 2 minutes.'
      ],
      benefits: [
        'Strengthens deep core',
        'Stabilizes lumbar spine',
        'Safe cardio'
      ]
    }
  ],

  // Removed: buttocks and chest exercises (require floor/doorway - not detectable)
  buttocks: [],
  chest: [],

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

  // Try partial matches - maps body part titles from body-parts.ts to exercise categories
  const partialMatches: Record<string, string> = {
    // Head/Neck related
    'head': 'neck',
    'maxillofacial': 'neck',
    'skul_brain': 'neck',
    'back_head': 'neck',
    'back_neck': 'neck',

    // Shoulder related
    'left_shoulder_back': 'left_shoulder',
    'right_shoulder_back': 'right_shoulder',
    'left_humerus': 'left_shoulder',
    'right_humerus': 'right_shoulder',
    'left_arm': 'left_shoulder',
    'right_arm': 'right_shoulder',

    // Elbow/Forearm/Wrist/Hand - map to shoulder for now
    'left_elbow': 'left_shoulder',
    'right_elbow': 'right_shoulder',
    'left_forearm': 'left_shoulder',
    'right_forearm': 'right_shoulder',
    'left_wrist': 'left_shoulder',
    'right_wrist': 'right_shoulder',
    'left_hand': 'left_shoulder',
    'right_hand': 'right_shoulder',

    // Torso
    'abdominal': 'default',
    'chest': 'default',
    'pelvis': 'default',
    'spine': 'default',
    'back': 'neck',

    // Hip/Buttocks
    'left_hip': 'left_knee',
    'right_hip': 'right_knee',
    'buttocks': 'default',
    'groin': 'default',

    // Thigh/Leg
    'left_femur_thigh': 'left_knee',
    'right_femur_thigh': 'right_knee',
    'left_thigh': 'left_knee',
    'right_thigh': 'right_knee',
    'left_leg': 'left_knee',
    'right_leg': 'right_knee',
    'left_hamstring': 'left_knee',
    'right_hamstring': 'right_knee',

    // Lower leg
    'left_fib_tib': 'left_knee',
    'right_tib_fib': 'right_knee',
    'left_calf': 'left_knee',
    'right_calf': 'right_knee',
    'left_shin': 'left_knee',
    'right_shin': 'right_knee',

    // Ankle/Foot
    'left_ankle': 'left_knee',
    'right_ankle': 'right_knee',
    'left_foot': 'left_knee',
    'right_foot': 'right_knee',
  };

  const mappedPart = partialMatches[bodyPartId];
  if (mappedPart && exerciseDatabase[mappedPart]) {
    return exerciseDatabase[mappedPart];
  }

  // Return default exercises
  return exerciseDatabase.default;
};

// Get all unique available exercises (filtering out empty categories)
export const getAllAvailableExercises = (): Exercise[] => {
  const allExercises: Exercise[] = [];
  const seenIds = new Set<string>();

  for (const category in exerciseDatabase) {
    if (category === 'default') continue; // Skip default

    const exercises = exerciseDatabase[category];
    for (const exercise of exercises) {
      if (!seenIds.has(exercise.id)) {
        seenIds.add(exercise.id);
        allExercises.push(exercise);
      }
    }
  }

  return allExercises;
};
