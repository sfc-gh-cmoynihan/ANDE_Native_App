-- AND-E Insurance App: Interactive Tables
-- These provide sub-second query performance for the Cortex Agent via the Interactive Warehouse.
-- Run AFTER 01_tables.sql (requires base tables to exist).

USE ROLE ACCOUNTADMIN;
USE DATABASE ANDE_DB;
USE SCHEMA PUBLIC;

-- =============================================================================
-- Interactive Tables (materialized copies with clustering for fast lookups)
-- =============================================================================

CREATE OR REPLACE INTERACTIVE TABLE CUSTOMERS_IT
  CLUSTER BY (MASTER_CUSTOMER_ID)
  TARGET_LAG = '1 hour'
  WAREHOUSE = ADHOC_WH
  AS SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_MASTER_GOLDEN_TABLE;

CREATE OR REPLACE INTERACTIVE TABLE CONTRACTS_IT
  CLUSTER BY (MASTER_CUSTOMER_ID)
  TARGET_LAG = '1 hour'
  WAREHOUSE = ADHOC_WH
  AS SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_CONTRACTS;

CREATE OR REPLACE INTERACTIVE TABLE CALLS_IT
  CLUSTER BY (MASTER_CUSTOMER_ID)
  TARGET_LAG = '1 hour'
  WAREHOUSE = ADHOC_WH
  AS SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_CALLS;

CREATE OR REPLACE INTERACTIVE TABLE WEB_ACTIVITY_IT
  CLUSTER BY (MASTER_CUSTOMER_ID)
  TARGET_LAG = '1 hour'
  WAREHOUSE = ADHOC_WH
  AS SELECT * FROM ANDE_DB.PUBLIC.WEB_ACTIVITY;

CREATE OR REPLACE INTERACTIVE TABLE DEPENDENTS_IT
  CLUSTER BY (MASTER_CUSTOMER_ID)
  TARGET_LAG = '1 hour'
  WAREHOUSE = ADHOC_WH
  AS SELECT * FROM ANDE_DB.PUBLIC.CUSTOMER_DEPENDENTS;

-- =============================================================================
-- Attach interactive tables to the interactive warehouse
-- This enables the IWH to serve sub-second queries against these tables
-- =============================================================================
ALTER INTERACTIVE WAREHOUSE ANDE_IWH ADD
  ANDE_DB.PUBLIC.CUSTOMERS_IT,
  ANDE_DB.PUBLIC.CONTRACTS_IT,
  ANDE_DB.PUBLIC.CALLS_IT,
  ANDE_DB.PUBLIC.WEB_ACTIVITY_IT,
  ANDE_DB.PUBLIC.DEPENDENTS_IT;
