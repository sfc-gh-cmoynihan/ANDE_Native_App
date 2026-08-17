# AND-E Insurance — 20-Minute Business Demo

> **Audience:** Business leaders, CIOs, insurance executives, operations directors
> **Tone:** Business value first, technology second. Show the "so what" for each feature.
> **Duration:** 20 minutes (strict)

---

## Opening (1 minute)

> "Today I want to show you what happens when you stop stitching together point solutions and build your insurance platform on a single foundation. This is AND-E — a Customer 360 for insurance that does identity resolution, call center operations, compliance monitoring, fraud detection, and AI-powered search — all running inside Snowflake. No data leaves the platform. No ETL to external tools. Let's walk through it."

---

## Tab 1: Home Dashboard (2 minutes)

**Open the app. Land on the Home dashboard.**

**What to show:**
- KPIs at a glance: 6.5M customer records, active policies, claims volume, revenue
- Country breakdown, claims by type, revenue by status

**Business value:**

> "This is your executive cockpit. One screen tells you the health of the book — how many customers, how revenue is distributed, where claims are concentrated. Traditionally this requires a BI tool pulling from a data warehouse, with overnight refresh. Here it's real-time, built into the operational app your team already uses."

**Why Snowflake:**

> "This dashboard queries millions of records and returns in under a second — thanks to Snowflake's Interactive Warehouse. No pre-aggregated cubes. No stale data. The numbers are always current."

---

## Tab 2: Customer Search (2 minutes)

**Navigate to Customer. Search: `john.smith@snowflake.com`**

**What to show:**
- Unified golden record: 3 policies, EUR 2,810 total premium
- 2 dependents (Fionn & Ava), driver status
- Churn risk score with breakdown
- Source system versions (SAP + Salesforce matched together)

**Business value:**

> "Your call center agent types in an email and instantly sees the complete picture — every policy, every family member, their churn risk. No toggling between Salesforce, SAP, and the policy system. This is a single resolved identity from 6.5 million raw records across three source systems, deduplicated using fuzzy matching."

**Why Snowflake:**

> "Identity resolution at this scale normally requires a dedicated MDM product. Here it runs natively in Snowflake — the same platform that stores the data does the matching. One less vendor, one less integration, one less security boundary."

---

## Tab 3: Call Analytics (2 minutes)

**Navigate to Call Analytics.**

**What to show:**
- AHT (Average Handle Time), CSAT, First Call Resolution, NPS
- Sentiment distribution across all calls
- Agent leaderboard — who's performing, who needs coaching
- Hourly heatmap showing peak volumes

**Business value:**

> "Your contact center director sees operational health in real time. Not a weekly report from the telephony vendor — live. Which agents are excelling, which need coaching, when to add staff. The sentiment analysis on every single call replaces manual QA sampling."

**Why Snowflake:**

> "Every call is transcribed and analyzed by Cortex AI — sentiment, summarization, keyword extraction. That used to require a separate speech analytics vendor at six figures a year. Here it's a native function call on your existing data."

---

## Tab 4: Red Flags — Governance (2 minutes)

**Navigate to Red Flags.**

**What to show:**
- Flagged calls with profanity, legal threats, PII exposure
- Category breakdown and severity levels
- Click into a flagged call — show the highlighted word in context
- Review workflow: approve, escalate, dismiss

**Business value:**

> "Compliance teams currently sample 2-3% of calls for quality. This scans 100% of calls, automatically. A threat gets flagged the moment the transcription is processed. PII exposure — someone reading a credit card number — caught immediately. Your compliance risk drops from 'hope we catch it' to 'we always catch it'."

**Why Snowflake:**

> "The word matching runs on a configurable vocabulary — your compliance team manages the list, not IT. And because transcriptions live in Snowflake, you don't need to send audio to a third-party for analysis."

---

## Tab 5: Green Flag — FCA Compliance (2 minutes)

**Navigate to Green Flag.**

**What to show:**
- Overall compliance rate
- Per-agent breakdown: Emma Walsh at 82.8% vs. David Chen at 35.7%
- Click an agent to see per-call pass/fail
- The FCA statement that must be read: "Toyota Insurance Management UK Limited — FRN 983839"

**Business value:**

> "The FCA requires every customer interaction to include a regulatory disclosure. If an agent forgets, that's a compliance breach. Today, you find out during an audit — six months too late. This tells you in real time which agents are compliant and which need immediate coaching. You can see David Chen is at 35% — that's a training intervention today, not a regulatory finding next quarter."

**Why Snowflake:**

> "This is just text analysis on transcriptions that already live in Snowflake. No additional vendor. The compliance team defines the required statement, the platform enforces it."

---

## Tab 6: Policies & Contract Search (2 minutes)

**Navigate to Policies. Then use Contract Search.**

**What to show:**
- Policy list with values, status, dates, customer/provider signatures
- Click into a policy to see full contract text
- Switch to search: "What is the annual excess for the Lexus?"
- Get a precise answer extracted from the PDF text

**Business value:**

> "Your underwriters and claims handlers spend hours reading policy documents to find specific terms. This lets them ask a plain English question and get an answer in seconds. It's not searching filenames — it's reading and understanding the contract content."

**Why Snowflake:**

> "This is Cortex Search — semantic search over unstructured documents. The PDFs were parsed and indexed inside Snowflake. The same governance, access controls, and audit trail that applies to your structured data now applies to your documents."

---

## Tab 7: Fraud Detection (1.5 minutes)

**Navigate to Fraud.**

**What to show:**
- Flagged claims grouped by known fraud families
- Total exposure KPIs
- Pattern: same surnames, similar claim types, geographic clustering
- Status workflow: Submit → Review → Reject

**Business value:**

> "Insurance fraud costs the UK industry GBP 1.2 billion per year. This flags claims from known fraud patterns — surname matching, repeated claim types, geographic concentration. Your special investigations unit gets a pre-filtered queue instead of searching through thousands of claims."

**Why Snowflake:**

> "Pattern matching across millions of claims is a query. No external fraud detection SaaS. You own the logic, you own the data, and you can adapt the rules without waiting for a vendor."

---

## Tab 8: GeoSpatial — Coverage Gaps (1.5 minutes)

**Navigate to GeoSpatial. Ensure all layers are toggled on.**

**What to show:**
- UK map with 50K claims (blue dots)
- Toyota Approved Mechanic network (green circles)
- Coverage gaps highlighted (red dashed zones): Cape Wrath, Cornwall, rural Wales
- Zoom into a gap to show claims with no nearby mechanic

**Business value:**

> "Every time a customer can't find a nearby approved mechanic, they go to an independent garage — costing you more and degrading the customer experience. This shows exactly where you need to expand your repair network. That's a procurement decision informed by data, not guesswork."

**Why Snowflake:**

> "Snowflake's native GEOGRAPHY type means you can do spatial joins and distance calculations in SQL. No GIS system, no Esri license, no data export."

---

## Tab 9: Predictions (1.5 minutes)

**Navigate to Predictions.**

**What to show:**
- 12-month claims forecast based on seasonal patterns
- Seasonal index (winter peaks for motor, summer for travel)
- Staffing planner: recommended agents per month

**Business value:**

> "If you know January will have 40% more claims than September, you staff accordingly. This gives your operations director a forward-looking view — hire seasonal staff in November, not when the queue is already overflowing in January."

**Why Snowflake:**

> "Forecasting runs directly on your claims history in Snowflake. The model updates as new data arrives — no batch export to a separate ML platform."

---

## Tab 10: AI Agent (2.5 minutes)

**Navigate to Agent. Ask questions live.**

**Questions to ask:**

1. > "What is the excess on the Lexus RX 450h policy?"
   *(Document search — reads the actual policy text)*

2. > "How many customers do we have in the United States?"
   *(Structured query — SQL against 6.5M records)*

3. > "Show me all pending claims over EUR 5,000"
   *(Cross-domain — filters claims by status and amount)*

4. > "What is the total premium value of all active motor policies?"
   *(Aggregation — sums across the contracts table)*

**Business value:**

> "This is the endgame. A business user — not a data analyst — asks a question in plain English and gets an answer in under 3 seconds. It searches documents AND queries structured data. No SQL skills needed. No ticket to the BI team. Self-service analytics for everyone in the organisation."

**Why Snowflake:**

> "This is Cortex Agent — it has two tools: Cortex Search for documents and Cortex Analyst for structured data. It decides which to use based on the question. The semantic views define your business logic — 'contract value means this column, customer means this table'. That's governed, version-controlled business definitions — not prompt engineering."

---

## Close (1 minute)

> "Let me recap what you've just seen — in a single application, running on a single platform:"

| Business Capability | Traditional Approach | AND-E on Snowflake |
|---|---|---|
| Customer 360 / MDM | Informatica, Reltio | Native in Snowflake |
| Speech Analytics | Verint, CallMiner | Cortex AI Functions |
| Compliance Monitoring | Manual sampling | 100% automated |
| Document Intelligence | Kofax, ABBYY | Cortex Search |
| Fraud Detection | SAS, FICO | SQL pattern matching |
| Geospatial Analysis | Esri, QGIS | Native GEOGRAPHY |
| Business Intelligence | Tableau, Power BI | Embedded in app |
| Conversational AI | Custom LLM stack | Cortex Agent |

> "Eight vendor categories collapsed into one platform. Your data never leaves Snowflake. Your governance applies everywhere — structured and unstructured. And your team builds on it with SQL and JavaScript, not proprietary tools."

> "That's the value of a platform vs. a collection of point solutions."

---

## Appendix: Objection Handling

| Objection | Response |
|-----------|----------|
| "We already have a BI tool" | "This isn't replacing your BI tool — it's putting analytics into the operational app where decisions happen. Your BI team still uses Tableau/Power BI for strategic reporting. This is about the 80% of questions that don't need a dashboard." |
| "How does this scale?" | "The customer search is across 6.5M records. The Interactive Warehouse handles hundreds of concurrent sub-second queries. Snowflake's architecture separates storage from compute — you scale each independently." |
| "What about data security?" | "Data never leaves Snowflake. The app authenticates via OAuth tokens — zero credentials in the code. Role-based access controls apply to every query. Full audit trail on every data access." |
| "Can we customise the AI agent?" | "The agent's knowledge is defined by semantic views — SQL objects your data team already knows how to manage. Adding a new data source is adding a table to the semantic view. No model retraining." |
| "What's the cost?" | "You're consolidating 3-5 vendor contracts (speech analytics, MDM, fraud, GIS, document search) into compute credits on infrastructure you already pay for. Net cost is typically 40-60% lower with better coverage." |
