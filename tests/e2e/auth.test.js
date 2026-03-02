const puppeteer = require('puppeteer');
const config = require('./config');

describe('Authentication Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
    });
    page = await browser.newPage();
    await page.setViewport(config.viewport);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should successfully login user', async () => {
    // Navigate to the profile page (which should redirect to login)
    await page.goto(`${config.baseUrl}/mon-compte`, { waitUntil: 'networkidle2' });
    
    // Wait for login elements to appear
    await page.waitForSelector(config.selectors.auth.emailInput, { timeout: config.timeout });
    
    // Fill in login credentials
    await page.type(config.selectors.auth.emailInput, config.credentials.user.email);
    await page.type(config.selectors.auth.passwordInput, config.credentials.user.password);
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click(config.selectors.auth.submitButton)
    ]);
    
    // Verify successful login by checking if we're on the profile page
    await page.waitForSelector(config.selectors.auth.logoutButton, { timeout: config.timeout });
    expect(page.url()).toContain('/mon-compte');
  }, config.timeout);

  test('should successfully logout user', async () => {
    // Navigate to profile page
    await page.goto(`${config.baseUrl}/mon-compte`, { waitUntil: 'networkidle2' });
    
    // Wait for and click logout button
    await page.waitForSelector(config.selectors.auth.logoutButton, { timeout: config.timeout });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click(config.selectors.auth.logoutButton)
    ]);
    
    // Verify successful logout by checking if we're redirected to homepage
    expect(page.url()).toBe(config.baseUrl + '/');
  }, config.timeout);

  test('should show error for invalid credentials', async () => {
    // Navigate to login page
    await page.goto(`${config.baseUrl}/mon-compte`, { waitUntil: 'networkidle2' });
    
    // Fill in invalid credentials
    await page.type(config.selectors.auth.emailInput, 'invalid@example.com');
    await page.type(config.selectors.auth.passwordInput, 'wrongpassword');
    
    // Submit the form
    await page.click(config.selectors.auth.submitButton);
    
    // Wait for error message to appear
    await page.waitForSelector('[data-testid="error-message"]', { timeout: config.timeout });
    
    // Verify error message is displayed
    const errorMessage = await page.$eval('[data-testid="error-message"]', el => el.textContent);
    expect(errorMessage).toContain('Invalid');
  }, config.timeout);
});