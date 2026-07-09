# AND-E Insurance — Customer 360 Platform

A Next.js application deployed on Snowflake SPCS (Snowpark Container Services) that provides a unified view of insurance customers, policies, claims, and call center operations powered by Cortex AI.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SPCS (Snowpark Container Services)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js 16 App (Node.js 22)                          │  │
│  │  - Server-side API routes → Snowflake SDK             │  │
│  │  - React client components                            │  │
│  │  - Leaflet maps (GeoSpatial)                          │  │
│  └───────────────────────────────────────────────────────┘  │
│              │                                               │
│              ▼                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Snowflake Services                                   │  │
│  │  - Cortex Agent (AND-E Agent)                         │  │
│  │  - Cortex Search (Document & Contract search)         │  │
│  │  - Cortex Analyst (Semantic Views → SQL)              │  │
│  │  - Interactive Warehouse (sub-second queries)         │  │
│  │  - Cortex AI Functions (Sentiment, Summarization)     │  │
│  └───────────────────────────────────────────────────────┘  │
│              │                                               │
│              ▼                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Layer (ANDE_DB)                                 │  │
│  │  - 6.5M customer golden records                       │  │
│  │  - 200 call recordings with transcription + AI        │  │
│  │  - Insurance policies with full contract text         │  │
│  │  - 50K UK claims with geospatial locations            │  │
│  │  - Interactive tables for real-time analytics         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Features

| Tab | Description |
|-----|-------------|
| **Home** | KPI dashboard — total customers, contracts, calls, claims |
| **Customer** | Search 6.5M records by company, name, email, phone, or ID |
| **Call Analytics** | Real-time call center metrics: AHT, CSAT, FCR, NPS |
| **Calls by Agent** | Per-agent call breakdown with sentiment analysis |
| **Red Flags** | AI-powered call governance — flagged profanity, threats, PII |
| **Green Flag** | FCA compliance checking — ensures regulatory statement in calls |
| **Policies** | Insurance policy viewer with contract search |
| **Claims** | Claims management with status tracking |
| **Fraud** | Fraud detection dashboard for suspicious claims |
| **Predictions** | Claims forecasting and staffing planner |
| **GeoSpatial** | UK claims heatmap with mechanic coverage gap analysis |
| **Agent** | Cortex AI Agent for natural language data queries |

## Prerequisites

- Snowflake account with ACCOUNTADMIN role
- SnowCLI installed (`pip install snowflake-cli`)
- Node.js 22+ (for local development only)

## Setup Instructions

### 1. Create Infrastructure

```bash
# Run the setup scripts in order
snowsql -f snowflake/01_setup/01_infrastructure.sql
```

### 2. Create Tables

```bash
snowsql -f snowflake/02_tables/01_tables.sql
snowsql -f snowflake/02_tables/02_interactive_tables.sql
```

### 3. Load Data

Export data from the source account and load into the new account:
```bash
snowsql -f snowflake/03_data/01_load_data.sql
```

See `snowflake/03_data/01_load_data.sql` for detailed export/import commands.

### 4. Create Cortex Services

```bash
snowsql -f snowflake/04_cortex/01_cortex_services.sql
```

### 5. Deploy the App

```bash
cd app
snow app deploy
```

The app will build (~60s) and deploy (~30s). You'll get a public URL like:
```
https://xxxx-your-account.snowflakecomputing.app
```

## Project Structure

```
ANDE_Native_App/
├── README.md                          # This file
├── docs/
│   └── DEMO_SCRIPT_30MIN.md          # 30-minute demo walkthrough
├── snowflake/
│   ├── 01_setup/
│   │   └── 01_infrastructure.sql      # Database, warehouses, compute pool
│   ├── 02_tables/
│   │   ├── 01_tables.sql             # All table DDL
│   │   └── 02_interactive_tables.sql  # Interactive tables + IWH binding
│   ├── 03_data/
│   │   └── 01_load_data.sql          # Data loading instructions & INSERT stmts
│   └── 04_cortex/
│       └── 01_cortex_services.sql     # Search, Semantic Views, Agent
└── app/
    ├── snowflake.yml                  # SPCS deployment config
    ├── app.yml                        # App Runtime manifest
    ├── Dockerfile                     # Multi-stage Node.js build
    ├── package.json                   # Dependencies
    ├── app/                           # Next.js app directory
    │   ├── page.tsx                   # Main page with navigation
    │   ├── layout.tsx                 # Root layout
    │   ├── globals.css                # Global styles
    │   └── api/                       # Server-side API routes
    │       ├── greenflag/route.ts     # FCA compliance checking
    │       ├── fraud/route.ts         # Fraud detection queries
    │       ├── geospatial/route.ts    # UK claims + mechanics geo data
    │       ├── predictions/route.ts   # Claims forecasting
    │       ├── ande-agent/route.ts    # Cortex Agent integration
    │       ├── calls/                 # Call center APIs
    │       ├── contracts/             # Policy/contract APIs
    │       └── ...                    # Other API routes
    ├── components/                    # React UI components
    │   ├── GreenFlagPanel.tsx         # FCA compliance panel
    │   ├── FraudPanel.tsx             # Fraud detection panel
    │   ├── GeoSpatialPanel.tsx        # Map visualization
    │   ├── CoWorkAgentPanel.tsx       # AI Agent chat
    │   └── ...                        # Other panels
    ├── lib/
    │   └── snowflake.ts              # Snowflake SDK connection helper
    └── public/                        # Static assets (logos, icons)
```

## Key Snowflake Services Used

| Service | Purpose |
|---------|---------|
| **Cortex Agent** | Natural language interface to customer data |
| **Cortex Search** | Semantic search over insurance policy documents |
| **Cortex Analyst** | Text-to-SQL via semantic views |
| **Interactive Warehouse** | Sub-second query execution for real-time UX |
| **Interactive Tables** | Pre-cached data for instant agent responses |
| **SPCS** | Container deployment for the Next.js web app |
| **GEOGRAPHY** | Geospatial data types for claims mapping |

## Local Development

```bash
cd app
npm install
# Set up ~/.snowflake/connections.toml with your connection
npm run dev
# Open http://localhost:3000
```

## Environment Variables (auto-set in SPCS)

| Variable | Description |
|----------|-------------|
| `SNOWFLAKE_WAREHOUSE` | Default warehouse (ADHOC_WH) |
| `SNOWFLAKE_CONNECTION_NAME` | Connection name from config.toml |
