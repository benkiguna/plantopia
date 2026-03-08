"use client";

import { ScheduleItemType } from "@/lib/utils/care-scheduling";
import { Card } from "@/components/ui";
import Image from "next/image";
import { useState } from "react";

interface ScheduleItemProps {
  id: string;
  plantId: string;
  plantName: string;
  action: ScheduleItemType;
  dueDate: Date;
  isOverdue: boolean;
  daysOverdue: number;
  photoUrl: string | null;
  onComplete: (id: string, action: string, plantId: string) => Promise<void>;
  onSnooze: (id: string, hours: number) => void;
}

export function ScheduleItem({
  id,
  plantId,
  plantName,
  action,
  dueDate,
  isOverdue,
  daysOverdue,
  photoUrl,
  onComplete,
  onSnooze,
}: ScheduleItemProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Generate appropriate icon based on action type
  const getActionIcon = () => {
    switch (action) {
      case "water":
        return "💧";
      case "fertilize":
        return "✨";
      case "mist":
        return "💦";
      case "rotate":
        return "🔄";
      default:
        return "🌱";
    }
  };

  const getActionName = () => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onComplete(id, action, plantId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = dueDate.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="mb-3 transition-all duration-300" onClick={() => setExpanded(!expanded)}>
      <Card className={`overflow-hidden transition-all duration-300 ${isOverdue ? "border-coral/50 bg-coral/5" : ""}`}>
        <div className="flex items-center p-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-12 h-12 relative rounded-full overflow-hidden bg-forest/10 flex items-center justify-center">
            {photoUrl ? (
              <Image 
                src={photoUrl} 
                alt={plantName} 
                fill 
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <span className="text-xl">🪴</span>
            )}
          </div>

          {/* Details */}
          <div className="ml-4 flex-1">
            <h4 className="text-sm font-semibold text-forest">
              {plantName}
            </h4>
            <div className="flex items-center mt-1 text-xs text-forest/70">
              <span className="mr-1">{getActionIcon()}</span>
              <span>{getActionName()}</span>
              <span className="mx-2">•</span>
              <span className={isOverdue ? "text-coral font-medium" : ""}>
                {isOverdue 
                  ? `${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue` 
                  : (daysOverdue === 0 ? "Today" : formattedDate)
                }
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleComplete}
            disabled={loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              loading ? "opacity-50" : "hover:scale-105 active:scale-95"
            } ${isOverdue ? "bg-coral text-white" : "bg-green text-white"}`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Expanded Options */}
        {expanded && !loading && (
          <div className="bg-forest/5 border-t border-forest/10 px-4 py-3 flex justify-end gap-3 animate-in slide-in-from-top-2 duration-200">
            <button 
              onClick={(e) => { e.stopPropagation(); onSnooze(id, 24); setExpanded(false); }}
              className="text-xs font-medium px-3 py-1.5 rounded-full text-forest/70 hover:bg-forest/10 transition-colors"
            >
              Skip Today
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onSnooze(id, 48); setExpanded(false); }}
              className="text-xs font-medium px-3 py-1.5 rounded-full text-forest/70 hover:bg-forest/10 transition-colors"
            >
              Remind in 2 days
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
