export const experienceLevelMapping: { level: number; requiredXp: number }[] = [
  { level: 10, requiredXp: 5000 },
  { level: 9, requiredXp: 3000 },
  { level: 8, requiredXp: 2000 },
  { level: 7, requiredXp: 1500 },
  { level: 6, requiredXp: 900 },
  { level: 5, requiredXp: 670 },
  { level: 4, requiredXp: 500 },
  { level: 3, requiredXp: 350 },
  { level: 2, requiredXp: 120 },
  { level: 1, requiredXp: 50 },
  { level: 0, requiredXp: 0 },
];

export interface UserLevel {
  level: number;
  threshold: number;
}
