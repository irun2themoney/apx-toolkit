# 🎯 Configure Tiered Pricing - Step by Step

**Quick guide to set up Apify Store discount tiers RIGHT NOW**

---

## ⚡ Quick Values to Enter

Copy these exact values into the Apify Console:

### FREE Tier:
- **Actor Start:** `0.0001`
- **Per Result:** `0.00002`

### BRONZE Tier:
- **Actor Start:** `0.00005`
- **Per Result:** `0.00001`

### SILVER Tier:
- **Actor Start:** `0.00004`
- **Per Result:** `0.000008`

### GOLD Tier:
- **Actor Start:** `0.00003`
- **Per Result:** `0.000006`

---

## 📍 Exact Steps

### Step 1: Open Publication Tab
1. Go to: **https://console.apify.com/actors/2eXbQISXqhTnIxWNJ/publication**
2. Make sure you're logged in

### Step 2: Find Monetization Section
1. Scroll down on the Publication page
2. Look for a section titled **"Monetization"** or **"Pricing"**
3. It should be below the description and tags sections

### Step 3: Enable/Edit Monetization
1. If monetization is not enabled:
   - Click **"Enable Monetization"** or **"Set Up Pricing"**
2. If already enabled:
   - Click **"Edit"** or **"Configure"** button

### Step 4: Select Pricing Model
1. Choose **"Pay per event"** (PPE) model
2. Make sure it's selected (not "Pay per result" or "Pay per run")

### Step 5: Enable Tiered Pricing
1. Look for a checkbox or toggle: **"Enable Tiered Pricing"** or **"Discount Tiers"**
2. **Check/Enable** this option
3. This should reveal fields for each tier (FREE, BRONZE, SILVER, GOLD)

### Step 6: Enter Prices for Each Tier

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

### Step 7: Save
1. Click **"Save"** button
2. Wait for confirmation message
3. Verify no errors appear

### Step 8: Verify
1. Check that pricing appears in the Store listing
2. Visit: https://apify.com/irun2themoney/apx-toolkit
3. Verify tiered pricing is displayed

---

## 🎯 What You Should See

After configuration, users will see:
- **FREE:** $0.0011 for 50 results
- **BRONZE:** $0.00055 for 50 results
- **SILVER:** $0.00044 for 50 results (20% discount)
- **GOLD:** $0.00033 for 50 results (40% discount)

---

## ❓ Can't Find Monetization Section?

If you don't see the monetization section:

1. **Check Actor Status:**
   - Actor must be published to configure pricing
   - Go to Publication tab → Check if "Published" is shown

2. **Check Permissions:**
   - You must be the Actor owner
   - Check you're logged into the correct account

3. **Try Different Location:**
   - Sometimes in "Settings" tab instead of "Publication"
   - Or in a "Monetization" sub-tab

4. **Contact Support:**
   - If still not visible, contact Apify support
   - They can enable monetization for your Actor

---

## ✅ Verification Checklist

After configuring, verify:
- [ ] All 4 tiers have prices set
- [ ] Prices decrease for higher tiers (FREE > BRONZE > SILVER > GOLD)
- [ ] No errors in console
- [ ] Pricing visible in Store listing
- [ ] Test run calculates correct pricing

---

## 🚀 You're Done!

Once configured:
- ✅ Enterprise customers see lower prices
- ✅ Users are encouraged to upgrade
- ✅ Your Actor gets better Store visibility
- ✅ You maintain healthy profit margins

**Go configure it now!** 💰

---

*Run `node configure-tiered-pricing.js` for a quick reference of all values.*

