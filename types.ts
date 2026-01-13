
export enum Category {
  MOOD = 'Mood',
  ROUTINE = 'Routine',
  GRATITUDE = 'Gratitude',
  JOURNAL = 'Journal',
  GOAL = 'Goal'
}

export enum Role {
  GUEST = 'Guest',
  SEEKER = 'Seeker',
  GUIDE = 'Guide'
}

export interface UserAccount {
  id: string;
  name: string;
  passphrase: string;
  role: Role;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  userId: string;
  timestamp: string;
  date: string;
  category: Category;
  inputData: any;
  notes?: string;
}

export interface RoutineItem {
  id: string;
  text: string;
  reminderTime?: string;
}

export interface GoalItem {
  id: string;
  text: string;
  progress: number;
  completed: boolean;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  contact: string;
}

export interface UserSettings {
  routines: RoutineItem[];
  goals: GoalItem[];
  providers: Provider[];
  name: string;
}

export interface MoodData {
  value: number; // 1-5 scale
  label: string;
  emoji: string;
  reason: string;
}
