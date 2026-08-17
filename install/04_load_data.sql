-- AND-E Insurance App: Data Loading
-- =============================================================================
-- This script loads SAMPLE DATA from CSV files included in the repository.
-- These CSVs are in: data/sample/
--
-- SAMPLE DATA INCLUDED (no customer PII):
--   - customer_calls.csv (200 rows) — synthetic call center data
--   - customer_contracts.csv (14 rows) — demo insurance policies
--   - customer_claims.csv (52 rows) — demo claims
--   - customer_dependents.csv (4 rows) — demo family members
--   - web_activity.csv (23 rows) — synthetic web sessions
--   - call_governance_words.csv (1065 rows) — compliance word list
--   - call_governance_flags.csv (178 rows) — flagged call instances
--
-- LARGE TABLES NOT INCLUDED (require separate data transfer):
--   - CUSTOMER_MASTER_GOLDEN_TABLE (6.5M rows)
--   - CUSTOMER_MASTER (6.5M rows)
--   - SALESFORCE_CONTACT (7.2M rows)
--   - MATCH_CLUSTERS (24K rows)
--   - UK_CLAIMS_GEO (50K rows)
--   - TOYOTA_APPROVED_MECHANICS (25 rows)
--
-- LOADING STEPS:
--   1. Run this script to create the stage
--   2. Upload CSV files: PUT file:///path/to/data/sample/*.csv @ANDE_EXPORT_STAGE/sample_data/
--   3. Run the COPY INTO statements below
-- =============================================================================

USE ROLE ACCOUNTADMIN;
USE DATABASE ANDE_DB;
USE SCHEMA PUBLIC;
USE WAREHOUSE ADHOC_WH;

-- =============================================================================
-- STEP 1: Upload sample data CSVs to stage
-- Run these from SnowSQL or Snow CLI after cloning the repo:
-- =============================================================================
-- PUT file:///path/to/ANDE_Native_App/data/sample/customer_calls.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;
-- PUT file:///path/to/ANDE_Native_App/data/sample/customer_contracts.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;
-- PUT file:///path/to/ANDE_Native_App/data/sample/customer_claims.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;
-- PUT file:///path/to/ANDE_Native_App/data/sample/customer_dependents.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;
-- PUT file:///path/to/ANDE_Native_App/data/sample/web_activity.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;
-- PUT file:///path/to/ANDE_Native_App/data/sample/call_governance_words.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;
-- PUT file:///path/to/ANDE_Native_App/data/sample/call_governance_flags.csv @ANDE_EXPORT_STAGE/sample_data/ AUTO_COMPRESS=FALSE;

-- =============================================================================
-- STEP 2: Load sample data from CSVs
-- =============================================================================

-- CSV file format for all sample data files
CREATE OR REPLACE FILE FORMAT ANDE_DB.PUBLIC.SAMPLE_CSV_FORMAT
  TYPE = 'CSV'
  FIELD_OPTIONALLY_ENCLOSED_BY = '"'
  SKIP_HEADER = 1
  NULL_IF = ('');

-- Operational tables (sample data included in repo)
COPY INTO CUSTOMER_CALLS
  FROM @ANDE_EXPORT_STAGE/sample_data/customer_calls.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

COPY INTO CUSTOMER_CONTRACTS
  FROM @ANDE_EXPORT_STAGE/sample_data/customer_contracts.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

COPY INTO CUSTOMER_CLAIMS
  FROM @ANDE_EXPORT_STAGE/sample_data/customer_claims.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

COPY INTO CUSTOMER_DEPENDENTS
  FROM @ANDE_EXPORT_STAGE/sample_data/customer_dependents.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

COPY INTO WEB_ACTIVITY
  FROM @ANDE_EXPORT_STAGE/sample_data/web_activity.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

COPY INTO CALL_GOVERNANCE_WORDS
  FROM @ANDE_EXPORT_STAGE/sample_data/call_governance_words.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

COPY INTO CALL_GOVERNANCE_FLAGS
  FROM @ANDE_EXPORT_STAGE/sample_data/call_governance_flags.csv
  FILE_FORMAT = SAMPLE_CSV_FORMAT
  ON_ERROR = 'CONTINUE';

-- =============================================================================
-- STEP 3 (OPTIONAL): Load large tables from Parquet exports
-- These require data transfer from the source account (SFSEEUROPE-IE_DEMO10)
-- Source stage: @ANDE_DB.PUBLIC.ANDE_EXPORT_STAGE/
-- =============================================================================

-- COPY INTO CUSTOMER_MASTER_GOLDEN_TABLE FROM @ANDE_EXPORT_STAGE/customer_master_golden_table/
--   FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- COPY INTO CUSTOMER_MASTER FROM @ANDE_EXPORT_STAGE/customer_master/
--   FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- COPY INTO SALESFORCE_CONTACT FROM @ANDE_EXPORT_STAGE/salesforce_contact/
--   FILE_FORMAT = (TYPE = 'CSV' FIELD_OPTIONALLY_ENCLOSED_BY = '"' COMPRESSION = 'GZIP' SKIP_HEADER = 1);

-- COPY INTO MATCH_CLUSTERS FROM @ANDE_EXPORT_STAGE/match_clusters/
--   FILE_FORMAT = (TYPE = 'PARQUET') MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- GeoSpatial tables (GEOGRAPHY columns exported as GeoJSON strings)
-- COPY INTO UK_CLAIMS_GEO (CLAIM_ID, CUSTOMER_NAME, CLAIM_DATE, CLAIM_AMOUNT, CLAIM_TYPE, VEHICLE_MAKE, VEHICLE_MODEL, ADDRESS, CITY, POSTCODE, LOCATION, STATUS)
--   FROM (SELECT $1:CLAIM_ID::VARCHAR, $1:CUSTOMER_NAME::VARCHAR, $1:CLAIM_DATE::DATE,
--                $1:CLAIM_AMOUNT::NUMBER(10,2), $1:CLAIM_TYPE::VARCHAR, $1:VEHICLE_MAKE::VARCHAR,
--                $1:VEHICLE_MODEL::VARCHAR, $1:ADDRESS::VARCHAR, $1:CITY::VARCHAR, $1:POSTCODE::VARCHAR,
--                TRY_TO_GEOGRAPHY($1:LOCATION_GEOJSON::VARCHAR), $1:STATUS::VARCHAR
--         FROM @ANDE_EXPORT_STAGE/uk_claims_geo/)
--   FILE_FORMAT = (TYPE = 'PARQUET');

-- COPY INTO TOYOTA_APPROVED_MECHANICS (MECHANIC_ID, GARAGE_NAME, ADDRESS, CITY, POSTCODE, LOCATION, PHONE, RATING, SPECIALIZATION)
--   FROM (SELECT $1:MECHANIC_ID::VARCHAR, $1:GARAGE_NAME::VARCHAR, $1:ADDRESS::VARCHAR,
--                $1:CITY::VARCHAR, $1:POSTCODE::VARCHAR,
--                TRY_TO_GEOGRAPHY($1:LOCATION_GEOJSON::VARCHAR),
--                $1:PHONE::VARCHAR, $1:RATING::NUMBER(2,1), $1:SPECIALIZATION::VARCHAR
--         FROM @ANDE_EXPORT_STAGE/toyota_approved_mechanics/)
--   FILE_FORMAT = (TYPE = 'PARQUET');
