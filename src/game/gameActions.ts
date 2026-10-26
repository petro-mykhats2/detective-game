import type { GameState } from "./gameState";

export function setCurrentScene(state: GameState, currentScene: GameState["currentScene"]): GameState {
  return { ...state, currentScene };
}

export function markTaskCompleted(state: GameState, taskId: string): GameState {
  return state.completedTasks.includes(taskId)
    ? state
    : { ...state, completedTasks: [...state.completedTasks, taskId] };
}
