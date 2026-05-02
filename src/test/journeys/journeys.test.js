/**
 * Data integrity tests for all 6 journey JSON definitions.
 */
import { describe, it, expect } from 'vitest';
import { ALL_JOURNEYS, JOURNEY_MAP, getJourney } from '../../journeys/index';

describe('Journeys Module', () => {
  it('loads all 6 journeys', () => {
    expect(ALL_JOURNEYS).toHaveLength(6);
  });

  it('each journey has required fields', () => {
    const fields = ['id', 'title', 'subtitle', 'icon', 'accent', 'estimatedTime', 'startStepId', 'steps'];
    ALL_JOURNEYS.forEach((j) => {
      fields.forEach((f) => expect(j, `"${j.id}" missing "${f}"`).toHaveProperty(f));
    });
  });

  it('each journey has unique id', () => {
    const ids = ALL_JOURNEYS.map((j) => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('startStepId exists in steps', () => {
    ALL_JOURNEYS.forEach((j) => {
      expect(j.steps).toHaveProperty(j.startStepId);
    });
  });

  it('each journey has a completion step', () => {
    ALL_JOURNEYS.forEach((j) => {
      const hasCompletion = Object.values(j.steps).some((s) => s.type === 'completion');
      expect(hasCompletion, `"${j.id}" has no completion step`).toBe(true);
    });
  });

  it('all steps have id, type, title', () => {
    ALL_JOURNEYS.forEach((j) => {
      Object.values(j.steps).forEach((s) => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('type');
        expect(s).toHaveProperty('title');
      });
    });
  });

  it('step types are valid', () => {
    const valid = ['info', 'choice', 'checklist', 'action', 'completion'];
    ALL_JOURNEYS.forEach((j) => {
      Object.values(j.steps).forEach((s) => {
        expect(valid).toContain(s.type);
      });
    });
  });

  it('choice steps have valid choices with nextStepId', () => {
    ALL_JOURNEYS.forEach((j) => {
      Object.values(j.steps).filter((s) => s.type === 'choice').forEach((s) => {
        expect(Array.isArray(s.choices)).toBe(true);
        expect(s.choices.length).toBeGreaterThan(0);
        s.choices.forEach((c) => {
          expect(c).toHaveProperty('label');
          expect(c).toHaveProperty('nextStepId');
          expect(j.steps).toHaveProperty(c.nextStepId);
        });
      });
    });
  });

  it('checklist steps have items', () => {
    ALL_JOURNEYS.forEach((j) => {
      Object.values(j.steps).filter((s) => s.type === 'checklist').forEach((s) => {
        expect(Array.isArray(s.items)).toBe(true);
        s.items.forEach((item) => {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('label');
        });
      });
    });
  });

  it('action steps have action object', () => {
    ALL_JOURNEYS.forEach((j) => {
      Object.values(j.steps).filter((s) => s.type === 'action').forEach((s) => {
        expect(s).toHaveProperty('action');
        expect(s.action).toHaveProperty('type');
        expect(s.action).toHaveProperty('label');
      });
    });
  });

  it('all step references point to valid steps', () => {
    ALL_JOURNEYS.forEach((j) => {
      const ids = Object.keys(j.steps);
      Object.values(j.steps).forEach((s) => {
        if (s.nextStepId) expect(ids).toContain(s.nextStepId);
        if (s.continueStepId) expect(ids).toContain(s.continueStepId);
      });
    });
  });

  it('JOURNEY_MAP keyed by id', () => {
    ALL_JOURNEYS.forEach((j) => {
      expect(JOURNEY_MAP[j.id]).toBe(j);
    });
  });

  it('getJourney returns correct journey', () => {
    expect(getJourney('first-time-voter').id).toBe('first-time-voter');
  });

  it('getJourney returns null for unknown', () => {
    expect(getJourney('nope')).toBeNull();
    expect(getJourney('')).toBeNull();
    expect(getJourney(undefined)).toBeNull();
  });

  it('finds all known journey IDs', () => {
    // Use actual IDs from the journey JSON files
    const expectedIds = ALL_JOURNEYS.map((j) => j.id);
    expectedIds.forEach((id) => {
      expect(getJourney(id), `getJourney("${id}") returned null`).not.toBeNull();
    });
  });
});
