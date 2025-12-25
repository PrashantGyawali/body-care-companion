import React from 'react';
import { Button } from '@/components/ui/button';
import { ExerciseCard, Exercise } from '@/components/ExerciseCard';
import { getAllAvailableExercises } from '@/data/exercises';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Dumbbell } from 'lucide-react';

const AllExercises: React.FC = () => {
    const navigate = useNavigate();
    const allExercises = getAllAvailableExercises();

    const handleStartExercise = (exercise: Exercise) => {
        navigate(`/exercise/${exercise.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">PhysioAI</span>
                    </div>

                    <Button
                        variant="ghost"
                        className="text-white hover:text-emerald-400"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-12 container mx-auto px-4">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                        <Dumbbell className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">{allExercises.length} Exercises Available</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        All <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">Exercises</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Browse our complete library of AI-tracked exercises with real-time form feedback.
                    </p>
                </div>

                {/* Exercise Grid */}
                {allExercises.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allExercises.map((exercise, index) => (
                            <div
                                key={exercise.id}
                                className="animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <ExerciseCard
                                    exercise={exercise}
                                    onStartExercise={handleStartExercise}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <Dumbbell className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Exercises Available</h3>
                        <p className="text-gray-400">Check back later for new exercises.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllExercises;
