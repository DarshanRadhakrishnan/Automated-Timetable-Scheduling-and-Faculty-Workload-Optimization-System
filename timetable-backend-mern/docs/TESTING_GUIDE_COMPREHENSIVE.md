# Comprehensive Testing Guide

## Table of Contents
1. Introduction
2. Testing Philosophy
3. Unit Testing with Jest
4. Integration Testing with Supertest
5. API Testing with Postman
6. Test Coverage
7. CI/CD Integration
8. Troubleshooting
9. Best Practices

## 1. Introduction
This guide establishes the comprehensive testing strategy for the Timetable Scheduling System's Impact Analysis Module. The goal is to ensure reliability, correctness, and performance of critical features like faculty load calculation and room conflict detection.

We use **Jest** as our primary test runner due to its holistic feature set (mocking, assertions, coverage) and **Supertest** for HTTP assertions.

## 2. Testing Philosophy
### Why Test?
- **Catch bugs early**: Identify logic errors before deployment.
- **Document behavior**: Tests serve as live documentation of expected system behavior.
- **Enable refactoring**: Confidently optimize code knowing regression tests will catch regressions.
- **Build confidence**: Determine if the system is production-ready.

### Testing Pyramid
1. **Unit Tests (Base)**: Test individual functions (e.g., `calculateImpactScore`). Fast, isolated, numerous (60+).
2. **Integration Tests (Middle)**: Test API endpoints and database interactions. Moderate speed (39+).
3. **E2E/API Tests (Top)**: Test full user flows using Postman. Slower but realistic.

## 3. Unit Testing with Jest

### Setup
Ensure dependencies are installed:
```bash
npm install --save-dev jest @types/jest
```

### Writing Unit Tests
Tests are located in `__tests__/analysis.test.js`.
Structure your tests using `describe` blocks for grouping and `test` (or `it`) for assertions.

**Example:**
```javascript
const { calculateImpactScore } = require('../routes/analysis');

describe('calculateImpactScore', () => {
    test('should calculate correctly', () => {
        // Arrange
        const classes = 10;
        const students = 100;
        // Act
        const result = calculateImpactScore(classes, students);
        // Assert
        expect(result).toBe(30);
    });
});
```

### Mocking
We test implementation logic. If external dependencies (like DB) are imported, they should be mocked or the logic separated into pure functions. In our case, helper functions are pure and require no mocking.

### Running Tests
- **Run all tests**: `npm test`
- **Run unit tests only**: `npm run test:unit`
- **Watch mode**: `npm run test:watch` (reruns on file change)

## 4. Integration Testing

### Database Setup
We use a dedicated test database (`timetable_test`) or a temporary in-memory instance to avoid corrupting production data.
See `__tests__/analysis.api.test.js` for setup/teardown logic using `beforeAll` and `afterAll`.

### API Testing with Supertest
Supertest allows processing HTTP requests without a running server port.
**Example:**
```javascript
const request = require('supertest');
const app = require('../index');

test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
});
```

## 5. Postman Testing

### Importing Collection
1. Open Postman.
2. Click **Import** > **File**.
3. Select `Timetable_Analysis_API.postman_collection.json`.
4. The collection will appear in your sidebar.

### Environment Variables
Configure a local environment variable `baseUrl` set to `http://localhost:5000`. This allows switching between local, staging, and production easily.

### Running Tests
Use the **Collection Runner** to execute all 15+ requests sequentially. This validates the live server response against expected schemas.

## 6. Test Coverage

### Goals
- **Lines**: > 94%
- **Functions**: > 96%
- **Branches**: > 89%

### Generating Reports
Run `npm run test:coverage`.
This generates a `coverage/` folder. Open `coverage/lcov-report/index.html` in your browser to inspect uncovered lines.

## 7. CI/CD Integration

### GitHub Actions Workflow
Create `.github/workflows/test.yml`:
```yaml
name: Node.js CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x]
        mongodb-version: [5.0]

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Start MongoDB
      uses: supercharge/mongodb-github-action@1.6.0
      with:
        mongodb-version: ${{ matrix.mongodb-version }}

    - run: npm ci
    - run: npm test
```

## 8. Troubleshooting

### Common Issues
- **EADDRINUSE**: Ensure the server isn't already running on port 5000 when running integration tests (unless using supertest with exported app).
- **Timeout**: Mongoose connection might be slow. Increase timeout in jest config or setup.
- **DB Connection Error**: Verify local MongoDB instance is running (`net start MongoDB`).

## 9. Best Practices
- **Isolation**: Tests should not depend on each other.
- **determinism**: Using random data? Ensure specific seeds or ranges.
- **Clean State**: Always clean the DB before/after tests.
- **Meaningful Names**: Test names should describe the behavior (e.g., `should return 400 if facultyId is missing`).

---
**Maintained by**: Development Team
**Last Updated**: 2024
