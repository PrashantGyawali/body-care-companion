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

    // 1. Filter by Pain Severity
    let suitableExercises = exercises;
    const severity = assessment.painSeverity; // "1-3 (Mild)", "7-10 (Severe)"

    if (typeof severity === 'string' && severity.includes('7-10')) {
        // Severe pain: Only Easy exercises
        suitableExercises = suitableExercises.filter(ex => ex.difficulty === 'Easy');
    } else if (typeof severity === 'string' && severity.includes('4-6')) {
        // Moderate pain: Easy and Medium
        suitableExercises = suitableExercises.filter(ex => ex.difficulty !== 'Hard');
    }

    // 2. Filter by Age (Safety check)
    if (assessment.age === 'Over 60') {
        // Avoid Hard exercises for seniors in fallback mode
        suitableExercises = suitableExercises.filter(ex => ex.difficulty !== 'Hard');
    }

    // 3. Match by Pain Type (Simple keyword matching)
    const painType = assessment.painType; // "Stiffness", "Sharp"
    if (painType === 'Stiffness') {
        // Prioritize exercises with "stretch" or "rotation" in name/description
        const mobilityExercises = suitableExercises.filter(ex =>
            ex.name.toLowerCase().includes('stretch') ||
            ex.name.toLowerCase().includes('rotation') ||
            ex.description.toLowerCase().includes('mobility')
        );
        if (mobilityExercises.length > 0) {
            // Boost these to the top, but keep others as backup
            const otherExercises = suitableExercises.filter(ex => !mobilityExercises.includes(ex));
            suitableExercises = [...mobilityExercises, ...otherExercises];
        }
    }

    // 4. Select Breakdown
    // We want 3-4 exercises.
    // If we have "Severe" pain, maybe just 2-3 gentle ones.
    const count = severity?.includes('7-10') ? 3 : 4;

    // Shuffle slightly to give variety if run multiple times (optional, but nice)
    // For now, just slice the top matching ones
    const selectedIds = suitableExercises.slice(0, count).map(ex => ex.id);

    // Ensure we return something
    if (selectedIds.length === 0) {
        // Ultimate fallback: just take the first 3 easy ones
        return exercises.filter(ex => ex.difficulty === 'Easy').slice(0, 3).map(ex => ex.id);
    }

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      Select the best 3-4 exercises for this patient from the provided list.
      
      PATIENT: ${patientContext}
      
      EXERCISES: ${knowledgeBaseString}

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
