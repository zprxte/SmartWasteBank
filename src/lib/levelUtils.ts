// Calculate the total points required to reach a specific level.
// Level 1: 0 pts
// Level 2: 500 pts (+500)
// Level 3: 1100 pts (+600)
// Level 4: 1800 pts (+700)
// Level 5: 2600 pts (+800)
export const getPointsForLevel = (level: number) => {
  if (level <= 1) return 0;
  return 500 * (level - 1) + 100 * ((level - 1) * (level - 2)) / 2;
};

// Calculate the level based on total points earned
export const getLevelFromPoints = (points: number) => {
  let level = 1;
  while (getPointsForLevel(level + 1) <= points) {
    level++;
  }
  return level;
};
