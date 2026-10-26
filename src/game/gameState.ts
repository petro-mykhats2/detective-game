export type GameState = {
  version: 1;
  currentScene: "start" | "chief-office" | "crime-scene";
  completedTasks: string[];
  evidence: string[];
  answers: Record<string, string>;
};

export const initialGameState: GameState = {
  version: 1,
  currentScene: "start",
  completedTasks: [],
  evidence: [],
  answers: {},
};
