
import { LogEntry, UserSettings, RoutineItem, Category, GoalItem, UserAccount, Role, Provider } from '../types';

const LOGS_KEY = 'wellness_logs_v2';
const USERS_KEY = 'wellness_users';
const ACTIVE_USER_KEY = 'wellness_active_user';

export const dbService = {
  getUsers: (): UserAccount[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  createUser: (account: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount => {
    const users = dbService.getUsers();
    const newUser: UserAccount = {
      ...account,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  getActiveUser: (): UserAccount | null => {
    const data = localStorage.getItem(ACTIVE_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setActiveUser: (user: UserAccount | null) => {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  },

  getLogs: (userId?: string): LogEntry[] => {
    const data = localStorage.getItem(LOGS_KEY);
    const logs: LogEntry[] = data ? JSON.parse(data) : [];
    const active = dbService.getActiveUser();
    if (!active) return [];
    
    const targetUserId = userId || active.id;
    return logs.filter(l => l.userId === targetUserId);
  },

  saveLog: (entry: Omit<LogEntry, 'id' | 'timestamp' | 'userId'>): LogEntry => {
    const activeUser = dbService.getActiveUser();
    if (!activeUser) throw new Error("No active user");

    const allDataRaw = localStorage.getItem(LOGS_KEY);
    const allLogs: LogEntry[] = allDataRaw ? JSON.parse(allDataRaw) : [];
    
    const newEntry: LogEntry = {
      ...entry,
      userId: activeUser.id,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    allLogs.push(newEntry);
    localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
    return newEntry;
  },

  updateLog: (id: string, updates: Partial<LogEntry>): void => {
    const allDataRaw = localStorage.getItem(LOGS_KEY);
    if (!allDataRaw) return;
    const allLogs: LogEntry[] = JSON.parse(allDataRaw);
    const index = allLogs.findIndex(l => l.id === id);
    if (index !== -1) {
      allLogs[index] = { ...allLogs[index], ...updates, timestamp: new Date().toISOString() };
      localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
    }
  },

  deleteLog: (id: string): void => {
    const allDataRaw = localStorage.getItem(LOGS_KEY);
    if (!allDataRaw) return;
    const allLogs: LogEntry[] = JSON.parse(allDataRaw);
    const filtered = allLogs.filter(l => l.id !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filtered));
  },

  getSettings: (): UserSettings => {
    const activeUser = dbService.getActiveUser();
    const settingsKey = `settings_${activeUser?.id || 'default'}`;
    const data = localStorage.getItem(settingsKey);
    
    const defaultSettings: UserSettings = {
      name: activeUser?.name || 'Seeker',
      routines: [
        { id: '1', text: 'Morning Meditation', reminderTime: '08:00' },
        { id: '2', text: 'Drink 2L Water', reminderTime: '10:00' }
      ],
      goals: [],
      providers: [
        { id: 'p1', name: 'Dr. Evelyn Harper', specialty: 'Holistic Psychiatry', contact: '+1 (555) 0123-456' },
        { id: 'p2', name: 'Marcus Chen', specialty: 'Mindfulness Coach', contact: 'marcus@wellness.site' }
      ]
    };
    return data ? JSON.parse(data) : defaultSettings;
  },

  updateSettings: (settings: Partial<UserSettings>): void => {
    const activeUser = dbService.getActiveUser();
    if (!activeUser) return;
    const settingsKey = `settings_${activeUser.id}`;
    const current = dbService.getSettings();
    localStorage.setItem(settingsKey, JSON.stringify({ ...current, ...settings }));
  },

  getDailyRoutineCompletion: (dateStr: string): string[] => {
    const logs = dbService.getLogs();
    const routineLog = logs.find(l => l.category === Category.ROUTINE && l.date === dateStr);
    return routineLog ? routineLog.inputData.completedIds : [];
  },

  clearAllData: () => {
    localStorage.clear();
  }
};
