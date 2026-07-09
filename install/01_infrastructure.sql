-- AND-E Insurance App: Infrastructure Setup
-- Run this first to create the base objects

USE ROLE ACCOUNTADMIN;

-- =============================================================================
-- Database
-- =============================================================================
CREATE DATABASE IF NOT EXISTS ANDE_DB;
USE DATABASE ANDE_DB;
USE SCHEMA PUBLIC;

-- =============================================================================
-- Warehouses
-- =============================================================================

-- Standard warehouse for ad-hoc queries and data loading
CREATE WAREHOUSE IF NOT EXISTS ADHOC_WH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE;

-- Interactive warehouse for sub-second agent queries
CREATE INTERACTIVE WAREHOUSE IF NOT EXISTS ANDE_IWH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 86400
  AUTO_RESUME = TRUE;

-- =============================================================================
-- Compute Pool (for SPCS app deployment)
-- =============================================================================
CREATE COMPUTE POOL IF NOT EXISTS ANDE_COMPUTE_POOL
  MIN_NODES = 1
  MAX_NODES = 2
  INSTANCE_FAMILY = CPU_X64_S
  AUTO_SUSPEND_SECS = 3600
  AUTO_RESUME = TRUE;

-- =============================================================================
-- External Access Integration
-- Allows the SPCS app to reach external APIs during build/runtime
-- =============================================================================
CREATE OR REPLACE NETWORK RULE ALLOW_ALL_RULE
  TYPE = 'HOST_PORT'
  MODE = 'EGRESS'
  VALUE_LIST = ('0.0.0.0:443', '0.0.0.0:80');

CREATE OR REPLACE EXTERNAL ACCESS INTEGRATION ALLOW_ALL_EAI
  ALLOWED_NETWORK_RULES = (ALLOW_ALL_RULE)
  ENABLED = TRUE;

-- =============================================================================
-- Data Export Stage (holds Parquet/CSV files for data loading)
-- =============================================================================
CREATE STAGE IF NOT EXISTS ANDE_DB.PUBLIC.ANDE_EXPORT_STAGE;
