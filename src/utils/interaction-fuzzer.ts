/**
 * Deep Interaction Fuzzer
 * Intelligently simulates a wide variety of user behaviors to trigger hidden or lazy-loaded API calls
 * This addresses complex SPAs that require specific interaction sequences
 */

import type { Page } from 'playwright';

// Configuration for fuzzing actions
const FUZZER_CONFIG = {
    MAX_CLICKS: 5, // Max elements to randomly click
    SCROLL_POSITIONS: [0.25, 0.5, 0.75], // Percentage points to scroll to
    INPUT_MAX_FOCUS: 3, // Max inputs to focus/blur
    INTERACTION_DELAY_MS: 500, // Small delay between actions
};

export interface FuzzerConfig {
    maxClicks?: number;
    scrollPositions?: number[];
    inputMaxFocus?: number;
    interactionDelayMs?: number;
}

/**
 * Performs deep interaction fuzzing to trigger hidden APIs in complex SPAs
 * 
 * Actions performed:
 * 1. Random scroll events at common lazy-load points (25%, 50%, 75%)
 * 2. Focus/blur input fields to trigger validation/pre-fetch APIs
 * 3. Random clicks on interactive elements (buttons, links, role=button)
 * 4. Wait for network to settle after all interactions
 * 
 * @param page - Playwright page instance
 * @param log - Logger instance
 * @param config - Optional configuration to override defaults
 */
export async function deepInteractionFuzzing(
    page: Page,
    log: any,
    config?: FuzzerConfig
): Promise<void> {
    const fuzzerConfig = { ...FUZZER_CONFIG, ...config };
    
    log.info('Starting Deep Interaction Fuzzing to trigger hidden APIs...');

    try {
        // --- Action 1: Random Scroll Events ---
        // Scrolls to common lazy-load trigger points
        for (const pos of fuzzerConfig.scrollPositions || FUZZER_CONFIG.SCROLL_POSITIONS) {
            try {
                // Calculate scroll height based on page size
                const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
                const targetScroll = Math.floor(scrollHeight * pos);
                
                await page.evaluate((target) => {
                    window.scrollTo({ top: target, behavior: 'smooth' });
                }, targetScroll);
                
                await page.waitForTimeout(fuzzerConfig.interactionDelayMs || FUZZER_CONFIG.INTERACTION_DELAY_MS);
            } catch (error) {
                log.debug(`Scroll to ${pos * 100}% failed: ${error}`);
            }
        }
        log.debug('Scrolled through common lazy-load points.');

        // --- Action 2: Focus/Blur Input Fields ---
        // Triggers validation APIs or autosave/pre-fetch APIs
        try {
            const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea').all();
            const inputsToFuzz = inputs.slice(0, fuzzerConfig.inputMaxFocus || FUZZER_CONFIG.INPUT_MAX_FOCUS);

            for (const input of inputsToFuzz) {
                try {
                    await input.focus();
                    await page.waitForTimeout((fuzzerConfig.interactionDelayMs || FUZZER_CONFIG.INTERACTION_DELAY_MS) / 2);
                    await input.blur();
                    await page.waitForTimeout((fuzzerConfig.interactionDelayMs || FUZZER_CONFIG.INTERACTION_DELAY_MS) / 2);
                } catch (error) {
                    // Handle element detachment or other errors gracefully
                    log.debug(`Input focus/blur failed: ${error}`);
                }
            }
            log.debug(`Focused and blurred ${inputsToFuzz.length} sample inputs to trigger validation/pre-fetch.`);
        } catch (error) {
            log.debug(`Input fuzzing failed: ${error}`);
        }

        // --- Action 3: Random Clicks ---
        // Clicks on interactive elements to trigger navigation events or modal/pop-up APIs
        try {
            const interactiveSelectors = 'a:visible, button:visible, [role="button"]:visible, [data-testid*="button"]:visible, [data-testid*="link"]:visible';
            const clickableElements = await page.locator(interactiveSelectors).all();

            // Select a randomized set of elements
            const shuffled = [...clickableElements].sort(() => 0.5 - Math.random());
            const elementsToClick = shuffled.slice(0, fuzzerConfig.maxClicks || FUZZER_CONFIG.MAX_CLICKS);

            for (const element of elementsToClick) {
                try {
                    // Scroll element into view first
                    await element.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(200);
                    
                    // Use 'click' which triggers full event cycle
                    await element.click({ force: true, timeout: 500 });
                    await page.waitForTimeout(fuzzerConfig.interactionDelayMs || FUZZER_CONFIG.INTERACTION_DELAY_MS);
                } catch (error) {
                    // Handle clicks that cause navigation or are blocked
                    log.debug(`Failed to click element: ${error}`);
                }
            }
            log.debug(`Clicked ${elementsToClick.length} sample elements.`);
        } catch (error) {
            log.debug(`Click fuzzing failed: ${error}`);
        }

        // --- Final Step: Wait for network to settle after interactions ---
        // Ensures all API calls triggered by the fuzzer are captured
        try {
            await page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch (error) {
            log.debug('Fuzzing completed, but network was not fully idle after 5s.');
        }

        log.info('Deep Interaction Fuzzing complete.');
    } catch (error) {
        log.warning(`Deep Interaction Fuzzing encountered an error: ${error}`);
        // Don't throw - fuzzing is best-effort, shouldn't break discovery
    }
}

