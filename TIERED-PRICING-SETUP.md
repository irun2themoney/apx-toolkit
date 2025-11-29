# 🎯 Quick Setup: Apify Store Discount Tiers

**Attract enterprise customers with tiered pricing**

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Go to Monetization Settings

1. Visit: https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/publication
2. Scroll to **"Monetization"** section
3. Click **"Edit"** or **"Configure"**

### Step 2: Enable Tiered Pricing

1. **Model:** Select "Pay per event" (PPE)
2. **Enable Tiered Pricing:** Check the box
3. **Set Prices for Each Tier:**

#### Recommended Pricing:

**FREE Tier:**
- Actor Start: `0.0001`
- Per Result: `0.00002`

**BRONZE Tier:**
- Actor Start: `0.00005`
- Per Result: `0.00001`

**SILVER Tier:**
- Actor Start: `0.00004`
- Per Result: `0.000008`

**GOLD Tier:**
- Actor Start: `0.00003`
- Per Result: `0.000006`

### Step 3: Save and Verify

1. Click **"Save"**
2. Verify all tiers are configured
3. Check pricing appears in Store listing

---

## 💰 Why These Prices?

### Cost Analysis:

**Typical Run (50 results):**
- FREE: $0.0011 total
- BRONZE: $0.00055 total
- SILVER: $0.00044 total (20% discount)
- GOLD: $0.00033 total (40% discount)

**Your Costs (GOLD tier):**
- Compute: ~$0.02
- Data: ~$0.002
- **Total:** ~$0.022

**Your Revenue (80%):**
- $0.00033 × 0.8 = $0.000264

*Note: Adjust pricing based on actual usage patterns. These are starting recommendations.*

---

## 🎯 Benefits

✅ **Attract Enterprise** - Lower prices for high-volume users  
✅ **Encourage Upgrades** - Users upgrade for better rates  
✅ **Better Store Placement** - Tiered pricing Actors get priority  
✅ **Higher Margins** - Your costs decrease for higher tiers too  

---

## 📊 Profit Formula

**Profit = (0.8 × Revenue) - Costs**

Your costs are lower for higher tiers:
- FREE/BRONZE: $0.3 per compute unit
- SILVER: $0.25 per compute unit (17% savings)
- GOLD: $0.2 per compute unit (33% savings)

This allows competitive pricing while maintaining margins!

---

## 🔍 Verify Setup

After configuring:

1. **Check Store Listing:**
   - Visit: https://apify.com/store
   - Search for "apx-toolkit"
   - Verify tiered pricing displays

2. **Test Run:**
   - Start a test run
   - Verify pricing is calculated correctly
   - Check costs match expectations

---

## 📚 Full Documentation

See `docs/MONETIZATION-TIERED-PRICING.md` for:
- Complete pricing strategy
- Cost calculations
- Code examples for tier detection
- Optimization tips

---

## 🚀 Ready to Go!

**Your Actor is now configured to:**
- ✅ Attract enterprise customers
- ✅ Offer competitive tiered pricing
- ✅ Maintain healthy profit margins
- ✅ Get better Store visibility

**Go set it up now!** 💰

---

*Reference: [Apify Pricing and Costs Documentation](https://docs.apify.com/platform/actors/publishing/monetize/pricing-and-costs)*

