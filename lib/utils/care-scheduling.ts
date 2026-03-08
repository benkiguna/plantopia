import { PlantWithSpecies, CareLog } from "@/types/database";

export type ScheduleItemType = "water" | "fertilize" | "mist" | "rotate" | "repot" | "prune";

export interface ScheduleItem {
  id: string; // Unique ID for the schedule entry (e.g. plantId + action)
  plant_id: string;
  plant_name: string;
  plant_photo_url: string | null;
  action: ScheduleItemType;
  due_date: Date;
  is_overdue: boolean;
  days_overdue: number;
}

export interface CareSchedule {
  overdue: ScheduleItem[];
  today: ScheduleItem[];
  thisWeek: ScheduleItem[];
  later: ScheduleItem[];
}

/**
 * Calculates the next due date for a specific care action based on species defaults
 * and the user's latest care logs.
 */
export function calculateNextCareDate(
  plant: PlantWithSpecies,
  logs: CareLog[],
  action: ScheduleItemType
): Date | null {
  const species = plant.species;
  if (!species) return null;

  let frequencyDays: number | null = null;

  // Determine frequency based on action type
  switch (action) {
    case "water":
      frequencyDays = species.water_days;
      break;
    case "fertilize":
      frequencyDays = species.fertilize_days;
      break;
    case "mist":
      // Example default for misting if species likes humidity
      if (species.humidity === "high") frequencyDays = 2;
      else if (species.humidity === "medium") frequencyDays = 7;
      break;
    case "rotate":
      frequencyDays = 14; // Default rotation frequency
      break;
    default:
      return null;
  }

  if (!frequencyDays) return null;

  // Find the most recent log for this action
  const sortedLogs = logs
    .filter((log) => log.action === action)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const lastActionDate = sortedLogs.length > 0 
    ? new Date(sortedLogs[0].created_at) 
    : new Date(plant.created_at); // Default to plant creation date if never done

  // Calculate next date
  const nextDate = new Date(lastActionDate);
  nextDate.setDate(nextDate.getDate() + frequencyDays);
  
  // Normalize to start of day for consistent comparison
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

/**
 * Generates a comprehensive care schedule for a list of plants and their logs,
 * grouped by urgency.
 */
export function generateCareSchedule(
  plants: PlantWithSpecies[],
  allLogs: CareLog[]
): CareSchedule {
  const scheduleItems: ScheduleItem[] = [];
  const now = new Date();
  
  // Normalize 'today' for comparison
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Define the standard actions we want to track
  const trackedActions: ScheduleItemType[] = ["water", "fertilize"]; // Could add mist, rotate, etc.

  plants.forEach((plant) => {
    // Optimization: we might want to fetch a plant-specific photo URL here in the future.
    // Assuming we use the health log recent photo or a fallback. 
    // For now, we'll try to get it from plant object if it's there or just use null and fallback to UI.
    const plantLogs = allLogs.filter((log) => log.plant_id === plant.id);

    trackedActions.forEach((action) => {
      const nextDate = calculateNextCareDate(plant, plantLogs, action);
      
      if (nextDate) {
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        scheduleItems.push({
          id: `${plant.id}-${action}`,
          plant_id: plant.id,
          plant_name: plant.nickname || plant.species?.name || "Unknown Plant",
          plant_photo_url: null, // Resolving this nicely in the UI with a fallback or query join
          action,
          due_date: nextDate,
          is_overdue: diffDays < 0,
          days_overdue: diffDays < 0 ? Math.abs(diffDays) : 0,
        });
      }
    });
  });

  // Group items
  const schedule: CareSchedule = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
  };

  scheduleItems.sort((a, b) => a.due_date.getTime() - b.due_date.getTime());

  scheduleItems.forEach((item) => {
    const diffTime = item.due_date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      schedule.overdue.push(item);
    } else if (diffDays === 0) {
      schedule.today.push(item);
    } else if (diffDays <= 7) {
      schedule.thisWeek.push(item);
    } else {
      schedule.later.push(item);
    }
  });

  return schedule;
}
