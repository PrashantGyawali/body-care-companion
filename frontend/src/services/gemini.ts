import { Exercise } from '@/components/ExerciseCard'
import api from '@/lib/axios'

// Local Fallback Logic (Rule-based "AI")
const generateFallbackRecommendations = (
  assessment: Record<string, any>,
  exercises: Exercise[]
): string[] => {
  console.log('Generating fallback recommendations for:', assessment)

  // Group exercises by targetArea to ensure coverage
  const exercisesByArea: Record<string, Exercise[]> = {}
  exercises.forEach((ex) => {
    const area = ex.targetArea
    if (!exercisesByArea[area]) {
      exercisesByArea[area] = []
    }
    exercisesByArea[area].push(ex)
  })

  const selectedIds: string[] = []
  const severity = assessment.painSeverity // "1-3 (Mild)", "7-10 (Severe)"
  const age = assessment.age
  const painType = assessment.painType

  // Process each area
  Object.keys(exercisesByArea).forEach((area) => {
    let areaExercises = exercisesByArea[area]

    // 1. Filter by Pain Severity
    if (typeof severity === 'string' && severity.includes('7-10')) {
      // Severe pain: Only Easy exercises
      areaExercises = areaExercises.filter((ex) => ex.difficulty === 'Easy')
    } else if (typeof severity === 'string' && severity.includes('4-6')) {
      // Moderate pain: Easy and Medium
      areaExercises = areaExercises.filter((ex) => ex.difficulty !== 'Hard')
    }

    // 2. Filter by Age (Safety check)
    if (age === 'Over 60') {
      // Avoid Hard exercises for seniors in fallback mode
      areaExercises = areaExercises.filter((ex) => ex.difficulty !== 'Hard')
    }

    // 3. Match by Pain Type (Simple keyword matching)
    if (painType === 'Stiffness') {
      // Prioritize exercises with "stretch" or "rotation" in name/description
      const mobilityExercises = areaExercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes('stretch') ||
          ex.name.toLowerCase().includes('rotation') ||
          ex.description.toLowerCase().includes('mobility')
      )
      if (mobilityExercises.length > 0) {
        // Boost these to the top, but keep others as backup
        const otherExercises = areaExercises.filter(
          (ex) => !mobilityExercises.includes(ex)
        )
        areaExercises = [...mobilityExercises, ...otherExercises]
      }
    }

    // 4. Select Breakdown
    // Select 2-3 exercises per body part to ensure coverage
    const count = severity?.includes('7-10') ? 2 : 3

    // Take top exercises for this area
    const areaSelectedIds = areaExercises.slice(0, count).map((ex) => ex.id)

    // If we filtered too much and have nothing, fallback to just any easy ones for this area
    if (areaSelectedIds.length === 0) {
      const fallbackIds = exercisesByArea[area]
        .filter((ex) => ex.difficulty === 'Easy')
        .slice(0, 2)
        .map((ex) => ex.id)
      selectedIds.push(...fallbackIds)
    } else {
      selectedIds.push(...areaSelectedIds)
    }
  })

  return selectedIds
}

export const getPersonalizedRecommendations = async (
  assessmentData: Record<string, any>,
  availableExercises: Exercise[]
): Promise<string[]> => {
  try {
    console.log('Sending assessment to backend for AI recommendations...')
    const response = await api.post('/ai/recommendations', {
      assessmentData,
      availableExercises,
    })

    if (response.data && response.data.recommendedIds) {
      console.log(
        'Received AI recommendations from backend:',
        response.data.recommendedIds
      )
      return response.data.recommendedIds
    } else {
      throw new Error('Invalid response format from backend')
    }
  } catch (error) {
    console.error('Error fetching AI recommendations:', error)
    console.warn('Falling back to local rule-based logic.')
    return generateFallbackRecommendations(assessmentData, availableExercises)
  }
}
