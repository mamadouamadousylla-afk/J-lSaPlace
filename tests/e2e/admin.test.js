const puppeteer = require('puppeteer');
const config = require('./config');

describe('Admin Panel Tests', () => {
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

  test('should successfully login to admin panel', async () => {
    // Navigate to admin login page
    await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle2' });
    
    // Wait for login elements to appear
    await page.waitForSelector(config.selectors.auth.emailInput, { timeout: config.timeout });
    
    // Fill in admin credentials
    await page.type(config.selectors.auth.emailInput, config.credentials.admin.email);
    await page.type(config.selectors.auth.passwordInput, config.credentials.admin.password);
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click(config.selectors.auth.submitButton)
    ]);
    
    // Verify successful login by checking if we're on the admin dashboard
    await page.waitForSelector(config.selectors.admin.dashboardLink, { timeout: config.timeout });
    expect(page.url()).toContain('/admin');
    
    // Take a screenshot of the admin dashboard
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard.png' });
  }, config.timeout);

  test('should display admin dashboard with statistics', async () => {
    // Ensure we're on the admin dashboard
    await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle2' });
    
    // Wait for dashboard elements to load
    await page.waitForSelector('[data-testid="dashboard-stats"]', { timeout: config.timeout });
    
    // Verify statistics are displayed
    const statsElement = await page.$('[data-testid="dashboard-stats"]');
    expect(statsElement).toBeTruthy();
    
    // Verify event count is displayed
    const eventCount = await page.$('[data-testid="stats-events"]');
    expect(eventCount).toBeTruthy();
    
    // Verify ticket count is displayed
    const ticketCount = await page.$('[data-testid="stats-tickets"]');
    expect(ticketCount).toBeTruthy();
    
    // Verify revenue is displayed
    const revenue = await page.$('[data-testid="stats-revenue"]');
    expect(revenue).toBeTruthy();
  }, config.timeout);

  test('should navigate to events management', async () => {
    // Navigate to admin events page
    await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle2' });
    
    // Wait for and click on events link
    await page.waitForSelector(config.selectors.admin.eventsLink, { timeout: config.timeout });
    await page.click(config.selectors.admin.eventsLink);
    
    // Wait for navigation to events page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Verify we're on the events management page
    expect(page.url()).toContain('/admin/events');
    
    // Verify events list is displayed
    await page.waitForSelector('[data-testid="event-list"]', { timeout: config.timeout });
    const eventsList = await page.$('[data-testid="event-list"]');
    expect(eventsList).toBeTruthy();
    
    // Take a screenshot of the events management page
    await page.screenshot({ path: 'tests/screenshots/admin-events.png' });
  }, config.timeout);

  test('should navigate to tickets management', async () => {
    // Navigate to admin tickets page
    await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle2' });
    
    // Wait for and click on tickets link
    await page.waitForSelector(config.selectors.admin.ticketsLink, { timeout: config.timeout });
    await page.click(config.selectors.admin.ticketsLink);
    
    // Wait for navigation to tickets page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Verify we're on the tickets management page
    expect(page.url()).toContain('/admin/tickets');
    
    // Verify tickets list is displayed
    await page.waitForSelector('[data-testid="ticket-list"]', { timeout: config.timeout });
    const ticketsList = await page.$('[data-testid="ticket-list"]');
    expect(ticketsList).toBeTruthy();
    
    // Verify validation functionality exists
    const validationSection = await page.$('[data-testid="ticket-validation"]');
    expect(validationSection).toBeTruthy();
    
    // Take a screenshot of the tickets management page
    await page.screenshot({ path: 'tests/screenshots/admin-tickets.png' });
  }, config.timeout);

  test('should validate a ticket in admin panel', async () => {
    // Navigate to admin tickets page
    await page.goto(`${config.baseUrl}/admin/tickets`, { waitUntil: 'networkidle2' });
    
    // Wait for validation section to load
    await page.waitForSelector('[data-testid="validation-input"]', { timeout: config.timeout });
    
    // Enter a sample ticket ID to validate
    await page.type('[data-testid="validation-input"]', 'SL-TEST-VALIDATION-CODE');
    
    // Click the validate button
    await page.click('[data-testid="validate-ticket-btn"]');
    
    // Wait for validation result
    await page.waitForSelector('[data-testid="validation-result"]', { timeout: config.timeout });
    
    // Verify validation result is displayed
    const validationResult = await page.$eval('[data-testid="validation-result"]', el => el.textContent);
    expect(validationResult).toBeTruthy();
    
    // Take a screenshot of the validation result
    await page.screenshot({ path: 'tests/screenshots/ticket-validation.png' });
  }, config.timeout);

  test('should navigate to users management', async () => {
    // Navigate to admin users page
    await page.goto(`${config.baseUrl}/admin`, { waitUntil: 'networkidle2' });
    
    // Wait for and click on users link
    await page.waitForSelector(config.selectors.admin.usersLink, { timeout: config.timeout });
    await page.click(config.selectors.admin.usersLink);
    
    // Wait for navigation to users page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Verify we're on the users management page
    expect(page.url()).toContain('/admin/users');
    
    // Verify users list is displayed
    await page.waitForSelector('[data-testid="user-list"]', { timeout: config.timeout });
    const usersList = await page.$('[data-testid="user-list"]');
    expect(usersList).toBeTruthy();
    
    // Take a screenshot of the users management page
    await page.screenshot({ path: 'tests/screenshots/admin-users.png' });
  }, config.timeout);
});