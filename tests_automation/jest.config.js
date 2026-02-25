module.exports = {
    testEnvironment: 'node',
    moduleDirectories: ['node_modules'],
    verbose: true,
    // Map imports from the actual backend if needed
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/../timetable-backend-mern/$1'
    },
    // Stop tests after failures
    bail: 1
};
