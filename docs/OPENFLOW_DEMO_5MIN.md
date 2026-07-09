# OpenFlow Demo — 5 Minutes

## Overview

Demonstrate Snowflake OpenFlow ingesting an Excel file directly into a Snowflake table in real-time. No code, no ETL scripts — just drag-and-drop data integration.

**Runtime URL:** https://of1--sfseeurope-ie-demo10.snowflakecomputing.app  
**Login:** User ADMIN, Role SYSADMIN  
**Target table:** C360.PUBLIC.TOYOTA_INSURANCE_POLICIES  
**Source file:** toyota_lexus_insurance_policies.xlsx on @C360.PUBLIC.IMPORT_EXCEL/

---

## Setup (Before Demo)

```sql
-- Clear the target table so we can show fresh ingestion
TRUNCATE TABLE C360.PUBLIC.TOYOTA_INSURANCE_POLICIES;

-- Remove the file from stage (we'll upload it live)
REMOVE @C360.PUBLIC.IMPORT_EXCEL/toyota_lexus_insurance_policies.xlsx;
```

Verify the pipeline schedule is set to 10 seconds (already configured).

---

## Demo Flow (5 minutes)

### 1. Set the Scene (1 minute)

**Show the empty table:**
```sql
SELECT COUNT(*) FROM C360.PUBLIC.TOYOTA_INSURANCE_POLICIES;
-- Returns 0
```

**Talking point:**
> "We have an Excel spreadsheet from Toyota Insurance with policy data. We want it in Snowflake — no Python scripts, no Airflow DAGs, no infrastructure to manage."

### 2. Show OpenFlow (1 minute)

- Open https://of1--sfseeurope-ie-demo10.snowflakecomputing.app
- Login: ADMIN / SYSADMIN
- Show the **"Excel Insurance Import"** process group
- Double-click into it to show the 5 processors:
  1. **Trigger Stage Download** — fires every 10 seconds
  2. **Download from Stage** — pulls Excel from Snowflake internal stage
  3. **Read Excel File** — reads the .xlsx binary
  4. **Parse Excel to Records** — converts rows to structured JSON records
  5. **Load to Snowflake** — streams directly via Snowpipe Streaming

**Talking point:**
> "This is Apache NiFi running inside Snowflake as a managed service. Five processors, zero code. It checks every 10 seconds for new files."

### 3. Upload the File — Live (1 minute)

Switch to a SQL worksheet and run:
```sql
PUT file:///Users/cmoynihan/Documents/code/c360/toyota_lexus_insurance_policies.xlsx
  @C360.PUBLIC.IMPORT_EXCEL/ AUTO_COMPRESS = FALSE OVERWRITE = TRUE;
```

**Talking point:**
> "I've just uploaded an Excel file to a Snowflake internal stage. In a real scenario, this could be an external stage connected to S3 or Azure Blob. Let's watch what happens."

### 4. Watch It Flow (1 minute)

- Switch back to the OpenFlow UI
- Watch the byte counters increase on each connection
- Within 10 seconds, data flows through all 5 processors
- Show the "In" and "Out" metrics updating in real-time

**Talking point:**
> "You can see data moving through the pipeline in real-time. The Excel is being parsed into structured records and streamed directly into Snowflake via Snowpipe Streaming — sub-second latency."

### 5. Verify in Snowflake (1 minute)

Switch back to SQL and query:
```sql
SELECT * FROM C360.PUBLIC.TOYOTA_INSURANCE_POLICIES LIMIT 10;
```

Show the data is there — policy numbers, customer names, premiums, vehicle details.

```sql
SELECT COUNT(*) AS TOTAL_POLICIES FROM C360.PUBLIC.TOYOTA_INSURANCE_POLICIES;
-- Returns 1000 (number of rows in Excel)
```

**Talking point:**
> "From Excel upload to queryable Snowflake table in under 10 seconds. No code written, no infrastructure to manage. OpenFlow handles parsing, schema mapping, and streaming automatically."

---

## Key Points to Emphasize

| Point | Message |
|-------|---------|
| **Zero code** | Drag-and-drop processors, no Python/Java needed |
| **Real-time** | Sub-second latency via Snowpipe Streaming |
| **Managed** | Runs inside Snowflake — no external infra to maintain |
| **Any format** | Excel, CSV, JSON, Parquet — NiFi handles 300+ formats |
| **Scalable** | Same architecture handles millions of records from CDC, Kafka, APIs |
| **Governed** | Data never leaves Snowflake's security perimeter |

---

## If Asked

- **"Can this do CDC from PostgreSQL?"** — Yes, OpenFlow has built-in CDC connectors for PostgreSQL, MySQL, SQL Server, and Oracle with real-time change capture.
- **"What about APIs like Salesforce?"** — Yes, pre-built connectors for Salesforce, Jira, HubSpot, Workday, SharePoint, and more.
- **"How does it scale?"** — OpenFlow runs on SPCS compute pools. Scale by adjusting nodes.
- **"What about scheduling?"** — Each processor has its own schedule. You can also use cron expressions for batch patterns.
