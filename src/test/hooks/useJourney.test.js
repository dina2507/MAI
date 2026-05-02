/**
 * Unit tests for the useJourney hook (FSM engine for DO mode)
 * Tests state machine transitions, navigation, history, and edge cases.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useJourney } from '../../hooks/useJourney';
import { createMockJourney } from '../helpers';

describe('useJourney Hook', () => {
  const journey = createMockJourney();

  describe('Initialization', () => {
    it('starts at the startStepId', () => {
      const { result } = renderHook(() => useJourney(journey));
      expect(result.current.currentStepId).toBe('step1');
      expect(result.current.currentStep.type).toBe('info');
    });

    it('has empty history on init', () => {
      const { result } = renderHook(() => useJourney(journey));
      expect(result.current.history).toEqual([]);
      expect(result.current.canGoBack).toBe(false);
    });

    it('has empty data on init', () => {
      const { result } = renderHook(() => useJourney(journey));
      expect(result.current.data).toEqual({});
    });

    it('calculates totalSteps correctly', () => {
      const { result } = renderHook(() => useJourney(journey));
      expect(result.current.totalSteps).toBe(5);
    });

    it('calculates stepIndex correctly', () => {
      const { result } = renderHook(() => useJourney(journey));
      expect(result.current.stepIndex).toBe(0);
    });

    it('accepts initial state for resume', () => {
      const initial = {
        currentStepId: 'step2',
        history: ['step1'],
        data: { step1: { visited: true } },
      };
      const { result } = renderHook(() => useJourney(journey, initial));
      expect(result.current.currentStepId).toBe('step2');
      expect(result.current.history).toEqual(['step1']);
      expect(result.current.data).toEqual({ step1: { visited: true } });
      expect(result.current.canGoBack).toBe(true);
    });
  });

  describe('Navigation — goTo', () => {
    it('transitions to the next step', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2'); });
      expect(result.current.currentStepId).toBe('step2');
      expect(result.current.currentStep.type).toBe('choice');
    });

    it('pushes previous step to history', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2'); });
      expect(result.current.history).toEqual(['step1']);
      expect(result.current.canGoBack).toBe(true);
    });

    it('stores step data when transitioning', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2', { answer: 'hello' }); });
      expect(result.current.data).toEqual({ step1: { answer: 'hello' } });
    });

    it('accumulates history through multiple transitions', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2'); });
      act(() => { result.current.goTo('step3a'); });
      expect(result.current.history).toEqual(['step1', 'step2']);
      expect(result.current.currentStepId).toBe('step3a');
    });

    it('does not navigate to nonexistent step', () => {
      const { result } = renderHook(() => useJourney(journey));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      act(() => { result.current.goTo('nonexistent'); });
      expect(result.current.currentStepId).toBe('step1');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('nonexistent')
      );
      warnSpy.mockRestore();
    });
  });

  describe('Navigation — back', () => {
    it('goes back to the previous step', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2'); });
      act(() => { result.current.back(); });
      expect(result.current.currentStepId).toBe('step1');
      expect(result.current.history).toEqual([]);
    });

    it('does nothing when history is empty', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.back(); });
      expect(result.current.currentStepId).toBe('step1');
    });

    it('pops history stack correctly through multiple back()', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2'); });
      act(() => { result.current.goTo('step3a'); });
      act(() => { result.current.goTo('complete'); });
      expect(result.current.history).toEqual(['step1', 'step2', 'step3a']);

      act(() => { result.current.back(); });
      expect(result.current.currentStepId).toBe('step3a');
      expect(result.current.history).toEqual(['step1', 'step2']);

      act(() => { result.current.back(); });
      expect(result.current.currentStepId).toBe('step2');
    });
  });

  describe('Reset', () => {
    it('resets to initial state', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2'); });
      act(() => { result.current.goTo('step3a'); });
      act(() => { result.current.reset(); });
      expect(result.current.currentStepId).toBe('step1');
      expect(result.current.history).toEqual([]);
      expect(result.current.data).toEqual({});
    });
  });

  describe('saveStepData', () => {
    it('saves data for a specific step without navigating', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.saveStepData('step1', { checked: ['item1'] }); });
      expect(result.current.currentStepId).toBe('step1');
      expect(result.current.data).toEqual({ step1: { checked: ['item1'] } });
    });

    it('preserves existing data for other steps', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('step2', { visited: true }); });
      act(() => { result.current.saveStepData('step2', { choice: 'A' }); });
      expect(result.current.data).toEqual({
        step1: { visited: true },
        step2: { choice: 'A' },
      });
    });
  });

  describe('Completion detection', () => {
    it('isComplete is true on completion step', () => {
      const { result } = renderHook(() => useJourney(journey));
      act(() => { result.current.goTo('complete'); });
      expect(result.current.isComplete).toBe(true);
    });

    it('isComplete is false on non-completion steps', () => {
      const { result } = renderHook(() => useJourney(journey));
      expect(result.current.isComplete).toBe(false);
      act(() => { result.current.goTo('step2'); });
      expect(result.current.isComplete).toBe(false);
    });
  });
});
