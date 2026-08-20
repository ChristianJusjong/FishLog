import { expect, element, by } from 'detox';

describe('App Startup', () => {
    it('should display the main initial screen', async () => {
        // This is a basic test that checks if the app launches without crashing
        // You can replace this with checking a specific element ID in your app
        // e.g., await expect(element(by.id('my_welcome_text'))).toBeVisible();

        // For now we just wait a bit to ensure the layout has mounted. 
        // In a real scenario we use proper assertions.
        await new Promise(resolve => setTimeout(resolve, 5000));
    });
});
