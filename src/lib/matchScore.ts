/**
 * Job Match Score Algorithm
 * ─────────────────────────
 * Computes a relevance score [0, 1] for a (seeker, job) pair using
 * weighted multi-criteria content-based filtering.
 *
 * We use content-based filtering (not collaborative) because at MVP stage
 * there is insufficient interaction data (applications, views, ratings) to
 * derive meaningful user-user or item-item similarity matrices.
 *
 * Score formula:
 *   score = 0.35 × categoryMatch
 *         + 0.30 × skillOverlap       (Jaccard similarity)
 *         + 0.10 × locationMatch
 *         + 0.10 × experienceMatch
 *         + 0.10 × recencyBoost       (1 / (1 + daysSincePosted))
 *         + 0.05 × followedCompanyBoost
 *
 * Weights sum to 1.0 and reflect real-world hiring priority:
 * category and skills are the strongest signals, while company
 * affinity is a minor but meaningful tie-breaker.
 */

import { EXPERIENCE_LEVEL_ORDER } from "./constants";

export interface SeekerMatchInput {
  skills: string[];
  interests: string[];       // array of category names
  experienceLevel?: string;
  location?: string;
}

export interface JobMatchInput {
  companyId: string;
  category: string;
  skillsRequired: string[];
  experienceLevel: string;
  location: string;
  jobType: string;           // "REMOTE" | "ONSITE" | "HYBRID"
  createdAt: Date | string;
}

/**
 * Jaccard similarity between two string sets.
 * Returns |A ∩ B| / |A ∪ B|, with 0 when both are empty.
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Experience match: 1 for exact, 0.5 for adjacent level, 0 otherwise.
 */
function experienceMatch(seekerLevel?: string, jobLevel?: string): number {
  if (!seekerLevel || !jobLevel) return 0;
  const seekerRank = EXPERIENCE_LEVEL_ORDER[seekerLevel];
  const jobRank = EXPERIENCE_LEVEL_ORDER[jobLevel];
  if (seekerRank === undefined || jobRank === undefined) return 0;
  const diff = Math.abs(seekerRank - jobRank);
  if (diff === 0) return 1;
  if (diff === 1) return 0.5;
  return 0;
}

/**
 * Location match: 1 for exact, 0.5 if job is remote, 0 otherwise.
 */
function locationMatch(
  seekerLocation: string | undefined,
  jobLocation: string,
  jobType: string
): number {
  if (jobType === "REMOTE") return 0.5;
  if (!seekerLocation) return 0;
  if (seekerLocation.toLowerCase() === jobLocation.toLowerCase()) return 1;
  return 0;
}

/**
 * Recency boost: decays towards 0 as the job gets older.
 * A job posted today scores 0.5 (1/(1+1)); posted 1 week ago ≈ 0.125.
 */
function recencyBoost(createdAt: Date | string): number {
  const posted = new Date(createdAt).getTime();
  const daysSince = (Date.now() - posted) / (1000 * 60 * 60 * 24);
  return 1 / (1 + daysSince);
}

/**
 * Main match score function.
 *
 * @param seeker            - Seeker profile (skills, interests, experienceLevel, location)
 * @param job               - Job document fields needed for scoring
 * @param followedCompanyIds - Set of company User IDs the seeker follows
 * @returns number in [0, 1]
 */
export function matchScore(
  seeker: SeekerMatchInput,
  job: JobMatchInput,
  followedCompanyIds: Set<string> = new Set()
): number {
  const weights = {
    category: 0.35,
    skill: 0.30,
    location: 0.10,
    experience: 0.10,
    recency: 0.10,
    follow: 0.05,
  };

  const category = seeker.interests.includes(job.category) ? 1 : 0;
  const skill = jaccardSimilarity(seeker.skills, job.skillsRequired);
  const location = locationMatch(seeker.location, job.location, job.jobType);
  const experience = experienceMatch(seeker.experienceLevel, job.experienceLevel);
  const recency = recencyBoost(job.createdAt);
  const follow = followedCompanyIds.has(job.companyId) ? 1 : 0;

  return (
    weights.category * category +
    weights.skill * skill +
    weights.location * location +
    weights.experience * experience +
    weights.recency * recency +
    weights.follow * follow
  );
}
