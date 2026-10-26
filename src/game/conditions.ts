import type { GameState } from "./gameState";

export function isTaskCompleted(state: GameState, taskId: string): boolean {
  return state.completedTasks.includes(taskId);
}
