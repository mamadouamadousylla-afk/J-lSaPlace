#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const TEST_DIR = './e2e';
const SCREENSHOTS_DIR = '../screenshots';

// Ensure screenshots directory exists
const fs = require('fs');
const screenshotsPath = path.join(__dirname, SCREENSHOTS_DIR);
if (!fs.existsSync(screenshotsPath)) {
  fs.mkdirSync(screenshotsPath, { recursive: true });
}

// Environment variables for tests
const env = {
  ...process.env,
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  HEADLESS: process.env.HEADLESS || 'true', // Default to headless for CI
  TIMEOUT: process.env.TIMEOUT || '30000'
};

console.log('🧪 Starting End-to-End Tests...\n');
console.log('🔧 Environment:');
console.log(`   - Base URL: ${env.BASE_URL}`);
console.log(`   - Headless: ${env.HEADLESS}`);
console.log(`   - Timeout: ${env.TIMEOUT}ms\n`);

// Alternative: Run with Jest if available
function runWithJest() {
  console.log('🔍 Running tests with Jest...');
  
  const jestArgs = [
    '--testMatch="<rootDir>/e2e/**/*.test.js"',
    '--verbose',
    `--setupFilesAfterEnv=<rootDir>/e2e/setup.js`,
    `--testTimeout=${env.TIMEOUT}`,
    '--passWithNoTests' // Don't fail if no tests are found
  ];
  
  // Change working directory to parent (where package.json is)
  const jestProcess = spawn('npx', ['jest', ...jestArgs], {
    stdio: 'inherit',
    env: env,
    cwd: path.dirname(__dirname) // Go up one level to the project root
  });
  
  jestProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 All tests passed with Jest!');
    } else {
      console.log('\n💥 Some tests failed with Jest.');
    }
    process.exit(code);
  });
  
  jestProcess.on('error', (err) => {
    console.error('💥 Error running Jest:', err.message);
    process.exit(1);
  });
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node run-tests.js

Environment Variables:
  BASE_URL      Base URL for tests (default: http://localhost:3000)
  HEADLESS      Headless mode (true/false) (default: true)
  SLOWMO        Add delay between actions (default: 0)
  TIMEOUT       Test timeout in ms (default: 30000)
  
Examples:
  BASE_URL=http://localhost:3001 HEADLESS=false node run-tests.js
  `);
} else {
  // By default, run with Jest
  runWithJest();
}