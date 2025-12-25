import React from 'react';
import { Badge } from '@/utils/progressStore';
import { cn } from '@/lib/utils';

interface BadgeGalleryProps {
    badges: Badge[];
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ badges }) => {
    const unlockedBadges = badges.filter(b => b.unlockedAt);
    const lockedBadges = badges.filter(b => !b.unlockedAt);

    return (
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg text-foreground">
                    Achievements
                </h3>
                <span className="text-sm text-muted-foreground">
                    {unlockedBadges.length}/{badges.length} Unlocked
                </span>
            </div>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={cn(
                            "relative group cursor-pointer",
                            "flex flex-col items-center"
                        )}
                    >
                        {/* Badge Icon */}
                        <div
                            className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
                                badge.unlockedAt
                                    ? "bg-gradient-to-br from-primary/20 to-accent/20 shadow-glow scale-100 hover:scale-110"
                                    : "bg-secondary grayscale opacity-40"
                            )}
                        >
                            {badge.icon}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-background/70">{badge.description}</p>
                            {badge.unlockedAt && (
                                <p className="text-green-400 mt-1">
                                    ✓ {new Date(badge.unlockedAt).toLocaleDateString()}
                                </p>
                            )}
                            {!badge.unlockedAt && (
                                <p className="text-muted-foreground mt-1">
                                    🔒 {badge.requirement}
                                </p>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                        </div>

                        {/* Unlocked indicator */}
                        {badge.unlockedAt && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full gradient-primary transition-all duration-500"
                        style={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BadgeGallery;
