import { Difficulty } from '../types';

/**
 * Adaptive difficulty manager
 * - 3 correct answers → level up
 * - 2 wrong answers → level down
 * - Levels: 1-3 only
 */

export class DifficultyManager {
  private correctCount: number = 0;
  private wrongCount: number = 0;
  private currentLevel: Difficulty;

  constructor(startLevel: Difficulty = 1) {
    this.currentLevel = startLevel;
  }

  recordCorrect(): void {
    this.correctCount++;
    this.wrongCount = 0; // Reset wrong streak
  }

  recordWrong(): void {
    this.wrongCount++;
    this.correctCount = 0; // Reset correct streak
  }

  getDifficultyAdjustment(): Difficulty | null {
    if (this.correctCount >= 3 && this.currentLevel < 3) {
      this.currentLevel = Math.min(3, (this.currentLevel + 1) as Difficulty) as Difficulty;
      this.resetCounts();
      return this.currentLevel;
    }

    if (this.wrongCount >= 2 && this.currentLevel > 1) {
      this.currentLevel = Math.max(1, (this.currentLevel - 1) as Difficulty) as Difficulty;
      this.resetCounts();
      return this.currentLevel;
    }

    return null;
  }

  getCurrentLevel(): Difficulty {
    return this.currentLevel;
  }

  getProgress(): { correct: number; wrong: number; needed: number } {
    if (this.currentLevel < 3) {
      return {
        correct: this.correctCount,
        wrong: 0,
        needed: 3,
      };
    }
    return {
      correct: 0,
      wrong: this.wrongCount,
      needed: 2,
    };
  }

  private resetCounts(): void {
    this.correctCount = 0;
    this.wrongCount = 0;
  }
}
