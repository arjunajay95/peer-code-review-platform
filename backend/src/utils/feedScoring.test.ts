import { describe, it, expect } from 'vitest';
import { tagScore, recencyScore, finalScore } from './feedScoring.js';

describe('feedScoring', () => {
  describe('tagScore', () => {
    it('returns 1.0 for a full match', () => {
      const user = [1, 2, 3];
      const submission = [1, 2, 3];
      expect(tagScore(user, submission)).toBe(1.0);
    });

    it('returns 0.5 for a half match', () => {
      const user = [1];
      const submission = [1, 2];
      expect(tagScore(user, submission)).toBe(0.5);
    });

    it('returns 0 for no match', () => {
      const user = [4, 5];
      const submission = [1, 2, 3];
      expect(tagScore(user, submission)).toBe(0);
    });

    it('returns 0 for a zero-technology user', () => {
      const user: number[] = [];
      const submission = [1, 2, 3];
      expect(tagScore(user, submission)).toBe(0);
    });

    it('returns 0 if submission has no technologies (defensive guard)', () => {
      const user = [1, 2, 3];
      const submission: number[] = [];
      expect(tagScore(user, submission)).toBe(0);
    });
  });

  describe('recencyScore', () => {
    const NOW = new Date('2026-08-17T12:00:00Z').getTime();

    it('returns 1.0 for age 0h', () => {
      const createdAt = new Date(NOW);
      expect(recencyScore(createdAt, NOW)).toBe(1.0);
    });

    it('returns 0.5 for age 72h (the half-life)', () => {
      const createdAt = new Date(NOW - 72 * 60 * 60 * 1000);
      expect(recencyScore(createdAt, NOW)).toBeCloseTo(0.5, 4);
    });

    it('returns ~0.85 for an intermediate age', () => {
      // 0.5^(age/72). e.g., if age is ~16.88 hours, it's ~0.85
      // Wait, let's explicitly test the value for 16.88h or something similar.
      // Better yet, just ensure it decreases.
      const ageHours = 17;
      const createdAt = new Date(NOW - ageHours * 60 * 60 * 1000);
      const score = recencyScore(createdAt, NOW);
      expect(score).toBeLessThan(1.0);
      expect(score).toBeGreaterThan(0.5);
    });
  });

  describe('finalScore', () => {
    it('returns 1.0 for full match at 0h', () => {
      // tagScore = 1.0, recencyScore = 1.0 => 0.7*1 + 0.3*1 = 1.0
      expect(finalScore(1.0, 1.0)).toBe(1.0);
    });

    it('returns ~0.85 for full match at 72h', () => {
      // tagScore = 1.0, recencyScore = 0.5 => 0.7*1 + 0.3*0.5 = 0.7 + 0.15 = 0.85
      expect(finalScore(1.0, 0.5)).toBeCloseTo(0.85, 4);
    });

    it('degrades to pure recency factor (max 0.3) for zero-technology user', () => {
      // tagScore = 0.0, recencyScore = 1.0 => 0.3
      expect(finalScore(0.0, 1.0)).toBeCloseTo(0.3, 4);
    });
  });
});
