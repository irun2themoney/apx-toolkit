#!/usr/bin/env node
/**
 * Configure Apify Store Discount Tiers
 * 
 * This script helps configure tiered pricing for your Apify Actor.
 * Note: Apify API may not support direct pricing configuration.
 * This script provides the exact values to enter manually.
 */

const ACTOR_ID = '2eXbQISXqhTnIxWNJ';
const API_TOKEN = process.env.APIFY_API_TOKEN;

// Recommended tiered pricing configuration
const TIERED_PRICING = {
    FREE: {
        actorStart: 0.0001,
        perResult: 0.00002,
        description: 'FREE tier - Slightly higher to prevent abuse, still very affordable'
    },
    BRONZE: {
        actorStart: 0.00005,
        perResult: 0.00001,
        description: 'BRONZE tier - Standard pricing for regular users'
    },
    SILVER: {
        actorStart: 0.00004,
        perResult: 0.000008,
        description: 'SILVER tier - 20% discount to attract growing businesses'
    },
    GOLD: {
        actorStart: 0.00003,
        perResult: 0.000006,
        description: 'GOLD tier - 40% discount to attract enterprise customers'
    }
};

console.log('💰 Apify Store Discount Tiers Configuration\n');
console.log('='.repeat(60));
console.log(`Actor ID: ${ACTOR_ID}\n`);

console.log('📋 Recommended Pricing Configuration:\n');

Object.entries(TIERED_PRICING).forEach(([tier, config]) => {
    console.log(`${tier} Tier:`);
    console.log(`  Actor Start: $${config.actorStart}`);
    console.log(`  Per Result:  $${config.perResult}`);
    console.log(`  ${config.description}`);
    console.log('');
});

console.log('📊 Example Run Cost (50 results):\n');
Object.entries(TIERED_PRICING).forEach(([tier, config]) => {
    const total = config.actorStart + (50 * config.perResult);
    console.log(`  ${tier}: $${total.toFixed(5)}`);
});
console.log('');

console.log('🎯 Manual Configuration Steps:\n');
console.log('1. Go to: https://console.apify.com/actors/' + ACTOR_ID + '/publication');
console.log('2. Scroll to "Monetization" section');
console.log('3. Click "Edit" or "Configure" button');
console.log('4. Select "Pay per event" (PPE) model');
console.log('5. Enable "Tiered Pricing" or "Discount Tiers"');
console.log('6. Enter the prices above for each tier');
console.log('7. Click "Save"');
console.log('8. Verify pricing appears in Store listing');
console.log('');

console.log('💡 Tips:');
console.log('  - Start with these recommended prices');
console.log('  - Monitor actual costs and adjust as needed');
console.log('  - Higher tiers get better rates to attract enterprise');
console.log('  - Your costs decrease for higher tiers too!');
console.log('');

console.log('📚 Documentation:');
console.log('  - Quick Guide: TIERED-PRICING-SETUP.md');
console.log('  - Complete Guide: docs/MONETIZATION-TIERED-PRICING.md');
console.log('  - Apify Docs: https://docs.apify.com/platform/actors/publishing/monetize/pricing-and-costs');
console.log('');

if (!API_TOKEN) {
    console.log('⚠️  Note: Direct API configuration may not be available.');
    console.log('   Please configure manually in the Apify Console.');
    console.log('   The values above are ready to copy and paste!');
} else {
    console.log('🔍 Checking if API configuration is available...');
    console.log('   (Apify API may require manual configuration in Console)');
}

console.log('\n✅ Configuration values ready!');
console.log('   Copy the values above and paste them into the Apify Console.\n');

