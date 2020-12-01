module.exports = {
  testMatch: ["**/test/output/**/*.test.js"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/",
    "/test/",
    "/package/",
  ],
  verbose: true,
};
