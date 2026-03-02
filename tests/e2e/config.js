// Test configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headless: process.env.HEADLESS !== 'false', // Set to false to see tests in browser
  slowMo: process.env.SLOWMO || 0, // Add delay between actions for easier visualization
  viewport: {
    width: 1366,
    height: 768,
  },
  credentials: {
    // Test user credentials - these should match your test environment
    user: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    }
  },
  selectors: {
    // Common selectors for the application
    header: {
      discoverButton: '[data-testid="discover-btn"]',
      ticketsButton: '[data-testid="tickets-btn"]',
      favoritesButton: '[data-testid="favorites-btn"]',
      profileButton: '[data-testid="profile-btn"]',
    },
    auth: {
      loginButton: '[data-testid="login-btn"]',
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      submitButton: '[data-testid="submit-btn"]',
      logoutButton: '[data-testid="logout-btn"]',
    },
    events: {
      eventCard: '[data-testid="event-card"]',
      eventTitle: '[data-testid="event-title"]',
      bookButton: '[data-testid="book-btn"]',
    },
    booking: {
      firstNameInput: '[data-testid="first-name-input"]',
      lastNameInput: '[data-testid="last-name-input"]',
      whatsappInput: '[data-testid="whatsapp-input"]',
      vipQuantity: '[data-testid="vip-quantity"]',
      standardQuantity: '[data-testid="standard-quantity"]',
      paymentMethod: '[data-testid="payment-method"]',
      confirmBooking: '[data-testid="confirm-booking"]',
    },
    admin: {
      dashboardLink: '[data-testid="admin-dashboard"]',
      eventsLink: '[data-testid="admin-events"]',
      ticketsLink: '[data-testid="admin-tickets"]',
      usersLink: '[data-testid="admin-users"]',
    }
  }
};

module.exports = config;