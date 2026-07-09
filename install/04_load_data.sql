-- AND-E Insurance App: Data Loading
-- All data has been exported to: @ANDE_DB.PUBLIC.ANDE_EXPORT_STAGE/
--
-- TO LOAD ON A NEW ACCOUNT:
--   1. Create the stage: CREATE STAGE ANDE_DB.PUBLIC.ANDE_EXPORT_STAGE;
--   2. Copy the Parquet/CSV files from the source stage to the new stage
--      (use GET to download, then PUT to upload — or use data sharing)
--   3. Run the COPY INTO statements below

-- ============================================================
-- NOTE: Large tables (6.5M+ rows) cannot be inlined as INSERT statements.
-- Use the export/import process described above for:
--   - CUSTOMER_MASTER_GOLDEN_TABLE (6.5M rows)
--   - CUSTOMER_MASTER (6.5M rows)
--   - SALESFORCE_CONTACT (7.2M rows)
--   - MATCH_CLUSTERS (24K rows)
--   - UK_CLAIMS_GEO (50K rows)
--
-- The following INSERT statements cover the smaller operational tables.
-- ============================================================

USE ROLE ACCOUNTADMIN;
USE DATABASE ANDE_DB;
USE SCHEMA PUBLIC;
USE WAREHOUSE ADHOC_WH;

-- ============================================================
-- CUSTOMER_CONTRACTS (14 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_CONTRACTS;
-- These contain the insurance policies with full contract text.
-- Use the data export utility or manually insert from the source system.

-- ============================================================
-- CUSTOMER_CALLS (200 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_CALLS;
-- Contains call transcriptions, AI-generated summaries, sentiment analysis.
-- Contains FCA compliance statements in ~50% of calls.

-- ============================================================
-- CUSTOMER_DEPENDENTS (4 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_DEPENDENTS;
-- Loaded via Parquet COPY below.

-- ============================================================
-- CUSTOMER_CLAIMS (52 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_CLAIMS;
-- Contains insurance claims with amounts, statuses, and country data.

-- ============================================================
-- WEB_ACTIVITY (23 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.WEB_ACTIVITY;
-- Contains web session data: pages viewed, forms submitted, campaign tracking.

-- ============================================================
-- CALL_GOVERNANCE_WORDS (1065 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.CALL_GOVERNANCE_WORDS;
-- Contains flagged words/phrases for call monitoring (profanity, threats, PII).

-- ============================================================
-- CALL_GOVERNANCE_FLAGS (178 rows)
-- ============================================================
-- Export from source: SELECT * FROM ANDE_DB.PUBLIC.CALL_GOVERNANCE_FLAGS;
-- Contains flagged call instances from governance word matching.

-- ============================================================
-- TOYOTA_APPROVED_MECHANICS (25 rows)
-- ============================================================
-- Export from source: SELECT * FROM CUSTOMER_360.PUBLIC.TOYOTA_APPROVED_MECHANICS;
-- Contains approved Toyota mechanic locations across the UK with GEOGRAPHY points.

-- ============================================================
-- DATA IMPORT COMMANDS (run on TARGET account after uploading files to stage)
-- ============================================================

-- Small operational tables (Parquet)
COPY INTO CUSTOMER_CALLS FROM @ANDE_EXPORT_STAGE/customer_calls/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO CUSTOMER_CONTRACTS FROM @ANDE_EXPORT_STAGE/customer_contracts/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO CUSTOMER_CLAIMS FROM @ANDE_EXPORT_STAGE/customer_claims/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO CUSTOMER_DEPENDENTS FROM @ANDE_EXPORT_STAGE/customer_dependents/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO WEB_ACTIVITY FROM @ANDE_EXPORT_STAGE/web_activity/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO CALL_GOVERNANCE_WORDS FROM @ANDE_EXPORT_STAGE/call_governance_words/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO CALL_GOVERNANCE_FLAGS FROM @ANDE_EXPORT_STAGE/call_governance_flags/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO MATCH_CLUSTERS FROM @ANDE_EXPORT_STAGE/match_clusters/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- GeoSpatial tables (exported with LOCATION as GeoJSON string — convert back)
COPY INTO UK_CLAIMS_GEO (CLAIM_ID, CUSTOMER_NAME, CLAIM_DATE, CLAIM_AMOUNT, CLAIM_TYPE, VEHICLE_MAKE, VEHICLE_MODEL, ADDRESS, CITY, POSTCODE, LOCATION, STATUS)
  FROM (SELECT $1:CLAIM_ID::VARCHAR, $1:CUSTOMER_NAME::VARCHAR, $1:CLAIM_DATE::DATE,
               $1:CLAIM_AMOUNT::NUMBER(10,2), $1:CLAIM_TYPE::VARCHAR, $1:VEHICLE_MAKE::VARCHAR,
               $1:VEHICLE_MODEL::VARCHAR, $1:ADDRESS::VARCHAR, $1:CITY::VARCHAR, $1:POSTCODE::VARCHAR,
               TRY_TO_GEOGRAPHY($1:LOCATION_GEOJSON::VARCHAR), $1:STATUS::VARCHAR
        FROM @ANDE_EXPORT_STAGE/uk_claims_geo/)
  FILE_FORMAT = (TYPE = 'PARQUET');

COPY INTO TOYOTA_APPROVED_MECHANICS (MECHANIC_ID, GARAGE_NAME, ADDRESS, CITY, POSTCODE, LOCATION, PHONE, RATING, SPECIALIZATION)
  FROM (SELECT $1:MECHANIC_ID::VARCHAR, $1:GARAGE_NAME::VARCHAR, $1:ADDRESS::VARCHAR,
               $1:CITY::VARCHAR, $1:POSTCODE::VARCHAR,
               TRY_TO_GEOGRAPHY($1:LOCATION_GEOJSON::VARCHAR),
               $1:PHONE::VARCHAR, $1:RATING::NUMBER(2,1), $1:SPECIALIZATION::VARCHAR
        FROM @ANDE_EXPORT_STAGE/toyota_approved_mechanics/)
  FILE_FORMAT = (TYPE = 'PARQUET');

-- Large tables (Parquet)
COPY INTO CUSTOMER_MASTER_GOLDEN_TABLE FROM @ANDE_EXPORT_STAGE/customer_master_golden_table/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

COPY INTO CUSTOMER_MASTER FROM @ANDE_EXPORT_STAGE/customer_master/
  FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- SALESFORCE_CONTACT (CSV with GZIP compression)
-- NOTE: Column order in CSV must match table definition exactly since
-- MATCH_BY_COLUMN_NAME is not supported for CSV format.
COPY INTO SALESFORCE_CONTACT FROM @ANDE_EXPORT_STAGE/salesforce_contact/
  FILE_FORMAT = (TYPE = 'CSV' FIELD_OPTIONALLY_ENCLOSED_BY = '"' COMPRESSION = 'GZIP' SKIP_HEADER = 1);

-- ============================================================
-- SOURCE STAGE LOCATION (on SFSEEUROPE-IE_DEMO10 account):
-- @ANDE_DB.PUBLIC.ANDE_EXPORT_STAGE/
-- All files are already exported and ready to transfer.
-- ============================================================
