import { GoogleGenerativeAI } from "@google/generative-ai";
import { Exercise } from "@/components/ExerciseCard";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback if no key is present (allows development without AI)
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Local Fallback Logic (Rule-based "AI")
const generateFallbackRecommendations = (
    assessment: Record<string, any>,
    exercises: Exercise[]
): string[] => {
    console.log("Generating fallback recommendations for:", assessment);

    // Group exercises by targetArea to ensure coverage
    const exercisesByArea: Record<string, Exercise[]> = {};
    exercises.forEach(ex => {
        const area = ex.targetArea;
        if (!exercisesByArea[area]) {
            exercisesByArea[area] = [];
        }
        exercisesByArea[area].push(ex);
    });

    const selectedIds: string[] = [];
    const severity = assessment.painSeverity; // "1-3 (Mild)", "7-10 (Severe)"
    const age = assessment.age;
    const painType = assessment.painType;

    // Process each area
    Object.keys(exercisesByArea).forEach(area => {
        let areaExercises = exercisesByArea[area];

        // 1. Filter by Pain Severity
        if (typeof severity === 'string' && severity.includes('7-10')) {
            // Severe pain: Only Easy exercises
            areaExercises = areaExercises.filter(ex => ex.difficulty === 'Easy');
        } else if (typeof severity === 'string' && severity.includes('4-6')) {
            // Moderate pain: Easy and Medium
            areaExercises = areaExercises.filter(ex => ex.difficulty !== 'Hard');
        }

        // 2. Filter by Age (Safety check)
        if (age === 'Over 60') {
            // Avoid Hard exercises for seniors in fallback mode
            areaExercises = areaExercises.filter(ex => ex.difficulty !== 'Hard');
        }

        // 3. Match by Pain Type (Simple keyword matching)
        if (painType === 'Stiffness') {
            // Prioritize exercises with "stretch" or "rotation" in name/description
            const mobilityExercises = areaExercises.filter(ex =>
                ex.name.toLowerCase().includes('stretch') ||
                ex.name.toLowerCase().includes('rotation') ||
                ex.description.toLowerCase().includes('mobility')
            );
            if (mobilityExercises.length > 0) {
                // Boost these to the top, but keep others as backup
                const otherExercises = areaExercises.filter(ex => !mobilityExercises.includes(ex));
                areaExercises = [...mobilityExercises, ...otherExercises];
            }
        }

        // 4. Select Breakdown
        // Select 2-3 exercises per body part to ensure coverage
        const count = severity?.includes('7-10') ? 2 : 3;

        // Take top exercises for this area
        const areaSelectedIds = areaExercises.slice(0, count).map(ex => ex.id);

        // If we filtered too much and have nothing, fallback to just any easy ones for this area
        if (areaSelectedIds.length === 0) {
            const fallbackIds = exercisesByArea[area]
                .filter(ex => ex.difficulty === 'Easy')
                .slice(0, 2)
                .map(ex => ex.id);
            selectedIds.push(...fallbackIds);
        } else {
            selectedIds.push(...areaSelectedIds);
        }
    });

    return selectedIds;
};

export const getPersonalizedRecommendations = async (
    assessmentData: Record<string, any>,
    availableExercises: Exercise[]
): Promise<string[]> => {
    // Check if key is available
    if (!genAI) {
        console.warn("Gemini API Key not found. Using local rule-based fallback.");
        return generateFallbackRecommendations(assessmentData, availableExercises);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Prepare the Context
        const patientContext = JSON.stringify(assessmentData, null, 2);

        // 2. Prepare Knowledge Base
        const knowledgeBase = availableExercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            difficulty: ex.difficulty,
            targetArea: ex.targetArea,
            description: ex.description // Include description for better context
            // Omit benefits/instructions to save tokens
        }));

        const knowledgeBaseString = JSON.stringify(knowledgeBase, null, 2);

        // 3. Construct Prompt
        const prompt = `
      Act as an expert Physical Therapist. 
      Select the best exercises for this patient from the provided list.
      
      PATIENT: ${patientContext}
      
      EXERCISES: ${knowledgeBaseString}

      CRITICAL INSTRUCTION:
      You MUST select at least 2 exercises for EACH unique targetArea present in the EXERCISES list.
      Do not ignore any body part. If the user has pain in multiple areas, provide exercises for ALL of them.
      Total exercises should be between 3 and 8, depending on how many body parts are involved.

      RULES:
      1. severe_pain (7-10): ONLY 'Easy' exercises. No 'Medium'/'Hard'.
      2. age > 60: Avoid 'Hard' exercises.
      3. stiff_pain: Prioritize mobility/stretches.
      4. return ONLY a JSON array of ID strings. Example: ["id1", "id2"].
      5. Do not include markdown formatting.
    `;

        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text);

        // 5. Parse JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let recommendedIds;
        try {
            recommendedIds = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", e);
            recommendedIds = [];
        }

        if (Array.isArray(recommendedIds) && recommendedIds.length > 0) {
            return recommendedIds;
        } else {
            console.warn("Gemini returned invalid or empty format. Using fallback.");
            return generateFallbackRecommendations(assessmentData, availableExercises);
        }

    } catch (error) {
        console.error("Error with Gemini API:", error);
        return generateFallbackRecommendations(assessmentData, availableExercises);
    }
};
