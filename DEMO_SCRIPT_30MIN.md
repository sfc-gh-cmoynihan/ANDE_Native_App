# AND-E Insurance — 30-Minute Demo Script

## Overview

This demo showcases a Customer 360 platform for Toyota Insurance Services, built entirely on Snowflake. It demonstrates how Cortex AI, SPCS, Interactive Warehouses, and Geospatial capabilities come together in a production-ready insurance application.

**Audience:** Technical stakeholders, data leaders, insurance industry  
**Duration:** 30 minutes  
**URL:** Your deployed SPCS app URL

---

## Act 1: The Platform (5 minutes)

### Opening — Home Dashboard

1. Open the app and land on the **Home** dashboard
2. Highlight the KPIs: 6.5M unified customer records, active policies, call volume
3. Explain the architecture:
   - "This is a Next.js application running on Snowflake's container service (SPCS)"
   - "All data stays in Snowflake — no data leaves the platform"
   - "The app authenticates via SPCS OAuth tokens — zero credentials in the code"

### Customer Search

4. Navigate to **Customer**
5. Enter email: `john.smith@snowflake.com`
6. Click Search
7. Show the customer summary:
   - **3 Total Policies** with total premium of EUR 2,810
   - **2 Dependents** (Fionn & Ava Smith)
   - **Churn Score** with risk breakdown
   - Policy details (Toyota Corolla, RAV4, Yaris)
   - Children/dependents panel with driver status

**Key message:** "A single unified view from 6.5M records across Salesforce, SAP, and web systems — deduplicated and matched using Snowflake's data processing capabilities."

---

## Act 2: AI-Powered Call Center (10 minutes)

### Call Analytics

8. Navigate to **Call Analytics**
9. Show the real-time metrics:
   - Average Handle Time, CSAT Score, First Call Resolution, NPS
   - Sentiment distribution (Positive/Negative/Neutral)
   - Channel breakdown
10. Explain: "Every call is transcribed and analyzed by Cortex AI for sentiment and key topics"

### Calls by Agent

11. Navigate to **Calls by Agent**
12. Click on an agent (e.g., Emma Walsh)
13. Show individual call details with:
    - AI-generated summary
    - Sentiment classification
    - Duration and call type

### Red Flags — Call Governance

14. Navigate to **Red Flags**
15. Show flagged calls — profanity, threats, PII exposure
16. Explain: "Cortex AI scans every transcription in real-time for governance violations"
17. Show the word categories and severity levels
18. Demonstrate reviewing/dismissing a flag

### Green Flag — FCA Compliance

19. Navigate to **Green Flag**
20. Show the compliance dashboard:
    - Overall compliance rate
    - Per-agent breakdown
    - Emma Walsh at 82.8% (highest)
    - David Chen at 35.7% (needs coaching)
21. Click on an agent to see individual call compliance
22. Explain the FCA requirement:
    - "Every customer call must include the FCA regulatory disclosure"
    - "Toyota Insurance Management UK Limited — FRN 983839"
    - "This checks every single call transcription automatically"

**Key message:** "AI isn't just generating insights — it's enforcing regulatory compliance at scale across thousands of calls."

---

## Act 3: Insurance Operations (8 minutes)

### Policies

23. Navigate to **Policies**
24. Show the insurance policies:
    - Toyota Corolla Comprehensive (EUR 1,245)
    - Toyota RAV4 TPFT (EUR 890)
    - Lexus RX 450h Comprehensive (EUR 2,180)
25. Click on a policy to see full contract text
26. Use the search: "What is the excess on the Lexus RX?"

### Fraud Detection

27. Navigate to **Fraud**
28. Show flagged claims from known fraud patterns
29. Explain the surname-based watchlist and pattern matching
30. Demonstrate status updates (Submitted → Rejected)

### Claims Forecasting

31. Navigate to **Predictions**
32. Show seasonal claims forecast
33. Show staffing planner recommendations
34. Explain: "ML models predict claim volumes so we can proactively staff the contact center"

### GeoSpatial — Coverage Gaps

35. Navigate to **GeoSpatial**
36. Show the UK map with:
    - Blue dots: 50,000 claims locations
    - Green circles: Toyota Approved Mechanic locations
    - Red dashed circles: Coverage gaps (Cape Wrath, Cornwall, etc.)
37. Explain: "Using Snowflake's GEOGRAPHY type, we identify areas where customers file claims but have no nearby approved mechanic"
38. Zoom into a gap area to show the detail

**Key message:** "Geospatial analysis directly in Snowflake — no external GIS system needed."

---

## Act 4: The AI Agent (7 minutes)

### Cortex Agent

39. Navigate to **Agent**
40. The agent has pre-loaded sample questions
41. Ask the following questions in sequence:

**Question 1 — Document Search (Cortex Search):**
> "What is the excess on the Lexus RX 450h policy?"

- Shows the agent using document_search tool
- Returns specific policy details from contract text

**Question 2 — Analytical Query (Cortex Analyst):**
> "How many customers do we have in Ireland?"

- Shows text-to-SQL via semantic views
- Returns precise count from 6.5M records

**Question 3 — Cross-domain:**
> "What is the total value of all active policies?"

- Aggregates across the contracts table
- Returns formatted monetary value

**Question 4 — Claims:**
> "Show me all pending claims for John Smith"

- Searches customer data
- Returns claim details with amounts and status

42. Explain the architecture:
    - "The agent has two tools: document search (Cortex Search) and data query (Cortex Analyst)"
    - "It decides which tool to use based on the question"
    - "All responses in under 3 seconds thanks to the Interactive Warehouse"
    - "The semantic views define the business logic — no prompt engineering needed"

**Key message:** "A natural language interface to your entire data estate — documents AND structured data — with sub-second response times."

---

## Closing (2 minutes)

### Summary of Snowflake Capabilities Demonstrated

| Capability | Used For |
|-----------|----------|
| SPCS | Hosting the production web app |
| Cortex Agent | Natural language data access |
| Cortex Search | Semantic document search |
| Cortex Analyst | Text-to-SQL via semantic views |
| Interactive Warehouse | Sub-second query latency |
| Interactive Tables | Pre-cached data for instant responses |
| Cortex AI Functions | Sentiment analysis, summarization |
| GEOGRAPHY | Geospatial claims mapping |
| Snowflake SDK | Server-side data access with OAuth |

### Call to Action

- "Everything you've seen runs entirely within Snowflake"
- "No data leaves the platform — governance and security built in"
- "The same platform that stores your data now serves your applications"
- "From raw data to AI-powered applications — one platform"

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App shows "Loading..." indefinitely | Check compute pool is running: `SHOW COMPUTE POOLS` |
| Agent responses are slow | Ensure ANDE_IWH is resumed: `ALTER WAREHOUSE ANDE_IWH RESUME` |
| GeoSpatial map blank | Verify UK_CLAIMS_GEO table has data |
| Search returns 0 results | Confirm CUSTOMER_MASTER_GOLDEN_TABLE is populated |
