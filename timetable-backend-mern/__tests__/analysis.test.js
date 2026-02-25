const analysis = require('../routes/analysis');
const mongoose = require('mongoose');

// Destructure helpers from the router export
const {
    calculateImpactScore,
    classifySeverity,
    generateRecommendations,
    validateObjectId
} = analysis;

describe('Impact Analysis Services - Unit Tests', () => {

    // GROUP 1: Impact Score Calculation (10 tests)
    describe('calculateImpactScore()', () => {
        test('should calculate correctly with updated weights', () => {
            const score = calculateImpactScore(10, 100);
            // (10 * 2) + (100 / 20) = 20 + 5 = 25
            expect(score).toBe(25);
        });

        test('should cap score at 100', () => {
            const score = calculateImpactScore(50, 1000);
            expect(score).toBe(100);
        });

        test('should handle custom weights', () => {
            const score = calculateImpactScore(10, 100, 3, 5);
            // (10 * 3) + (100 / 5) = 30 + 20 = 50
            expect(score).toBe(50);
        });

        test('should handle zero classes', () => {
            const score = calculateImpactScore(0, 100);
            // (0 * 2) + (100 / 20) = 5
            expect(score).toBe(5);
        });

        test('should handle zero students', () => {
            const score = calculateImpactScore(10, 0);
            // (10 * 2) + 0 = 20
            expect(score).toBe(20);
        });

        test('should handle decimal results', () => {
            const score = calculateImpactScore(5, 55);
            // (5 * 2) + (55 / 20) = 10 + 2.75 = 12.75
            expect(score).toBe(12.75);
        });

        test('should handle large numbers', () => {
            const score = calculateImpactScore(1000, 10000);
            expect(score).toBe(100); // Capped
        });

        test('should return number type', () => {
            const score = calculateImpactScore(10, 100);
            expect(typeof score).toBe('number');
        });

        test('should not return NaN', () => {
            const score = calculateImpactScore(10, 100);
            expect(score).not.toBeNaN();
        });

        test('should be deterministic (same input = same output)', () => {
            const score1 = calculateImpactScore(10, 100);
            const score2 = calculateImpactScore(10, 100);
            expect(score1).toBe(score2);
        });
    });

    // GROUP 2: Severity Classification (7 tests)
    describe('classifySeverity()', () => {
        test('should return CRITICAL for score > 75', () => {
            expect(classifySeverity(76)).toBe('CRITICAL');
            expect(classifySeverity(100)).toBe('CRITICAL');
        });

        test('should return HIGH for score 46-75', () => {
            expect(classifySeverity(46)).toBe('HIGH');
            expect(classifySeverity(75)).toBe('HIGH');
        });

        test('should return MEDIUM for score <= 45', () => {
            expect(classifySeverity(0)).toBe('MEDIUM');
            expect(classifySeverity(45)).toBe('MEDIUM');
        });

        test('should handle boundary values correctly', () => {
            expect(classifySeverity(75)).toBe('HIGH');
            expect(classifySeverity(75.1)).toBe('CRITICAL');
            expect(classifySeverity(45)).toBe('MEDIUM');
            expect(classifySeverity(45.1)).toBe('HIGH');
        });

        test('should return string type', () => {
            expect(typeof classifySeverity(50)).toBe('string');
        });

        test('should return uppercase severity', () => {
            const severity = classifySeverity(50);
            expect(severity).toBe(severity.toUpperCase());
        });

        test('should only return valid severities', () => {
            const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM'];
            expect(validSeverities).toContain(classifySeverity(30));
        });
    });

    // GROUP 3: Recommendations Generation (10 tests)
    describe('generateRecommendations()', () => {
        test('should generate 5 recommendations for CRITICAL', () => {
            const recs = generateRecommendations('CRITICAL', 'Dr. Smith');
            expect(recs).toHaveLength(5);
        });

        test('should generate 4 recommendations for HIGH', () => {
            const recs = generateRecommendations('HIGH', 'Dr. Smith');
            expect(recs).toHaveLength(4);
        });

        test('should generate 3 recommendations for MEDIUM', () => {
            const recs = generateRecommendations('MEDIUM', 'Dr. Smith');
            expect(recs).toHaveLength(3);
        });

        test('should include faculty name in recommendations', () => {
            const recs = generateRecommendations('HIGH', 'Dr. Smith');
            const hasName = recs.some(r => r.includes('Dr. Smith'));
            expect(hasName).toBe(true);
        });

        test('should return array of strings', () => {
            const recs = generateRecommendations('HIGH', 'Dr. Smith');
            expect(Array.isArray(recs)).toBe(true);
            recs.forEach(r => expect(typeof r).toBe('string'));
        });

        test('should return non-empty recommendations', () => {
            const recs = generateRecommendations('HIGH', 'Dr. Smith');
            recs.forEach(r => expect(r.length).toBeGreaterThan(0));
        });

        test('CRITICAL should mention Dean/emergency', () => {
            const recs = generateRecommendations('CRITICAL', 'Dr. Smith');
            const hasDean = recs.some(r =>
                r.toLowerCase().includes('dean') ||
                r.toLowerCase().includes('emergency')
            );
            expect(hasDean).toBe(true);
        });

        test('should not have duplicate recommendations', () => {
            const recs = generateRecommendations('HIGH', 'Dr. Smith');
            const unique = [...new Set(recs)];
            expect(recs.length).toBe(unique.length);
        });

        test('should handle unknown severity gracefully', () => {
            const recs = generateRecommendations('UNKNOWN', 'Dr. Smith');
            expect(Array.isArray(recs)).toBe(true);
            expect(recs).toHaveLength(3);
        });

        test('should handle empty faculty name', () => {
            const recs = generateRecommendations('HIGH', '');
            expect(Array.isArray(recs)).toBe(true);
            const hasFaculty = recs.some(r => r.includes('Faculty'));
            expect(hasFaculty).toBe(true);
        });
    });

    // GROUP 4: MongoDB ObjectId Validation (8 tests)
    describe('validateObjectId()', () => {
        // [Existing tests preserved]
        test('should accept valid ObjectId string', () => {
            expect(validateObjectId('507f1f77bcf86cd799439011')).toBe(true);
        });

        test('should accept valid ObjectId object', () => {
            const id = new mongoose.Types.ObjectId();
            expect(validateObjectId(id)).toBe(true);
        });

        test('should reject invalid format', () => {
            expect(validateObjectId('invalid123')).toBe(false);
        });

        test('should reject null', () => {
            expect(validateObjectId(null)).toBe(false);
        });

        test('should reject undefined', () => {
            expect(validateObjectId(undefined)).toBe(false);
        });

        test('should reject empty string', () => {
            expect(validateObjectId('')).toBe(false);
        });

        test('should reject numbers', () => {
            expect(validateObjectId(123)).toBe(false);
        });

        test('should reject objects', () => {
            expect(validateObjectId({})).toBe(false);
        });
    });

    // GROUP 5: Edge Cases (8 tests)
    describe('Edge Case Handling', () => {
        test('should handle negative numbers gracefully', () => {
            const score = calculateImpactScore(-10, -100);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBe(0);
        });

        test('should handle Infinity', () => {
            const score = calculateImpactScore(Infinity, 100);
            expect(score).toBeLessThanOrEqual(100);
            expect(score).toBe(100);
        });

        test('should handle very large numbers', () => {
            const score = calculateImpactScore(999999, 999999);
            expect(score).toBe(100);
        });

        test('should handle very small decimal values', () => {
            const score = calculateImpactScore(0.1, 0.1);
            expect(typeof score).toBe('number');
            // (0.1 * 2) + (0.1 / 20) = 0.2 + 0.005 = 0.205
            expect(score).toBeCloseTo(0.205);
        });

        test('should handle mixed integer and decimal', () => {
            const score = calculateImpactScore(10, 55.5);
            // (10 * 2) + (55.5 / 20) = 20 + 2.775 = 22.775
            expect(score).toBeCloseTo(22.775);
        });

        test('should maintain precision for normal values', () => {
            const score = calculateImpactScore(10, 100);
            // (10 * 2) + (100 / 20) = 20 + 5 = 25
            expect(score).toBe(25);
        });

        test('should not produce negative scores', () => {
            const score = calculateImpactScore(0, 0);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        test('should handle boundary at 100', () => {
            const score = calculateImpactScore(50, 500);
            expect(score).toBe(100);
        });
    });

    // GROUP 6: Performance Tests (2 tests)
    describe('Performance', () => {
        test('should calculate 10,000 scores in < 100ms', () => {
            const start = Date.now();
            for (let i = 0; i < 10000; i++) {
                calculateImpactScore(10, 100);
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100);
        });

        test('should classify 10,000 severities in < 50ms', () => {
            const start = Date.now();
            for (let i = 0; i < 10000; i++) {
                classifySeverity(50);
            }
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(50);
        });
    });

    // GROUP 7: Real-World Scenarios (5 tests)
    describe('Real-World Scenarios', () => {
        test('Part-time lecturer (1 class, 30 students) = MEDIUM impact', () => {
            const score = calculateImpactScore(1, 30);
            // (1 * 2) + (30 / 20) = 2 + 1.5 = 3.5 -> MEDIUM
            expect(classifySeverity(score)).toBe('MEDIUM');
        });

        test('Popular professor (20 classes, 600 students) = HIGH', () => {
            const score = calculateImpactScore(20, 600);
            // (20 * 2) + (600 / 20) = 40 + 30 = 70 -> HIGH (<75)
            expect(classifySeverity(score)).toBe('HIGH');
        });

        test('Department head (20 classes, 800 students) = CRITICAL', () => {
            const score = calculateImpactScore(20, 800);
            // (20 * 2) + (800 / 20) = 40 + 40 = 80 -> CRITICAL (>75)
            expect(classifySeverity(score)).toBe('CRITICAL');
        });

        test('Average faculty (8 classes, 240 students) = MEDIUM', () => {
            const score = calculateImpactScore(8, 240);
            // (8 * 2) + (240 / 20) = 16 + 12 = 28 -> MEDIUM (<45)
            expect(classifySeverity(score)).toBe('MEDIUM');
        });

        test('New faculty (3 classes, 90 students) = MEDIUM', () => {
            const score = calculateImpactScore(3, 90);
            // (3 * 2) + (90 / 20) = 6 + 4.5 = 10.5 -> MEDIUM
            expect(classifySeverity(score)).toBe('MEDIUM');
        });
    });
});
