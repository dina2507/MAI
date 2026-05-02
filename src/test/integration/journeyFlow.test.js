/**
 * Integration tests for journey flow — end-to-end FSM scenarios.
 * Tests realistic user journeys through the state machine.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useJourney } from '../../hooks/useJourney';
import { ALL_JOURNEYS } from '../../journeys/index';

describe('Journey Integration — Full Flows', () => {
  describe('first-time-voter: happy path', () => {
    const journey = ALL_JOURNEYS.find((j) => j.id === 'first-time-voter');

    it('completes the full happy path (age=yes)', () => {
      const { result } = renderHook(() => useJourney(journey));

      // Step 1: intro (info) → next
      expect(result.current.currentStep.type).toBe('info');
      act(() => { result.current.goTo('ageCheck'); });

      // Step 2: ageCheck (choice) → choose "Yes"
      expect(result.current.currentStep.type).toBe('choice');
      act(() => { result.current.goTo('documents'); });

      // Step 3: documents (checklist) → continue
      expect(result.current.currentStep.type).toBe('checklist');
      expect(result.current.currentStep.items.length).toBeGreaterThan(0);
      act(() => { result.current.goTo('applyOnline'); });

      // Step 4: applyOnline (action) → continue
      expect(result.current.currentStep.type).toBe('action');
      act(() => { result.current.goTo('afterSubmit'); });

      // Step 5: afterSubmit (info) → next
      expect(result.current.currentStep.type).toBe('info');
      act(() => { result.current.goTo('trackStatus'); });

      // Step 6: trackStatus (action) → complete
      act(() => { result.current.goTo('complete'); });

      // Step 7: completion!
      expect(result.current.isComplete).toBe(true);
      expect(result.current.currentStep.type).toBe('completion');
      expect(result.current.history).toHaveLength(6);
    });

    it('handles the "too young" branch', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('ageCheck'); });
      act(() => { result.current.goTo('tooYoung'); }); // chose "Not yet"
      expect(result.current.currentStep.title).toContain('eligible soon');
    });
  });

  describe('Back navigation preserves data', () => {
    const journey = ALL_JOURNEYS.find((j) => j.id === 'first-time-voter');

    it('back through multiple steps preserves collected data', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('ageCheck', { viewed: true }); });
      act(() => { result.current.goTo('documents', { answer: 'yes' }); });
      act(() => { result.current.saveStepData('documents', { checked: ['age-proof'] }); });

      // Go back
      act(() => { result.current.back(); });
      expect(result.current.currentStepId).toBe('ageCheck');

      // Data from earlier steps is preserved
      expect(result.current.data.intro).toEqual({ viewed: true });
      expect(result.current.data.ageCheck).toEqual({ answer: 'yes' });
      expect(result.current.data.documents).toEqual({ checked: ['age-proof'] });
    });
  });

  describe('Reset mid-journey', () => {
    const journey = ALL_JOURNEYS.find((j) => j.id === 'first-time-voter');

    it('reset clears everything and starts over', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('ageCheck'); });
      act(() => { result.current.goTo('documents'); });
      act(() => { result.current.goTo('applyOnline'); });

      act(() => { result.current.reset(); });

      expect(result.current.currentStepId).toBe('intro');
      expect(result.current.history).toEqual([]);
      expect(result.current.data).toEqual({});
      expect(result.current.stepIndex).toBe(0);
    });
  });

  describe('All journeys are completable', () => {
    ALL_JOURNEYS.forEach((journey) => {
      it(`"${journey.id}" has a reachable completion step`, () => {
        // BFS to find a path from startStepId to any completion step
        const visited = new Set();
        const queue = [journey.startStepId];
        let foundCompletion = false;

        while (queue.length > 0) {
          const stepId = queue.shift();
          if (visited.has(stepId)) continue;
          visited.add(stepId);

          const step = journey.steps[stepId];
          if (!step) continue;

          if (step.type === 'completion') {
            foundCompletion = true;
            break;
          }

          // Add all reachable next steps
          if (step.nextStepId) queue.push(step.nextStepId);
          if (step.continueStepId) queue.push(step.continueStepId);
          if (step.choices) {
            step.choices.forEach((c) => queue.push(c.nextStepId));
          }
        }

        expect(foundCompletion, `"${journey.id}" has no path to completion`).toBe(true);
      });
    });
  });
});
