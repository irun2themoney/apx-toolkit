# 💰 Apify Store Discount Tiers - Setup Guide

**Complete guide to setting up tiered pricing to attract large customers**

---

## 🎯 Overview

Apify Store Discounts allow you to offer progressively lower prices for higher subscription tiers, making your Actor attractive to enterprise customers while maintaining healthy profit margins.

**Discount Tiers:**
- **FREE** - Free tier users
- **BRONZE** - Basic paid users
- **SILVER** - Mid-tier users
- **GOLD** - High-tier users
- **PLATINUM/DIAMOND** - Enterprise (contact Apify)

---

## 💡 Why Use Tiered Pricing?

### Benefits:
1. **Attract Enterprise Customers** - Lower prices for high-volume users
2. **Encourage Upgrades** - Users upgrade to get better rates
3. **Higher Profit Margins** - Your costs are lower for higher tiers too
4. **Enhanced Visibility** - Tiered pricing Actors get better Store placement
5. **Competitive Pricing** - Match or beat competitors for enterprise clients

### Cost Structure:
Your platform costs decrease for higher tiers:
- **FREE/BRONZE:** $0.3 per compute unit
- **SILVER:** $0.25 per compute unit (17% savings)
- **GOLD:** $0.2 per compute unit (33% savings)

This allows you to offer lower prices while maintaining margins!

---

## 📊 Recommended Pricing Strategy

### Pay Per Event (PPE) Model

**Recommended Tiered Pricing:**

| Tier | Actor Start | Per Result | Notes |
|------|------------|------------|-------|
| **FREE** | $0.0001 | $0.00002 | Higher price to prevent abuse, still affordable |
| **BRONZE** | $0.00005 | $0.00001 | Standard pricing |
| **SILVER** | $0.00004 | $0.000008 | 20% discount - attract mid-tier |
| **GOLD** | $0.00003 | $0.000006 | 40% discount - attract enterprise |

**Why This Works:**
- FREE tier: Slightly higher to prevent abuse, but still very affordable ($0.01 for 50 results)
- BRONZE: Standard pricing for regular users
- SILVER: 20% discount attracts growing businesses
- GOLD: 40% discount attracts enterprise customers spending thousands

### Example Run Costs:

**Typical Run (50 results generated):**
- FREE: $0.0011 ($0.0001 + 50 × $0.00002)
- BRONZE: $0.00055 ($0.00005 + 50 × $0.00001)
- SILVER: $0.00044 ($0.00004 + 50 × $0.000008)
- GOLD: $0.00033 ($0.00003 + 50 × $0.000006)

**Value Proposition:**
- Manual development: $8,000 - $16,000 (2-4 weeks)
- APX cost (GOLD tier): $0.00033 (10-20 seconds)
- **Savings: 99.99%** - Even at enterprise scale!

---

## 🛠️ How to Set Up Tiered Pricing

### Step 1: Go to Actor Settings

1. Visit: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ
2. Click **"Publication"** tab
3. Scroll to **"Monetization"** section

### Step 2: Configure Pricing

1. **Enable Monetization** (if not already enabled)
2. **Select Model:** "Pay per event" (PPE)
3. **Set Tiered Pricing:**

   **FREE Tier:**
   - Actor Start: $0.0001
   - Per Result: $0.00002

   **BRONZE Tier:**
   - Actor Start: $0.00005
   - Per Result: $0.00001

   **SILVER Tier:**
   - Actor Start: $0.00004
   - Per Result: $0.000008

   **GOLD Tier:**
   - Actor Start: $0.00003
   - Per Result: $0.000006

### Step 3: Save and Publish

1. Click **"Save"**
2. Verify pricing appears correctly
3. Publish Actor (if not already published)

---

## 💻 Detecting User Tiers in Code

You can detect user tiers during Actor runs to offer premium features:

```typescript
// Get user tier from environment variable
const userTier = process.env.APIFY_USER_DISCOUNT_TIER || 'FREE';

// Or query via Apify API
import { ApifyApi } from 'apify-client';
const api = new ApifyApi({ token: process.env.APIFY_TOKEN });
const user = await api.user().get();
const tier = user.discountTier || 'FREE';

// Offer premium features for higher tiers
if (tier === 'GOLD' || tier === 'SILVER') {
    // Enable premium features
    // Higher rate limits
    // Priority processing
    // Extended support
}
```

---

## 📈 Profit Calculation

**Formula:** `Profit = (0.8 × Revenue) - Costs`

### Example: GOLD Tier User Run

**Revenue:**
- Actor Start: $0.00003
- 50 Results: 50 × $0.000006 = $0.0003
- **Total Revenue:** $0.00033

**Your Revenue (80%):**
- $0.00033 × 0.8 = **$0.000264**

**Your Costs (GOLD tier rates):**
- Compute Units: ~0.1 CU × $0.2 = $0.02
- Data Transfer: ~0.01 GB × $0.18 = $0.0018
- **Total Costs:** ~$0.0218

**Profit:** $0.000264 - $0.0218 = **-$0.0215** (loss)

*Note: This example shows why it's important to set pricing that covers costs. Adjust based on actual usage patterns.*

---

## 🎯 Pricing Optimization Tips

### 1. Start Conservative
- Begin with slightly higher prices
- Monitor actual costs
- Adjust based on data

### 2. Test Different Tiers
- A/B test pricing
- Monitor conversion rates
- Optimize for profit

### 3. Monitor Costs
- Track compute unit usage
- Monitor data transfer
- Adjust pricing accordingly

### 4. Enterprise Outreach
- Contact Apify for PLATINUM/DIAMOND tiers
- Offer custom pricing for large clients
- Negotiate volume discounts

---

## ✅ Verification Checklist

- [ ] Monetization enabled in Publication tab
- [ ] Pay per event model selected
- [ ] Tiered pricing configured for all tiers
- [ ] Pricing is competitive but profitable
- [ ] Actor is published
- [ ] Pricing visible in Store listing
- [ ] Test runs verify pricing works

---

## 📚 Resources

- **Apify Documentation:** [Pricing and Costs](https://docs.apify.com/platform/actors/publishing/monetize/pricing-and-costs)
- **Discount Tiers Guide:** [Discount Tiers and Pricing Strategy](https://docs.apify.com/platform/actors/publishing/monetize/pricing-and-costs#discount-tiers-and-pricing-strategy)
- **Actor Settings:** https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/publication

---

## 🚀 Next Steps

1. **Configure Pricing:**
   - Go to Publication tab
   - Set tiered pricing as recommended above

2. **Test Pricing:**
   - Run test with different tier accounts
   - Verify costs are calculated correctly

3. **Monitor Performance:**
   - Track revenue by tier
   - Optimize pricing based on data

4. **Attract Enterprise:**
   - Highlight tiered pricing in description
   - Contact Apify for enterprise tiers
   - Offer custom solutions for large clients

---

**Ready to attract enterprise customers with tiered pricing!** 💰

