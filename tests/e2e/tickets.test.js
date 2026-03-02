const puppeteer = require('puppeteer');
const config = require('./config');

describe('Ticket Purchase Tests', () => {
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

  test('should successfully book a ticket', async () => {
    // First, ensure user is logged in
    await page.goto(`${config.baseUrl}/mon-compte`, { waitUntil: 'networkidle2' });
    
    // Wait for login elements to appear (if not already logged in)
    if (await page.$(config.selectors.auth.emailInput)) {
      await page.type(config.selectors.auth.emailInput, config.credentials.user.email);
      await page.type(config.selectors.auth.passwordInput, config.credentials.user.password);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click(config.selectors.auth.submitButton)
      ]);
    }
    
    // Navigate to homepage to select an event
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for and click on the first event card
    await page.waitForSelector(config.selectors.events.eventCard, { timeout: config.timeout });
    const firstEventCard = await page.$(config.selectors.events.eventCard);
    await firstEventCard.click();
    
    // Wait for the booking modal to appear
    await page.waitForSelector(config.selectors.booking.firstNameInput, { timeout: config.timeout });
    
    // Fill in booking information
    await page.type(config.selectors.booking.firstNameInput, 'John');
    await page.type(config.selectors.booking.lastNameInput, 'Doe');
    await page.type(config.selectors.booking.whatsappInput, '+221771234567');
    
    // Select ticket quantities
    await page.click(config.selectors.booking.vipQuantity);
    await page.type(config.selectors.booking.vipQuantity, '1'); // Select 1 VIP ticket
    
    // Select payment method
    await page.click(config.selectors.booking.paymentMethod);
    await page.click('[data-value="orange-money"]'); // Select Orange Money
    
    // Confirm booking
    await page.click(config.selectors.booking.confirmBooking);
    
    // Wait for payment processing
    await page.waitForSelector('[data-testid="payment-success"]', { timeout: config.timeout * 2 });
    
    // Verify successful booking
    const successMessage = await page.$eval('[data-testid="payment-success"]', el => el.textContent);
    expect(successMessage).toContain('success');
    
    // Take a screenshot of the successful booking
    await page.screenshot({ path: 'tests/screenshots/ticket-purchase-success.png' });
  }, config.timeout * 3);

  test('should add tickets to favorites', async () => {
    // Navigate to homepage
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for favorite button to be available
    await page.waitForSelector('[data-testid="favorite-btn"]', { timeout: config.timeout });
    
    // Click on favorite button for an event
    const favoriteBtn = await page.$('[data-testid="favorite-btn"]');
    await favoriteBtn.click();
    
    // Wait for confirmation
    await page.waitForSelector('[data-testid="favorite-added"]', { timeout: config.timeout });
    
    // Verify the event was added to favorites
    const favoriteAddedMessage = await page.$eval('[data-testid="favorite-added"]', el => el.textContent);
    expect(favoriteAddedMessage).toContain('added');
    
    // Navigate to favorites page
    await page.click(config.selectors.header.favoritesButton);
    
    // Wait for favorites to load
    await page.waitForSelector('[data-testid="favorite-event"]', { timeout: config.timeout });
    
    // Verify the event appears in favorites
    const favoriteEvents = await page.$('[data-testid="favorite-event"]');
    expect(favoriteEvents).toBeTruthy();
  }, config.timeout);

  test('should view purchased tickets', async () => {
    // Navigate to tickets page
    await page.goto(`${config.baseUrl}/mon-compte/tickets`, { waitUntil: 'networkidle2' });
    
    // Wait for tickets to load
    await page.waitForSelector('[data-testid="ticket-card"]', { timeout: config.timeout });
    
    // Verify at least one ticket is displayed
    const tickets = await page.$$('.[data-testid="ticket-card"]');
    expect(tickets.length).toBeGreaterThan(0);
    
    // Verify ticket details are correct
    const firstTicketTitle = await page.$eval('[data-testid="ticket-title"]', el => el.textContent);
    expect(firstTicketTitle).toBeTruthy();
    
    // Take a screenshot of the tickets page
    await page.screenshot({ path: 'tests/screenshots/user-tickets.png' });
  }, config.timeout);
});