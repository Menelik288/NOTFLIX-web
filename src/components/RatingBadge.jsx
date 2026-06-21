import React from 'react';

export const RatingBadge = ({ rating, className = "" }) => {
    const numRating = Number(rating) || 0;
    
    let colorClass = "bg-red-500/20 text-red-400 border-red-500/30";
    if (numRating >= 7.5) {
        colorClass = "bg-green-500/20 text-green-400 border-green-500/30";
    } else if (numRating >= 6.0) {
        colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    } else if (numRating === 0) {
        colorClass = "bg-white/10 text-white/50 border-white/20";
    }

    return (
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md shadow-lg border flex items-center gap-1 ${colorClass} ${className}`}>
            <span className="material-symbols-outlined text-[10px] fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {numRating === 0 ? 'NR' : numRating.toFixed(1)}
        </div>
    );
};
