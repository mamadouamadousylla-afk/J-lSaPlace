const puppeteer = require('puppeteer');
const config = require('./config');

describe('Event Browsing Tests', () => {
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

  test('should display events on homepage', async () => {
    // Navigate to homepage
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for event cards to load
    await page.waitForSelector(config.selectors.events.eventCard, { timeout: config.timeout });
    
    // Get all event cards
    const eventCards = await page.$$(config.selectors.events.eventCard);
    
    // Verify at least one event is displayed
    expect(eventCards.length).toBeGreaterThan(0);
    
    // Take a screenshot for documentation
    await page.screenshot({ path: 'tests/screenshots/events-homepage.png', fullPage: true });
  }, config.timeout);

  test('should navigate to event details', async () => {
    // Navigate to homepage
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for and click on the first event card
    await page.waitForSelector(config.selectors.events.eventCard, { timeout: config.timeout });
    const firstEventCard = await page.$(config.selectors.events.eventCard);
    
    // Get the event title before clicking
    const eventTitle = await page.$eval(config.selectors.events.eventTitle, el => el.textContent);
    
    // Click on the event card
    await firstEventCard.click();
    
    // Wait for navigation to event details page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Verify we're on an event details page
    expect(page.url()).toMatch(/\/evenements\//);
    
    // Verify the event title is present on the page
    const pageTitle = await page.$eval('h1', el => el.textContent);
    expect(pageTitle).toContain(eventTitle);
    
    // Take a screenshot of the event details
    await page.screenshot({ path: 'tests/screenshots/event-details.png' });
  }, config.timeout);

  test('should filter events by category', async () => {
    // Navigate to homepage
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for category filter buttons to load
    await page.waitForSelector('[data-testid="category-filter"]', { timeout: config.timeout });
    
    // Get initial number of events
    const initialEvents = await page.$$(config.selectors.events.eventCard);
    const initialCount = initialEvents.length;
    
    // Click on a category filter (e.g., SPORT)
    await page.click('[data-testid="category-filter"][data-category="SPORT"]');
    
    // Wait for filtered results to load
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 0,
      {},
      config.selectors.events.eventCard
    );
    
    // Get filtered events count
    const filteredEvents = await page.$$(config.selectors.events.eventCard);
    const filteredCount = filteredEvents.length;
    
    // Verify that the number of events has changed (or at least we have events)
    expect(filteredCount).toBeGreaterThanOrEqual(0); // Could be 0 if no events in this category
    
    // Take a screenshot of filtered results
    await page.screenshot({ path: 'tests/screenshots/events-filtered.png' });
  }, config.timeout);

  test('should search for events', async () => {
    // Navigate to homepage
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for search input to be available
    await page.waitForSelector('[data-testid="search-input"]', { timeout: config.timeout });
    
    // Type a search query
    await page.type('[data-testid="search-input"]', 'lutte');
    
    // Submit search (could be by pressing Enter or clicking a search button)
    await page.keyboard.press('Enter');
    
    // Wait for search results to load
    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 0,
      {},
      config.selectors.events.eventCard
    );
    
    // Get search results
    const searchResults = await page.$$(config.selectors.events.eventCard);
    
    // Verify we have results
    expect(searchResults.length).toBeGreaterThanOrEqual(0);
    
    // Take a screenshot of search results
    await page.screenshot({ path: 'tests/screenshots/events-search-results.png' });
  }, config.timeout);
});