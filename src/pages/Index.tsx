import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BodyMap } from '@/components/BodyMap';
import { ChatBot, AssessmentData } from '@/components/ChatBot';
import { ExerciseCard, Exercise } from '@/components/ExerciseCard';
import { ExercisePlayer } from '@/components/ExercisePlayer';
import { MotionDetector } from '@/components/MotionDetector';
import { getExercisesForBodyPart, getAllAvailableExercises } from '@/data/exercises';
import { Activity, MessageCircle, Dumbbell, Calendar, ArrowRight, Sparkles, Heart, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppStep = 'landing' | 'select-body' | 'chatbot' | 'exercises' | 'player' | 'motion';

import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  const handleBodyPartSelect = (parts: Array<{ id: string; title: string }>) => {
    // Extract titles from the selected parts array - titles match the exercise database keys
    const partTitles = parts.map(p => p.title);
    setSelectedBodyParts(partTitles);
    // Use the first selected part's title for exercise lookup
    setSelectedBodyPart(partTitles[0] || null);
    setCurrentStep('chatbot');
  };

  const handleAssessmentComplete = (data: AssessmentData, recommendedIds?: string[]) => {
    setAssessment(data);

    // If AI provided specific recommendations, use them
    if (recommendedIds && recommendedIds.length > 0) {
      console.log("Using AI recommended exercises:", recommendedIds);
      const allAvailable = getAllAvailableExercises();
      const matchedExercises = allAvailable.filter(ex => recommendedIds.includes(ex.id));

      // If we found matches, set them and return
      if (matchedExercises.length > 0) {
        setRecommendedExercises(matchedExercises);
        setTimeout(() => setCurrentStep('exercises'), 1500);
        return;
      }
    }

    // Fallback: Get exercises for selected body parts (existing logic)
    console.log("Using fallback category-based exercises");
    const allExercises: Exercise[] = [];
    const seenIds = new Set<string>();

    selectedBodyParts.forEach(part => {
      const exercises = getExercisesForBodyPart(part);
      exercises.forEach(exercise => {
        if (!seenIds.has(exercise.id)) {
          seenIds.add(exercise.id);
          allExercises.push(exercise);
        }
      });
    });

    setRecommendedExercises(allExercises);
    setTimeout(() => setCurrentStep('exercises'), 1500);
  };

  const handleStartExercise = (exercise: Exercise) => {
    navigate(`/exercise/${exercise.id}`);
  };

  const handleStartMotionDetection = () => {
    setCurrentStep('motion');
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">PhysioAI</span>
          </div>

          {currentStep !== 'landing' && (
            <div className="flex items-center gap-2">
              <Button
                variant={currentStep === 'select-body' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentStep('select-body')}
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Select Area
              </Button>
              {selectedBodyPart && (
                <Button
                  variant={currentStep === 'chatbot' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentStep('chatbot')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Assessment
                </Button>
              )}
              {assessment && (
                <Button
                  variant={currentStep === 'exercises' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentStep('exercises')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Exercises
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Landing Page */}
        {currentStep === 'landing' && (
          <div className="min-h-[calc(100vh-4rem)] flex flex-col">
            {/* Hero Section */}
            <section className="flex-1 container mx-auto px-4 py-16 flex items-center">
              <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-8 animate-slide-up">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI-Powered Physical Therapy</span>
                  </div>

                  <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Your Personal
                    <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Therapy Assistant
                    </span>
                  </h1>

                  <p className="text-lg text-muted-foreground max-w-lg">
                    Get personalized exercise recommendations based on your symptoms.
                    Our AI tracks your form in real-time to ensure you're doing exercises correctly.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="hero"
                      size="xl"
                      onClick={() => setCurrentStep('select-body')}
                    >
                      Start Assessment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button variant="glass" size="xl" onClick={() => navigate('/all-exercises')}>
                      View Exercises
                    </Button>
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={() => navigate('/dashboard')}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <TrendingUp className="w-5 h-5 mr-2" />
                      View Progress
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center gap-8 pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-5 h-5 text-accent" />
                      <span className="text-sm">Evidence-Based</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-sm">Safe & Effective</span>
                    </div>
                  </div>
                </div>

                {/* Preview illustration */}
                <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20 animate-pulse-soft" />
                  <div className="relative bg-card rounded-3xl shadow-card p-8 border">
                    <div className="rounded-2xl bg-secondary flex justify-center">
                      <div className="flex flex-row text-center relative">
                        {/* Positioning wrapper */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                          {/* Animated content */}
                          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-bounce-soft">
                            <Activity className="w-10 h-10 text-primary-foreground" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <img src="shoulder-pain.jpg" alt="shoulder-pain w-full" className='h-full' />

                        </div>
                        <div className="flex-1">
                          <img src="elbow-touches.gif" alt="elbow-touches w-full" className='h-full' />

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-secondary/50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    How It Works
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Get started in three simple steps
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Dumbbell,
                      title: 'Select Pain Area',
                      description: 'Use our interactive body map to pinpoint where you\'re experiencing discomfort.'
                    },
                    {
                      icon: MessageCircle,
                      title: 'Answer Questions',
                      description: 'Our AI chatbot asks about your pain severity, duration, and lifestyle.'
                    },
                    {
                      icon: Activity,
                      title: 'Get AI Feedback',
                      description: 'Watch exercise demos and get real-time form correction using your camera.'
                    }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="gradient-card rounded-2xl p-6 shadow-card border border-border hover:shadow-glow transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-glow mb-4">
                        <feature.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Body Selection */}
        {currentStep === 'select-body' && (
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-slide-up">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Where are you experiencing pain?
              </h1>
              <p className="text-muted-foreground">
                Click on the body part that's causing you discomfort
              </p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <BodyMap
                onBodyPartSelect={handleBodyPartSelect}
              />
            </div>
          </div>
        )}

        {/* Chatbot Assessment */}
        {currentStep === 'chatbot' && selectedBodyPart && (
          <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="text-center mb-8 animate-slide-up">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Let's Assess Your Condition
              </h1>
              <p className="text-muted-foreground">
                Answer a few questions to get personalized recommendations
              </p>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <ChatBot
                selectedBodyParts={selectedBodyParts}
                onAssessmentComplete={handleAssessmentComplete}
              />
            </div>

            {assessment && (
              <div className="mt-6 text-center animate-slide-up">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => setCurrentStep('exercises')}
                >
                  View Recommended Exercises
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Exercise Recommendations */}
        {currentStep === 'exercises' && assessment && (
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-slide-up">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Your Treatment Plan
              </h1>
              <p className="text-muted-foreground">
                Exercises recommended for {assessment.bodyPart}
              </p>
            </div>

            {/* Assessment summary */}
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-card rounded-2xl shadow-card border border-border animate-slide-up">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">Assessment Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Pain Level</p>
                  <p className="text-sm font-medium text-foreground">{assessment.painSeverity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">{assessment.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pain Type</p>
                  <p className="text-sm font-medium text-foreground">{assessment.painType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age Range</p>
                  <p className="text-sm font-medium text-foreground">{assessment.age}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Activity Level</p>
                  <p className="text-sm font-medium text-foreground">{assessment.activityLevel}</p>
                </div>
              </div>
            </div>

            {/* Exercise grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ExerciseCard
                    exercise={exercise}
                    onStartExercise={handleStartExercise}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Player Modal */}
        {currentStep === 'player' && currentExercise && (
          <ExercisePlayer
            exercise={currentExercise}
            onClose={() => setCurrentStep('exercises')}
            onStartMotionDetection={handleStartMotionDetection}
          />
        )}

        {/* Motion Detection Modal */}
        {currentStep === 'motion' && currentExercise && (
          <MotionDetector
            exercise={currentExercise}
            onClose={() => setCurrentStep('player')}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
