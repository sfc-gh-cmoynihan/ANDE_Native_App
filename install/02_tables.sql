-- AND-E Insurance App: Table Definitions
-- Creates all application tables in ANDE_DB.PUBLIC

USE ROLE ACCOUNTADMIN;
USE DATABASE ANDE_DB;
USE SCHEMA PUBLIC;
USE WAREHOUSE ADHOC_WH;

-- =============================================================================
-- Customer Master (raw pre-matched records from all source systems)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CUSTOMER_MASTER (
  MASTER_CUSTOMER_ID   VARCHAR(50),
  SOURCE_SYSTEM        VARCHAR(20),
  SOURCE_ID            VARCHAR(50),
  FULL_NAME            VARCHAR(400),
  FIRST_NAME           VARCHAR(200),
  LAST_NAME            VARCHAR(200),
  EMAIL                VARCHAR(300),
  PHONE                VARCHAR(120),
  MOBILE_PHONE         VARCHAR(120),
  STREET               VARCHAR(500),
  CITY                 VARCHAR(200),
  POSTAL_CODE          VARCHAR(60),
  COUNTRY              VARCHAR(100),
  PPSN_SSN             VARCHAR(60),
  SF_ACCOUNT_NAME      VARCHAR(500),
  TITLE                VARCHAR(400),
  DEPARTMENT           VARCHAR(300),
  MATCH_CONFIDENCE     FLOAT,
  RECORD_COUNT         NUMBER(18,0),
  DATE_OF_BIRTH        DATE,
  CREATED_DATE         TIMESTAMP_NTZ(9)
);

-- =============================================================================
-- Customer Master Golden Table (deduplicated, matched records)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CUSTOMER_MASTER_GOLDEN_TABLE (
  MASTER_CUSTOMER_ID   VARCHAR(50),
  SOURCE_SYSTEM        VARCHAR(20),
  SOURCE_ID            VARCHAR(50),
  FULL_NAME            VARCHAR(400),
  FIRST_NAME           VARCHAR(200),
  LAST_NAME            VARCHAR(200),
  EMAIL                VARCHAR(300),
  PHONE                VARCHAR(120),
  MOBILE_PHONE         VARCHAR(120),
  STREET               VARCHAR(500),
  CITY                 VARCHAR(200),
  POSTAL_CODE          VARCHAR(60),
  COUNTRY              VARCHAR(100),
  PPSN_SSN             VARCHAR(60),
  SF_ACCOUNT_NAME      VARCHAR(500),
  TITLE                VARCHAR(400),
  DEPARTMENT           VARCHAR(300),
  MATCH_CONFIDENCE     FLOAT,
  RECORD_COUNT         NUMBER(18,0),
  DATE_OF_BIRTH        DATE
);

-- =============================================================================
-- Salesforce Contact (source system records with SF-specific fields)
-- =============================================================================
CREATE TABLE IF NOT EXISTS SALESFORCE_CONTACT (
  MASTER_CUSTOMER_ID   VARCHAR(50),
  SOURCE_SYSTEM        VARCHAR(20),
  SOURCE_ID            VARCHAR(50),
  FULL_NAME            VARCHAR(400),
  FIRST_NAME           VARCHAR(200),
  LAST_NAME            VARCHAR(200),
  EMAIL                VARCHAR(300),
  PHONE                VARCHAR(120),
  MOBILE_PHONE         VARCHAR(120),
  STREET               VARCHAR(500),
  CITY                 VARCHAR(200),
  POSTAL_CODE          VARCHAR(60),
  COUNTRY              VARCHAR(100),
  PPSN_SSN             VARCHAR(60),
  SF_ACCOUNT_NAME      VARCHAR(500),
  TITLE                VARCHAR(400),
  DEPARTMENT           VARCHAR(300),
  MATCH_CONFIDENCE     FLOAT,
  RECORD_COUNT         NUMBER(18,0),
  DATE_OF_BIRTH        DATE
);

-- =============================================================================
-- Match Clusters (identity resolution groupings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS MATCH_CLUSTERS (
  CLUSTER_ID           VARCHAR(50),
  MASTER_CUSTOMER_ID   VARCHAR(50),
  SOURCE_SYSTEM        VARCHAR(20),
  SOURCE_ID            VARCHAR(50),
  MATCH_SCORE          FLOAT
);

-- =============================================================================
-- Customer Calls (call center interactions with transcriptions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CUSTOMER_CALLS (
  CALL_ID              VARCHAR(20),
  MASTER_CUSTOMER_ID   VARCHAR(50),
  CALL_DATE            TIMESTAMP_NTZ(9),
  DURATION_SECONDS     NUMBER(38,0),
  AGENT_NAME           VARCHAR(100),
  CALL_TYPE            VARCHAR(20),
  SENTIMENT            VARCHAR(20),
  MP4_FILE_PATH        VARCHAR(500),
  TRANSCRIPTION        VARCHAR(16777216),
  SUMMARY              VARCHAR(16777216),
  WAIT_SECONDS         NUMBER(38,0) DEFAULT 0,
  WRAP_UP_SECONDS      NUMBER(38,0) DEFAULT 0,
  RESOLVED_FIRST_CALL  BOOLEAN DEFAULT TRUE,
  CSAT_SCORE           NUMBER(2,1) DEFAULT 3.5,
  NPS_SCORE            NUMBER(3,0) DEFAULT 50,
  CHANNEL              VARCHAR(20) DEFAULT 'Phone',
  ABANDONED            BOOLEAN DEFAULT FALSE,
  KEYWORDS             VARCHAR(500)
);

-- =============================================================================
-- Customer Contracts (policy documents)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CUSTOMER_CONTRACTS (
  CONTRACT_ID          VARCHAR(20),
  MASTER_CUSTOMER_ID   VARCHAR(50),
  CUSTOMER_NAME        VARCHAR(200),
  CONTRACT_TITLE       VARCHAR(200),
  CONTRACT_DATE        DATE,
  EXPIRY_DATE          DATE,
  CONTRACT_VALUE       NUMBER(12,2),
  STATUS               VARCHAR(20),
  PDF_STAGE_PATH       VARCHAR(500),
  CONTRACT_TEXT        VARCHAR(16777216),
  SIGNED_BY_CUSTOMER   VARCHAR(200),
  SIGNED_BY_PROVIDER   VARCHAR(200),
  SIGNATURE_DATE       DATE
);

-- =============================================================================
-- Customer Dependents (family members on policies)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CUSTOMER_DEPENDENTS (
  DEPENDENT_ID         VARCHAR(16777216),
  MASTER_CUSTOMER_ID   VARCHAR(16777216),
  FULL_NAME            VARCHAR(16777216),
  DATE_OF_BIRTH        DATE,
  GENDER               VARCHAR(16777216),
  RELATIONSHIP         VARCHAR(16777216),
  DRIVER_STATUS        VARCHAR(16777216),
  LICENSE_TYPE         VARCHAR(16777216)
);

-- =============================================================================
-- Customer Claims
-- =============================================================================
CREATE TABLE IF NOT EXISTS CUSTOMER_CLAIMS (
  CLAIM_ID             VARCHAR(20),
  MASTER_CUSTOMER_ID   VARCHAR(50),
  CUSTOMER_NAME        VARCHAR(200),
  CLAIM_TYPE           VARCHAR(50),
  CLAIM_DATE           DATE,
  CLAIM_AMOUNT         NUMBER(12,2),
  STATUS               VARCHAR(20),
  DESCRIPTION          VARCHAR(500),
  RESOLUTION_DATE      DATE,
  COUNTRY              VARCHAR(50)
);

-- =============================================================================
-- Web Activity (digital engagement tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS WEB_ACTIVITY (
  ACTIVITY_ID                VARCHAR(50),
  MASTER_CUSTOMER_ID         VARCHAR(50),
  ACTIVITY_TYPE              VARCHAR(50),
  PAGE_URL                   VARCHAR(500),
  SESSION_DURATION_SECONDS   NUMBER(38,0),
  PAGES_VIEWED               NUMBER(38,0),
  CHANNEL                    VARCHAR(50),
  DEVICE_TYPE                VARCHAR(30),
  BROWSER                    VARCHAR(50),
  ACTIVITY_DATE              TIMESTAMP_TZ(9),
  FORM_SUBMITTED             BOOLEAN,
  FORM_NAME                  VARCHAR(200),
  CAMPAIGN_SOURCE            VARCHAR(200),
  CAMPAIGN_MEDIUM            VARCHAR(100)
);

-- =============================================================================
-- Call Governance Words (watchlist vocabulary for compliance)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CALL_GOVERNANCE_WORDS (
  WORD        VARCHAR(200) NOT NULL,
  CATEGORY    VARCHAR(50) NOT NULL,
  SEVERITY    VARCHAR(20) DEFAULT 'MEDIUM',
  IS_ACTIVE   BOOLEAN DEFAULT TRUE,
  CREATED_AT  TIMESTAMP_NTZ(9) DEFAULT CURRENT_TIMESTAMP()
);

-- =============================================================================
-- Call Governance Flags (flagged call incidents for review)
-- =============================================================================
CREATE TABLE IF NOT EXISTS CALL_GOVERNANCE_FLAGS (
  FLAG_ID       NUMBER(38,0) AUTOINCREMENT START 1 INCREMENT 1 NOORDER,
  CALL_ID       VARCHAR(100) NOT NULL,
  WORD_MATCHED  VARCHAR(200) NOT NULL,
  CATEGORY      VARCHAR(50) NOT NULL,
  CONTEXT       VARCHAR(500),
  STATUS        VARCHAR(20) DEFAULT 'PENDING',
  REVIEWED_BY   VARCHAR(100),
  REVIEWED_AT   TIMESTAMP_NTZ(9),
  REVIEW_NOTES  VARCHAR(1000),
  FLAGGED_AT    TIMESTAMP_NTZ(9) DEFAULT CURRENT_TIMESTAMP()
);

-- =============================================================================
-- UK Claims Geo (geospatial claims data for map visualizations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS UK_CLAIMS_GEO (
  CLAIM_ID       VARCHAR(20),
  CUSTOMER_NAME  VARCHAR(100),
  CLAIM_DATE     DATE,
  CLAIM_AMOUNT   NUMBER(10,2),
  CLAIM_TYPE     VARCHAR(50),
  VEHICLE_MAKE   VARCHAR(50),
  VEHICLE_MODEL  VARCHAR(50),
  ADDRESS        VARCHAR(200),
  CITY           VARCHAR(100),
  POSTCODE       VARCHAR(50),
  LOCATION       GEOGRAPHY,
  STATUS         VARCHAR(20)
);

-- =============================================================================
-- Toyota Approved Mechanics (repair network for claims routing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS TOYOTA_APPROVED_MECHANICS (
  MECHANIC_ID     VARCHAR(20),
  GARAGE_NAME     VARCHAR(200),
  ADDRESS         VARCHAR(200),
  CITY            VARCHAR(100),
  POSTCODE        VARCHAR(10),
  LOCATION        GEOGRAPHY,
  PHONE           VARCHAR(20),
  RATING          NUMBER(2,1),
  SPECIALIZATION  VARCHAR(100)
);
