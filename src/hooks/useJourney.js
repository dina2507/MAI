import { useState, useCallback, useMemo } from "react";

/**
 * useJourney — FSM engine for DO mode journeys
 *
 * Given a journey definition, manages:
 * - Current step pointer
 * - History (for back navigation)
 * - Step data (collected user input across steps)
 * - Transition logic
 *
 * @param {import('../journeys/_types').Journey} journey - The journey definition
 * @param {Object} [initial] - Optional initial state (for resume)
 * @returns {Object}
 */
export function useJourney(journey, initial = {}) {
  const [currentStepId, setCurrentStepId] = useState(
    initial.currentStepId || journey.startStepId
  );
  const [history, setHistory] = useState(initial.history || []);
  const [data, setData] = useState(initial.data || {});

  const currentStep = useMemo(
    () => journey.steps[currentStepId],
    [journey, currentStepId]
  );

  const stepIds = useMemo(() => Object.keys(journey.steps), [journey]);
  const stepIndex = useMemo(
    () => stepIds.indexOf(currentStepId),
    [stepIds, currentStepId]
  );
  const totalSteps = stepIds.length;

  const goTo = useCallback(
    (nextStepId, stepData = {}) => {
      if (!journey.steps[nextStepId]) {
        console.warn(`Step "${nextStepId}" not found in journey "${journey.id}"`);
        return;
      }
      setHistory((h) => [...h, currentStepId]);
      setData((d) => ({ ...d, [currentStepId]: stepData }));
      setCurrentStepId(nextStepId);
    },
    [journey, currentStepId]
  );

  const back = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentStepId(prev);
  }, [history]);

  const reset = useCallback(() => {
    setCurrentStepId(journey.startStepId);
    setHistory([]);
    setData({});
  }, [journey]);

  const isComplete = currentStep?.type === "completion";

  return {
    currentStep,
    currentStepId,
    history,
    data,
    goTo,
    back,
    reset,
    isComplete,
    stepIndex,
    totalSteps,
    canGoBack: history.length > 0,
  };
}
