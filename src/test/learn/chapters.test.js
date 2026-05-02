/**
 * Data integrity tests for the learn/chapters module.
 * Validates all chapter definitions and section structures.
 */
import { describe, it, expect } from 'vitest';
import { CHAPTERS, CHAPTER_MAP } from '../../learn/chapters';

describe('Learn Chapters Module', () => {
  it('exports CHAPTERS array', () => {
    expect(Array.isArray(CHAPTERS)).toBe(true);
    expect(CHAPTERS.length).toBeGreaterThan(0);
  });

  it('has 6 chapters', () => {
    expect(CHAPTERS).toHaveLength(6);
  });

  it('each chapter has required fields', () => {
    const fields = ['id', 'number', 'title', 'subtitle', 'readTime', 'icon', 'accent', 'sections'];
    CHAPTERS.forEach((ch) => {
      fields.forEach((f) => {
        expect(ch, `Chapter "${ch.id}" missing "${f}"`).toHaveProperty(f);
      });
    });
  });

  it('each chapter has unique id', () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chapter numbers are sequential 2-digit strings', () => {
    CHAPTERS.forEach((ch, i) => {
      const expected = String(i + 1).padStart(2, '0');
      expect(ch.number).toBe(expected);
    });
  });

  it('each chapter has at least one section', () => {
    CHAPTERS.forEach((ch) => {
      expect(ch.sections.length, `Chapter "${ch.id}" has no sections`).toBeGreaterThan(0);
    });
  });

  it('sections have valid types', () => {
    const validTypes = ['prose', 'callout', 'timeline', 'quiz', 'evm'];
    CHAPTERS.forEach((ch) => {
      ch.sections.forEach((s) => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('type');
        expect(validTypes, `"${s.id}" in "${ch.id}" has invalid type "${s.type}"`).toContain(s.type);
      });
    });
  });

  it('quiz sections have proper question structure', () => {
    CHAPTERS.forEach((ch) => {
      ch.sections.filter((s) => s.type === 'quiz').forEach((s) => {
        expect(s).toHaveProperty('question');
        expect(s.question).toHaveProperty('question');
        expect(s.question).toHaveProperty('options');
        expect(Array.isArray(s.question.options)).toBe(true);
        expect(s.question.options.length).toBeGreaterThanOrEqual(2);
        expect(s.question).toHaveProperty('correct');
        expect(typeof s.question.correct).toBe('number');
        expect(s.question.correct).toBeGreaterThanOrEqual(0);
        expect(s.question.correct).toBeLessThan(s.question.options.length);
        expect(s.question).toHaveProperty('explanation');
      });
    });
  });

  it('timeline sections have items array', () => {
    CHAPTERS.forEach((ch) => {
      ch.sections.filter((s) => s.type === 'timeline').forEach((s) => {
        expect(Array.isArray(s.items)).toBe(true);
        s.items.forEach((item) => {
          expect(item).toHaveProperty('year');
          expect(item).toHaveProperty('event');
        });
      });
    });
  });

  it('callout sections have calloutType', () => {
    CHAPTERS.forEach((ch) => {
      ch.sections.filter((s) => s.type === 'callout').forEach((s) => {
        expect(s).toHaveProperty('calloutType');
        expect(['fact', 'warning', 'tip']).toContain(s.calloutType);
      });
    });
  });

  it('section ids are unique within each chapter', () => {
    CHAPTERS.forEach((ch) => {
      const ids = ch.sections.map((s) => s.id);
      expect(new Set(ids).size, `Duplicate section IDs in "${ch.id}"`).toBe(ids.length);
    });
  });

  it('CHAPTER_MAP keyed by chapter id', () => {
    CHAPTERS.forEach((ch) => {
      expect(CHAPTER_MAP[ch.id]).toBe(ch);
    });
  });
});
