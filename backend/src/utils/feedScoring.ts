import { FEED_HALF_LIFE_HOURS, FEED_RECENCY_WEIGHT, FEED_TAG_WEIGHT } from '../config/constants.js';

/**
 * Calculates the overlap of technologies between user and submission.
 * tagScore(U,S) = |T(U) ∩ T(S)| / |T(S)|
 * 
 * @param userTechIds Array of technology IDs the user has
 * @param submissionTechIds Array of technology IDs on the submission
 * @returns A score between 0 and 1
 */
export function tagScore(userTechIds: number[], submissionTechIds: number[]): number {
  if (submissionTechIds.length === 0) {
    return 0; // Guard defensively against division by zero
  }

  const userSet = new Set(userTechIds);
  let matchCount = 0;

  for (const techId of submissionTechIds) {
    if (userSet.has(techId)) {
      matchCount++;
    }
  }

  return matchCount / submissionTechIds.length;
}

/**
 * Calculates the exponential recency decay score for a submission.
 * recency(S) = exp( -LAMBDA * ageInHours(S) )
 * LAMBDA = ln(2) / 72
 * 
 * @param createdAt The creation date of the submission
 * @param now The current date (injected for testing, defaults to Date.now())
 * @returns A score between 0 and 1
 */
export function recencyScore(createdAt: Date, now: number = Date.now()): number {
  const ageMs = now - createdAt.getTime();
  const ageInHours = Math.max(0, ageMs / (1000 * 60 * 60)); // Ensure non-negative age
  
  const lambda = Math.LN2 / FEED_HALF_LIFE_HOURS;
  return Math.exp(-lambda * ageInHours);
}

/**
 * Calculates the final blended score for a personalized feed item.
 * finalScore(U,S) = 0.7 * tagScore + 0.3 * recency
 * 
 * @param tagScoreVal The calculated tag score (0..1)
 * @param recencyScoreVal The calculated recency score (0..1)
 * @returns The final blended score
 */
export function finalScore(tagScoreVal: number, recencyScoreVal: number): number {
  return (FEED_TAG_WEIGHT * tagScoreVal) + (FEED_RECENCY_WEIGHT * recencyScoreVal);
}
