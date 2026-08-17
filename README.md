# AND-E Insurance — Customer 360 Platform

A Next.js application deployed on Snowflake SPCS (Snowpark Container Services) that provides a unified view of insurance customers, policies, claims, and call center operations powered by Cortex AI.

---

## Architecture

```mermaid
flowchart TB
    subgraph SPCS["☁️ Snowpark Container Services"]
        direction TB
        APP["🖥️ Next.js 16 App<br/><i>Node.js 22 · React · Leaflet Maps</i>"]
    end

    subgraph CORTEX["🧠 Cortex AI Layer"]
        direction LR
        AGENT["🤖 Cortex Agent<br/><i>AND-E Agent</i>"]
        SEARCH["🔍 Cortex Search<br/><i>Document & Contract</i>"]
        ANALYST["📊 Cortex Analyst<br/><i>Text-to-SQL</i>"]
        AIFUNC["⚡ AI Functions<br/><i>Sentiment · Summary</i>"]
    end

    subgraph COMPUTE["⚙️ Compute"]
        direction LR
        IWH["🏎️ Interactive Warehouse<br/><i>Sub-second queries</i>"]
        WH["🏗️ ADHOC_WH<br/><i>Data loading & search</i>"]
    end

    subgraph DATA["💾 Data Layer — ANDE_DB"]
        direction LR
        CUSTOMERS["👥 6.5M Customers<br/><i>Golden Records</i>"]
        CALLS["📞 200 Calls<br/><i>Transcription + AI</i>"]
        CONTRACTS["📄 Policies<br/><i>Full Contract Text</i>"]
        CLAIMS["🗺️ 50K Claims<br/><i>Geospatial</i>"]
        IT["⚡ Interactive Tables<br/><i>Real-time Analytics</i>"]
    end

    APP --> AGENT
    APP --> SEARCH
    APP --> ANALYST
    APP --> AIFUNC
    AGENT --> IWH
    ANALYST --> IWH
    SEARCH --> WH
    IWH --> IT
    WH --> CUSTOMERS
    WH --> CALLS
    WH --> CONTRACTS
    WH --> CLAIMS
    IT --> CUSTOMERS
    IT --> CALLS
    IT --> CONTRACTS

    style SPCS fill:#1a73e8,stroke:#1557b0,color:#fff
    style CORTEX fill:#7c3aed,stroke:#5b21b6,color:#fff
    style COMPUTE fill:#ea580c,stroke:#c2410c,color:#fff
    style DATA fill:#059669,stroke:#047857,color:#fff
    style APP fill:#2563eb,stroke:#1d4ed8,color:#fff
    style AGENT fill:#9333ea,stroke:#7e22ce,color:#fff
    style SEARCH fill:#9333ea,stroke:#7e22ce,color:#fff
    style ANALYST fill:#9333ea,stroke:#7e22ce,color:#fff
    style AIFUNC fill:#9333ea,stroke:#7e22ce,color:#fff
    style IWH fill:#f97316,stroke:#ea580c,color:#fff
    style WH fill:#f97316,stroke:#ea580c,color:#fff
    style CUSTOMERS fill:#10b981,stroke:#059669,color:#fff
    style CALLS fill:#10b981,stroke:#059669,color:#fff
    style CONTRACTS fill:#10b981,stroke:#059669,color:#fff
    style CLAIMS fill:#10b981,stroke:#059669,color:#fff
    style IT fill:#10b981,stroke:#059669,color:#fff
```

---

## Data Flow

```mermaid
flowchart LR
    subgraph SOURCES["📥 Source Systems"]
        SF["Salesforce"]
        SAP["SAP"]
        WEB["Web Portal"]
    end

    subgraph PROCESSING["🔄 Processing"]
        IDR["Identity<br/>Resolution"]
        ENRICH["AI<br/>Enrichment"]
    end

    subgraph STORAGE["💾 ANDE_DB"]
        GOLDEN["Golden<br/>Records"]
        ITABLES["Interactive<br/>Tables"]
    end

    subgraph APP["🖥️ Application"]
        UI["Customer 360<br/>Dashboard"]
    end

    SF --> IDR
    SAP --> IDR
    WEB --> IDR
    IDR --> GOLDEN
    GOLDEN --> ENRICH
    ENRICH --> ITABLES
    ITABLES --> UI

    style SOURCES fill:#6366f1,stroke:#4f46e5,color:#fff
    style PROCESSING fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style STORAGE fill:#059669,stroke:#047857,color:#fff
    style APP fill:#1a73e8,stroke:#1557b0,color:#fff
```

---

## Features

| Tab | Description | Snowflake Service |
|-----|-------------|-------------------|
| **Home** | KPI dashboard — total customers, contracts, calls, claims | Interactive Warehouse |
| **Customer** | Search 6.5M records by company, name, email, phone, or ID | Interactive Tables |
| **Call Analytics** | Real-time call center metrics: AHT, CSAT, FCR, NPS | Cortex AI Functions |
| **Calls by Agent** | Per-agent call breakdown with sentiment analysis | Cortex AI Functions |
| **Red Flags** | AI-powered call governance — flagged profanity, threats, PII | Cortex AI Functions |
| **Green Flag** | FCA compliance checking — ensures regulatory statement in calls | Cortex AI Functions |
| **Policies** | Insurance policy viewer with contract search | Cortex Search |
| **Claims** | Claims management with status tracking | Interactive Warehouse |
| **Fraud** | Fraud detection dashboard for suspicious claims | Cortex Analyst |
| **Predictions** | Claims forecasting and staffing planner | Cortex Analyst |
| **GeoSpatial** | UK claims heatmap with mechanic coverage gap analysis | GEOGRAPHY types |
| **Agent** | Cortex AI Agent for natural language data queries | Cortex Agent |

---

## Install Sequence

```mermaid
flowchart LR
    A["01<br/>Infrastructure"] --> B["02<br/>Tables"]
    B --> C["03<br/>Interactive<br/>Tables"]
    C --> D["04<br/>Load Data"]
    D --> E["05<br/>Cortex<br/>Services"]
    E --> F["06<br/>Deploy App"]

    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#6366f1,stroke:#4f46e5,color:#fff
    style C fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style D fill:#a855f7,stroke:#9333ea,color:#fff
    style E fill:#d946ef,stroke:#c026d3,color:#fff
    style F fill:#ec4899,stroke:#db2777,color:#fff
```

### 1. Create Infrastructure

```bash
snowsql -f install/01_infrastructure.sql
```

### 2. Create Tables

```bash
snowsql -f install/02_tables.sql
```

### 3. Create Interactive Tables

```bash
snowsql -f install/03_interactive_tables.sql
```

### 4. Load Data

Export data from the source account and load into the new account:
```bash
snowsql -f install/04_load_data.sql
```

See `install/04_load_data.sql` for detailed export/import commands.

### 5. Create Cortex Services

```bash
snowsql -f install/05_cortex_services.sql
```

### 6. Deploy the App

```bash
cd app
snow app deploy
```

The app will build (~60s) and deploy (~30s). You'll get a public URL like:
```
https://xxxx-your-account.snowflakecomputing.app
```

---

## Prerequisites

- Snowflake account with ACCOUNTADMIN role
- SnowCLI installed (`pip install snowflake-cli`)
- Node.js 22+ (for local development only)

---

## Project Structure

```
ANDE_Native_App/
├── README.md
├── DEMO_SCRIPT_30MIN.md           # 30-minute technical demo walkthrough
├── DEMO_SCRIPT_20MIN_BUSINESS.md  # 20-minute business value demo
├── install/                        # SQL scripts (run in order)
│   ├── 01_infrastructure.sql       # Database, warehouses, compute pool, stage
│   ├── 02_tables.sql              # All table DDL
│   ├── 03_interactive_tables.sql   # Interactive tables + IWH binding
│   ├── 04_load_data.sql           # Data loading from stage
│   └── 05_cortex_services.sql     # Search, Semantic Views, Agent
├── data/
│   ├── call_recordings/           # MP4 call audio files
│   └── policy_documents/          # PDF insurance policies
└── app/
    ├── snowflake.yml              # SPCS deployment config
    ├── app.yml                    # App Runtime manifest
    ├── Dockerfile                 # Multi-stage Node.js build
    ├── package.json               # Dependencies
    ├── app/                       # Next.js app directory
    │   ├── page.tsx               # Main page with tabbed navigation
    │   ├── layout.tsx             # Root layout
    │   └── api/                   # Server-side API routes
    ├── components/                # React UI components
    ├── lib/snowflake.ts           # Snowflake SDK connection helper
    └── public/                    # Static assets (logos, icons)
```

---

## Key Snowflake Services

```mermaid
mindmap
  root((AND-E Platform))
    🧠 Cortex AI
      Cortex Agent
      Cortex Search
      Cortex Analyst
      AI Functions
    ⚡ Compute
      Interactive Warehouse
      ADHOC Warehouse
      Compute Pool
    💾 Storage
      Interactive Tables
      Base Tables
      Stages
    🌐 Networking
      SPCS
      External Access
```

| Service | Purpose |
|---------|---------|
| **Cortex Agent** | Natural language interface to customer data |
| **Cortex Search** | Semantic search over insurance policy documents |
| **Cortex Analyst** | Text-to-SQL via semantic views |
| **Interactive Warehouse** | Sub-second query execution for real-time UX |
| **Interactive Tables** | Pre-cached data for instant agent responses |
| **SPCS** | Container deployment for the Next.js web app |
| **GEOGRAPHY** | Geospatial data types for claims mapping |

---

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
