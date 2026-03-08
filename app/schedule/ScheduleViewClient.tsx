"use client";

import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScheduleItem } from "@/components/schedule/ScheduleItem";
import type { CareSchedule, ScheduleItem as ScheduleItemType } from "@/lib/utils/care-scheduling";
import { useRouter } from "next/navigation";

interface Props {
  initialSchedule: CareSchedule;
}

export default function ScheduleViewClient({ initialSchedule }: Props) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<CareSchedule>(initialSchedule);

  // Optimistic update and API call for completeting tasks
  const handleComplete = async (id: string, action: string, plantId: string) => {
    
    // 1. Optimistically remove the item from local state
    const optimisticallyRemoved = (items: ScheduleItemType[]) => 
      items.filter(item => item.id !== id);

    setSchedule(prev => ({
      overdue: optimisticallyRemoved(prev.overdue),
      today: optimisticallyRemoved(prev.today),
      thisWeek: optimisticallyRemoved(prev.thisWeek),
      later: optimisticallyRemoved(prev.later),
    }));

    // 2. Perform the server update
    try {
      // Direct call to API route mapped for care actions
      const response = await fetch("/api/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId, action, notes: "Completed from schedule" }),
      });

      if (!response.ok) throw new Error("Failed to log care action");
      
      router.refresh(); // Refresh RSC payload in background
    } catch (error) {
      console.error(error);
      // Revert if failed
      alert("Failed to mark task as complete. Please try again.");
    }
  };

  const handleSnooze = (id: string, hours: number) => {
    alert(`Snoozed task ${id} for ${hours} hours! (This feature requires Push Notification / Cron support coming in Part 2)`);
  };

  const renderSection = (title: string, items: ScheduleItemType[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-forest/60 mb-3 px-2 uppercase tracking-wider">
          {title} ({items.length})
        </h3>
        <div>
          {items.map((item) => (
            <ScheduleItem
              key={item.id}
              {...item}
              dueDate={item.due_date}
              isOverdue={item.is_overdue}
              daysOverdue={item.days_overdue}
              photoUrl={item.plant_photo_url}
              plantName={item.plant_name}
              plantId={item.plant_id}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
            />
          ))}
        </div>
      </div>
    );
  };

  const hasNoTasks = 
    schedule.overdue.length === 0 && 
    schedule.today.length === 0 && 
    schedule.thisWeek.length === 0 && 
    schedule.later.length === 0;

  return (
    <MobileShell title="Care Schedule">
      <div className="px-4 pt-4 pb-12 animate-in fade-in duration-500">
        {hasNoTasks ? (
          <div className="flex flex-col items-center justify-center text-center mt-20 p-8">
            <div className="w-24 h-24 bg-green/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl text-green text-opacity-80">🪴</span>
            </div>
            <h2 className="text-xl font-bold text-forest mb-2">All Caught Up!</h2>
            <p className="text-forest/70 max-w-[250px] mx-auto">
              Your garden is happy and healthy. There are no pending care tasks at the moment.
            </p>
          </div>
        ) : (
          <>
            {renderSection("Overdue", schedule.overdue)}
            {renderSection("Today", schedule.today)}
            {renderSection("This Week", schedule.thisWeek)}
            {renderSection("Later", schedule.later)}
          </>
        )}
      </div>
    </MobileShell>
  );
}
