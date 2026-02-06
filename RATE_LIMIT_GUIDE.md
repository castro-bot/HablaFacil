# Rate Limit Optimization Guide

## Current Optimizations ✅

Your HablaFácil app now has multiple layers of protection against rate limits:

### 1. **Debouncing (300ms)**
- Prevents rapid-fire API calls when users click words quickly
- Only makes one API call per 300ms window

### 2. **LRU Cache (20 entries)**
- Stores the last 20 unique sentence contexts
- If user types "Yo quiero" again, it returns cached results instantly
- **Zero API calls** for repeated sentences

### 3. **Static Fallback**
- When rate limits are hit (429 errors), gracefully falls back to static suggestions
- App remains fully functional even without API access

### 4. **Optimal Model Choice**
- Using `gemini-2.5-flash-lite` which has the **highest rate limits**:
  - Free tier: 15 RPM (requests per minute)
  - Tier 1: 1000 RPM
  - Tier 2: 2000 RPM

---

## How to Upgrade Your Tier

### Free Tier → Tier 1 (Paid)
**Requirements:**
- Link a Google Cloud billing account to your project
- [Enable Cloud Billing](https://ai.google.dev/gemini-api/docs/billing#enable-cloud-billing)

**Benefits:**
- RPM: 15 → **1000** (66x increase!)
- TPM: 1M → **4M**

### Tier 1 → Tier 2
**Requirements:**
- Total spend: **> $250** on Google Cloud
- At least **30 days** since successful payment

**Benefits:**
- RPM: 1000 → **2000**
- TPM: 4M → **10M**

### How to Request Upgrade
1. Go to [AI Studio API Keys](https://aistudio.google.com/app/apikey)
2. Find your project
3. Click **"Upgrade"** (only shows if you meet requirements)

---

## Additional Strategies

### 1. Increase Debounce Time
If you're still hitting limits, increase the debounce:

```typescript
// In HomePage.tsx, change:
const { suggestions, isLoading } = useAISuggestions(state.sentence, filteredWords);

// To:
const { suggestions, isLoading } = useAISuggestions(state.sentence, filteredWords, 500); // 500ms
```

### 2. Monitor Your Usage
Check your rate limit usage at:
- [AI Studio Usage Dashboard](https://aistudio.google.com/usage?timeRange=last-28-days&tab=rate-limit)

### 3. Request Rate Limit Increase
For paid tiers, you can request higher limits:
- [Request Rate Limit Increase Form](https://forms.gle/ETzX94k8jf7iSotH9)

---

## Expected API Call Volume

With current optimizations:

| User Action | API Calls | Notes |
|-------------|-----------|-------|
| Click "Yo" | 1 | After 300ms debounce |
| Click "Yo" again (after clearing) | 0 | Served from cache |
| Click "Yo" → "quiero" | 2 | One per word (debounced) |
| Rapid clicking 5 words | 1 | Only last word triggers API |

**Estimated usage for typical user:**
- 10 sentences/minute = ~10-20 API calls/minute
- Well within Free tier limit (15 RPM)

---

## Troubleshooting Rate Limits

If you see 429 errors:

1. **Check console** - You'll see: `"AI suggestion error: 429"`
2. **App continues working** - Static suggestions automatically kick in
3. **Wait 1 minute** - Rate limits reset per minute
4. **Consider upgrading** - If you're building for production

The app is designed to handle rate limits gracefully, so users won't experience any disruption!
