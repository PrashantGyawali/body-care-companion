import { Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ENV from '../config/ENV.js'

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { assessmentData, availableExercises } = req.body

    if (!assessmentData || !availableExercises) {
      return res
        .status(400)
        .json({ message: 'Missing assessment data or exercises' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // 1. Prepare the Context
    const patientContext = JSON.stringify(assessmentData, null, 2)

    // 2. Prepare Knowledge Base
    const knowledgeBase = availableExercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      difficulty: ex.difficulty,
      targetArea: ex.targetArea,
      description: ex.description,
    }))

    const knowledgeBaseString = JSON.stringify(knowledgeBase, null, 2)

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
    `

    console.log('Sending request to Gemini...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log('Gemini Raw Response:', text)

    // 5. Parse JSON
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let recommendedIds
    try {
      recommendedIds = JSON.parse(cleanedText)
    } catch (e) {
      console.error('Failed to parse Gemini response:', e)
      recommendedIds = []
    }

    if (Array.isArray(recommendedIds) && recommendedIds.length > 0) {
      res.json({ recommendedIds })
    } else {
      res
        .status(500)
        .json({ message: 'Gemini returned invalid or empty format' })
    }
  } catch (error) {
    console.error('Error with Gemini API:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
