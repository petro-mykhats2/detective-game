import { initialGameState, type GameState } from "../game/gameState";

const SAVE_KEY = "detective-game-save-v1";

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return initialGameState;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== 1) return initialGameState;
    return parsed as GameState;
  } catch {
    return initialGameState;
  }
}

export function saveGame(state: GameState): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* localStorage недоступний */ }
}

export function clearGameSave(): void {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* localStorage недоступний */ }
}
