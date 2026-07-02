import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { matchScore } from "./matchScore";

describe("matchScore Algorithm", () => {
    beforeEach(() => {
        // Lock Date.now() for predictable recencyBoost calculation
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-07-02T10:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Base job mock posted today (0 days since posted => recencyBoost = 1)
    const baseJob = {
        companyId: "company_123",
        category: "Engineering",
        skillsRequired: ["React", "TypeScript", "Node.js"],
        experienceLevel: "MID",
        location: "San Francisco",
        jobType: "HYBRID",
        createdAt: new Date("2026-07-02T10:00:00Z"), // 0 days ago
    };

    it("calculates a high score for a perfect matching profile", () => {
        const seeker = {
            skills: ["React", "TypeScript", "Node.js"],
            interests: ["Engineering"],
            experienceLevel: "MID",
            location: "San Francisco",
        };

        const followedCompanyIds = new Set(["company_123"]);

        // Category: 1 * 0.35 = 0.35
        // Skill: Jaccard(3/3) = 1 * 0.30 = 0.30
        // Location: 'San Francisco' exact = 1 * 0.10 = 0.10
        // Experience: 'MID' exact = 1 * 0.10 = 0.10
        // Recency: 0 days ago = 1 / (1 + 0) = 1 * 0.10 = 0.10
        // Follow: Yes = 1 * 0.05 = 0.05
        // Expected Total = 0.35 + 0.30 + 0.10 + 0.10 + 0.10 + 0.05 = 1.00

        const score = matchScore(seeker, baseJob, followedCompanyIds);
        expect(score).toBeCloseTo(1.0, 5);
    });

    it("calculates a baseline score for a complete mismatch (only recency boost)", () => {
        const seeker = {
            skills: ["Python", "Django"],
            interests: ["Design"],
            experienceLevel: "ENTRY",
            location: "Seattle",
        };

        // Category: 0
        // Skill: Jaccard(0) = 0
        // Location: different = 0
        // Experience: ENTRY vs MID is 2 ranks diff => 0
        // Recency: 0 days = 1 * 0.10 = 0.10
        // Follow: 0
        // Expected Total = 0.10

        const score = matchScore(seeker, baseJob, new Set());
        expect(score).toBeCloseTo(0.10, 5);
    });

    describe("Jaccard Skill Overlap", () => {
        it("handles case insensitivity in skill matches", () => {
            const seeker = {
                skills: ["react", "typescript", "node.js"], // lowercase
                interests: ["Engineering"],
                experienceLevel: "MID",
                location: "San Francisco",
            };

            const score = matchScore(seeker, baseJob); // Follow: 0
            // 1.0 - 0.05 = 0.95 expected
            expect(score).toBeCloseTo(0.95, 5);
        });

        it("handles partial skill overlaps correctly", () => {
            const seeker = {
                skills: ["React", "Go"], // 1 match ("React"), 1 mismatch ("Go"). Union: ["React", "TypeScript", "Node.js", "Go"] (size 4)
                interests: ["Engineering"],
                experienceLevel: "MID",
                location: "San Francisco",
            };

            // Skill overlap size is 1 / 4 = 0.25
            // Skill component: 0.25 * 0.30 = 0.075
            // Expected: 0.35 (category) + 0.075 (skill) + 0.10 (location) + 0.10 (experience) + 0.10 (recency) = 0.725
            const score = matchScore(seeker, baseJob);
            expect(score).toBeCloseTo(0.725, 5);
        });
    });

    describe("Experience Match", () => {
        it("assigns 0.5 weight to adjacent experience levels", () => {
            const seekerAdjacentHigher = {
                skills: ["React", "TypeScript", "Node.js"],
                interests: ["Engineering"],
                experienceLevel: "SENIOR", // job is MID, diff is 1 rank (adjacent)
                location: "San Francisco",
            };

            // Exp match component: 0.5 * 0.10 = 0.05
            // Expected total: 0.95 - 0.05 = 0.90
            const scoreHigher = matchScore(seekerAdjacentHigher, baseJob);
            expect(scoreHigher).toBeCloseTo(0.90, 5);

            const seekerAdjacentLower = {
                ...seekerAdjacentHigher,
                experienceLevel: "JUNIOR", // job is MID, diff is 1 rank (adjacent)
            };
            const scoreLower = matchScore(seekerAdjacentLower, baseJob);
            expect(scoreLower).toBeCloseTo(0.90, 5);
        });

        it("assigns 0 weight to non-adjacent experience levels (rank difference >= 2)", () => {
            const seekerFar = {
                skills: ["React", "TypeScript", "Node.js"],
                interests: ["Engineering"],
                experienceLevel: "ENTRY", // job is MID, diff is 2 ranks (far)
                location: "San Francisco",
            };

            // Exp match component: 0 * 0.10 = 0
            // Expected total: 0.95 - 0.10 = 0.85
            const score = matchScore(seekerFar, baseJob);
            expect(score).toBeCloseTo(0.85, 5);
        });
    });

    describe("Location / Job Type Match", () => {
        it("handles remote job matches by gifting a 50% location boost", () => {
            const remoteJob = {
                ...baseJob,
                location: "Anywhere",
                jobType: "REMOTE",
            };

            const seekerDifferentLoc = {
                skills: ["React", "TypeScript", "Node.js"],
                interests: ["Engineering"],
                experienceLevel: "MID",
                location: "New York", // Job is remote, seeker in New York
            };

            // Location match: Remote always gifts 0.5 score
            // Location component: 0.5 * 0.10 = 0.05
            // Expected Total: 0.35 + 0.30 + 0.05 (loc) + 0.10 + 0.10 = 0.90
            const score = matchScore(seekerDifferentLoc, remoteJob);
            expect(score).toBeCloseTo(0.90, 5);
        });
    });

    describe("Recency Boost Decay", () => {
        it("decays accurately over days", () => {
            const seeker = {
                skills: ["React", "TypeScript", "Node.js"],
                interests: ["Engineering"],
                experienceLevel: "MID",
                location: "San Francisco",
            };

            // 1 day ago job => recencyBoost = 1 / (1 + 1) = 0.5. Component = 0.5 * 0.10 = 0.05
            // Expected Total: 0.95 - 0.05 = 0.90
            const oneDayAgoJob = {
                ...baseJob,
                createdAt: new Date("2026-07-01T10:00:00Z"),
            };
            const scoreOneDay = matchScore(seeker, oneDayAgoJob);
            expect(scoreOneDay).toBeCloseTo(0.90, 5);

            // 9 days ago job => recencyBoost = 1 / (1 + 9) = 0.1. Component = 0.1 * 0.10 = 0.01
            // Expected Total: 0.95 - 0.09 = 0.86
            const nineDaysAgoJob = {
                ...baseJob,
                createdAt: new Date("2026-06-23T10:00:00Z"),
            };
            const scoreNineDays = matchScore(seeker, nineDaysAgoJob);
            expect(scoreNineDays).toBeCloseTo(0.86, 5);
        });
    });
});
