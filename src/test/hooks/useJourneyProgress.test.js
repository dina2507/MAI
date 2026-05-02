/**
 * Unit tests for useJourneyProgress — localStorage persistence layer
 * Tests save/load/clear/complete progress and 7-day expiry logic.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProgress,
  loadProgress,
  clearProgress,
  markComplete,
  isJourneyComplete,
} from '../../hooks/useJourneyProgress';

describe('useJourneyProgress — Persistence Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveProgress / loadProgress', () => {
    it('saves and loads journey progress', () => {
      const state = {
        currentStepId: 'step2',
        history: ['step1'],
        data: { step1: { answer: 'yes' } },
      };
      saveProgress('test-journey', state);
      const loaded = loadProgress('test-journey');
      expect(loaded).not.toBeNull();
      expect(loaded.currentStepId).toBe('step2');
      expect(loaded.history).toEqual(['step1']);
      expect(loaded.data).toEqual({ step1: { answer: 'yes' } });
      expect(loaded.savedAt).toBeDefined();
    });

    it('returns null when no progress saved', () => {
      const loaded = loadProgress('nonexistent');
      expect(loaded).toBeNull();
    });

    it('stores progress under correct key', () => {
      saveProgress('my-journey', { currentStepId: 's1', history: [], data: {} });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mai-journey-my-journey',
        expect.any(String)
      );
    });
  });

  describe('7-day expiry', () => {
    it('expires progress older than 7 days', () => {
      const oldState = {
        currentStepId: 'step1',
        history: [],
        data: {},
        savedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
      };
      localStorage.setItem('mai-journey-old', JSON.stringify(oldState));
      // Reset the mock call tracking since we called it directly
      localStorage.setItem.mockClear();

      const loaded = loadProgress('old');
      expect(loaded).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('mai-journey-old');
    });

    it('keeps progress younger than 7 days', () => {
      const freshState = {
        currentStepId: 'step2',
        history: ['step1'],
        data: {},
        savedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      };
      localStorage.setItem('mai-journey-fresh', JSON.stringify(freshState));
      const loaded = loadProgress('fresh');
      expect(loaded).not.toBeNull();
      expect(loaded.currentStepId).toBe('step2');
    });
  });

  describe('clearProgress', () => {
    it('removes progress from localStorage', () => {
      saveProgress('test', { currentStepId: 's1', history: [], data: {} });
      clearProgress('test');
      expect(localStorage.removeItem).toHaveBeenCalledWith('mai-journey-test');
    });
  });

  describe('markComplete / isJourneyComplete', () => {
    it('marks a journey as complete', () => {
      markComplete('first-time-voter');
      expect(isJourneyComplete('first-time-voter')).toBe(true);
    });

    it('returns false for non-completed journeys', () => {
      expect(isJourneyComplete('unknown-journey')).toBe(false);
    });

    it('clears in-progress state when marking complete', () => {
      saveProgress('first-time-voter', { currentStepId: 's2', history: ['s1'], data: {} });
      markComplete('first-time-voter');
      expect(localStorage.removeItem).toHaveBeenCalledWith('mai-journey-first-time-voter');
    });

    it('supports multiple completed journeys', () => {
      markComplete('journey-a');
      markComplete('journey-b');
      expect(isJourneyComplete('journey-a')).toBe(true);
      expect(isJourneyComplete('journey-b')).toBe(true);
      expect(isJourneyComplete('journey-c')).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('loadProgress handles corrupted JSON gracefully', () => {
      localStorage.setItem('mai-journey-corrupt', 'not-json!!!');
      const loaded = loadProgress('corrupt');
      expect(loaded).toBeNull();
    });

    it('isJourneyComplete handles corrupted data gracefully', () => {
      localStorage.setItem('mai-journeys-completed', '{invalid-json');
      // The function catches the error internally
      const result = isJourneyComplete('test');
      expect(result).toBe(false);
    });
  });
});
