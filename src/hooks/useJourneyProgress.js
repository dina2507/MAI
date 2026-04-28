import { useEffect } from "react";

const STORAGE_PREFIX = "mai-journey-";

export function saveProgress(journeyId, state) {
  try {
    localStorage.setItem(
      STORAGE_PREFIX + journeyId,
      JSON.stringify({
        currentStepId: state.currentStepId,
        history: state.history,
        data: state.data,
        savedAt: Date.now(),
      })
    );
  } catch (e) {
    // Storage full or disabled — silently ignore
  }
}

export function loadProgress(journeyId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + journeyId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire saved progress after 7 days
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_PREFIX + journeyId);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearProgress(journeyId) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + journeyId);
  } catch (e) {}
}

/**
 * useJourneyProgress — auto-saves journey state on change
 */
export function useJourneyProgress(journeyId, state) {
  useEffect(() => {
    if (!journeyId) return;
    if (state.currentStep?.type === "completion") {
      // Don't persist completed journeys
      clearProgress(journeyId);
      return;
    }
    saveProgress(journeyId, state);
  }, [journeyId, state.currentStepId]);
}
