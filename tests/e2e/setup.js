// Jest setup file for Puppeteer tests

// Set default timeout for all tests
jest.setTimeout(process.env.TIMEOUT || 30000);

// Setup function to run before all tests
beforeAll(async () => {
  console.log('Setting up Puppeteer tests...');
});

// Teardown function to run after all tests
afterAll(async () => {
  console.log('Cleaning up after Puppeteer tests...');
});

// Reset state between tests
beforeEach(async () => {
  // Any setup needed before each test
});

afterEach(async () => {
  // Any cleanup needed after each test
});