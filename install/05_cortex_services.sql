-- =============================================================================
-- AND-E Insurance: Cortex Services
-- =============================================================================
-- This script creates all Cortex AI services for the AND-E Insurance app:
--   1. Cortex Search Services (document/contract search)
--   2. Semantic Views (structured data access for Cortex Analyst)
--   3. Cortex Agent (unified AI assistant)
--
-- Prerequisites:
--   - ANDE_DB database and PUBLIC schema exist
--   - All source tables are created and populated
--   - Interactive tables (CALLS_IT, CONTRACTS_IT, CUSTOMERS_IT, etc.) exist
--   - ADHOC_WH and ANDE_IWH warehouses exist
-- =============================================================================

USE ROLE ACCOUNTADMIN;
USE DATABASE ANDE_DB;
USE SCHEMA PUBLIC;
USE WAREHOUSE ADHOC_WH;

-- =============================================================================
-- SECTION 1: CORTEX SEARCH SERVICES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1a. Contract Search Service
-- General-purpose search across all customer contracts.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE CORTEX SEARCH SERVICE ANDE_DB.PUBLIC.CONTRACT_SEARCH_SERVICE
  ON CONTRACT_TEXT
  ATTRIBUTES CONTRACT_TITLE, CUSTOMER_NAME, STATUS
  WAREHOUSE = ADHOC_WH
  TARGET_LAG = '1 hour'
  AS (
    SELECT
      CONTRACT_TEXT,
      CONTRACT_TITLE,
      CONTRACT_ID,
      MASTER_CUSTOMER_ID,
      CUSTOMER_NAME,
      STATUS,
      CONTRACT_DATE::VARCHAR AS CONTRACT_DATE,
      EXPIRY_DATE::VARCHAR AS EXPIRY_DATE,
      CONTRACT_VALUE::VARCHAR AS CONTRACT_VALUE,
      PDF_STAGE_PATH
    FROM ANDE_DB.PUBLIC.CUSTOMER_CONTRACTS
  );

-- -----------------------------------------------------------------------------
-- 1b. Document Search Service
-- Search across contracts with non-null text content. Used by the Cortex Agent
-- for document/policy lookup queries.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE CORTEX SEARCH SERVICE ANDE_DB.PUBLIC.DOCUMENT_SEARCH_SERVICE
  ON CONTRACT_TEXT
  ATTRIBUTES CONTRACT_TITLE, CONTRACT_ID, MASTER_CUSTOMER_ID, CUSTOMER_NAME, STATUS
  WAREHOUSE = ADHOC_WH
  TARGET_LAG = '1 hour'
  AS (
    SELECT
      CONTRACT_TEXT,
      CONTRACT_TITLE,
      CONTRACT_ID,
      MASTER_CUSTOMER_ID,
      CUSTOMER_NAME,
      STATUS,
      CONTRACT_DATE::VARCHAR AS CONTRACT_DATE,
      EXPIRY_DATE::VARCHAR AS EXPIRY_DATE,
      CONTRACT_VALUE::VARCHAR AS CONTRACT_VALUE,
      PDF_STAGE_PATH
    FROM ANDE_DB.PUBLIC.CUSTOMER_CONTRACTS
    WHERE CONTRACT_TEXT IS NOT NULL
  );


-- =============================================================================
-- SECTION 2: SEMANTIC VIEWS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2a. SV_CUSTOMER_360 - Multi-table joined view for full customer analytics
-- Joins calls, contracts, and customers for comprehensive querying.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE SEMANTIC VIEW ANDE_DB.PUBLIC.SV_CUSTOMER_360
  TABLES (
    CALLS AS ANDE_DB.PUBLIC.CALLS_IT PRIMARY KEY (CALL_ID),
    CONTRACTS AS ANDE_DB.PUBLIC.CONTRACTS_IT PRIMARY KEY (CONTRACT_ID),
    CUSTOMERS AS ANDE_DB.PUBLIC.CUSTOMERS_IT PRIMARY KEY (MASTER_CUSTOMER_ID)
  )
  RELATIONSHIPS (
    CALLS(MASTER_CUSTOMER_ID) REFERENCES CUSTOMERS(MASTER_CUSTOMER_ID),
    CONTRACTS(MASTER_CUSTOMER_ID) REFERENCES CUSTOMERS(MASTER_CUSTOMER_ID)
  )
  FACTS (
    CALLS.DURATION_SECONDS AS DURATION_SECONDS COMMENT='Call duration in seconds',
    CONTRACTS.CONTRACT_VALUE AS CONTRACT_VALUE COMMENT='Monetary value of the contract in euros',
    CUSTOMERS.RECORD_COUNT AS RECORD_COUNT COMMENT='Number of source records linked to this customer'
  )
  DIMENSIONS (
    CALLS.CALL_ID AS CALL_ID COMMENT='Unique call identifier',
    CALLS.AGENT_NAME AS AGENT_NAME COMMENT='Agent who handled the call',
    CALLS.CALL_TYPE AS CALL_TYPE COMMENT='Call type' SAMPLE_VALUES ('Inbound', 'Outbound', 'Support'),
    CALLS.SENTIMENT AS SENTIMENT COMMENT='AI-classified call sentiment' SAMPLE_VALUES ('Positive', 'Negative', 'Neutral'),
    CALLS.SUMMARY AS SUMMARY COMMENT='AI-generated call summary',
    CALLS.CALL_DATE AS CALL_DATE COMMENT='Date and time of the call',
    CONTRACTS.CONTRACT_ID AS CONTRACT_ID COMMENT='Unique contract identifier',
    CONTRACTS.CUSTOMER_NAME AS CUSTOMER_NAME COMMENT='Customer name on contract',
    CONTRACTS.CONTRACT_TITLE AS CONTRACT_TITLE COMMENT='Title of the contract',
    CONTRACTS.STATUS AS STATUS COMMENT='Contract status' SAMPLE_VALUES ('Active', 'Expired', 'Pending'),
    CONTRACTS.SIGNED_BY_CUSTOMER AS SIGNED_BY_CUSTOMER COMMENT='Customer signatory',
    CONTRACTS.CONTRACT_DATE AS CONTRACT_DATE COMMENT='Date the contract was signed',
    CONTRACTS.EXPIRY_DATE AS EXPIRY_DATE COMMENT='Contract expiration date',
    CUSTOMERS.MASTER_CUSTOMER_ID AS MASTER_CUSTOMER_ID COMMENT='Unique master customer identifier',
    CUSTOMERS.FULL_NAME AS FULL_NAME COMMENT='Customer full name',
    CUSTOMERS.EMAIL AS EMAIL COMMENT='Customer email address',
    CUSTOMERS.PHONE AS PHONE COMMENT='Customer phone number',
    CUSTOMERS.CITY AS CITY COMMENT='Customer city',
    CUSTOMERS.COUNTRY AS COUNTRY COMMENT='Customer country',
    CUSTOMERS.DATE_OF_BIRTH AS DATE_OF_BIRTH COMMENT='Customer date of birth',
    CUSTOMERS.SOURCE_SYSTEM AS SOURCE_SYSTEM COMMENT='Primary source system' SAMPLE_VALUES ('SALESFORCE', 'SAP', 'WEB')
  )
  METRICS (
    TOTAL_CONTRACT_VALUE AS SUM(CONTRACTS.CONTRACT_VALUE) COMMENT='Total value of all contracts',
    CONTRACT_COUNT AS COUNT(CONTRACTS.CONTRACT_ID) COMMENT='Number of contracts',
    CALL_COUNT AS COUNT(CALLS.CALL_ID) COMMENT='Number of calls',
    AVG_CONTRACT_VALUE AS AVG(CONTRACTS.CONTRACT_VALUE) COMMENT='Average contract value in euros'
  );

-- -----------------------------------------------------------------------------
-- 2b. SV_CALLS - Call center data semantic view
-- -----------------------------------------------------------------------------
CREATE OR REPLACE SEMANTIC VIEW ANDE_DB.PUBLIC.SV_CALLS
  TABLES (CALLS AS ANDE_DB.PUBLIC.CALLS_IT PRIMARY KEY (CALL_ID))
  FACTS (CALLS.DURATION_SECONDS AS DURATION_SECONDS COMMENT='Duration of the call in seconds')
  DIMENSIONS (
    CALLS.CALL_ID AS CALL_ID COMMENT='Unique call identifier',
    CALLS.MASTER_CUSTOMER_ID AS MASTER_CUSTOMER_ID COMMENT='Customer master record ID',
    CALLS.AGENT_NAME AS AGENT_NAME COMMENT='Name of the call center agent who handled the call',
    CALLS.CALL_TYPE AS CALL_TYPE COMMENT='Type of call' SAMPLE_VALUES ('Inbound', 'Outbound', 'Support'),
    CALLS.SENTIMENT AS SENTIMENT COMMENT='Call sentiment classification' SAMPLE_VALUES ('Positive', 'Negative', 'Neutral'),
    CALLS.SUMMARY AS SUMMARY COMMENT='AI-generated summary of the call',
    CALLS.CALL_DATE AS CALL_DATE COMMENT='Date and time when the call occurred'
  );

-- -----------------------------------------------------------------------------
-- 2c. SV_CONTRACTS - Insurance contracts semantic view
-- -----------------------------------------------------------------------------
CREATE OR REPLACE SEMANTIC VIEW ANDE_DB.PUBLIC.SV_CONTRACTS
  TABLES (CONTRACTS AS ANDE_DB.PUBLIC.CONTRACTS_IT PRIMARY KEY (CONTRACT_ID))
  FACTS (CONTRACTS.CONTRACT_VALUE AS CONTRACT_VALUE COMMENT='Monetary value of the contract in euros')
  DIMENSIONS (
    CONTRACTS.CONTRACT_ID AS CONTRACT_ID COMMENT='Unique contract identifier',
    CONTRACTS.MASTER_CUSTOMER_ID AS MASTER_CUSTOMER_ID COMMENT='Customer master record ID',
    CONTRACTS.CUSTOMER_NAME AS CUSTOMER_NAME COMMENT='Customer name on contract',
    CONTRACTS.CONTRACT_TITLE AS CONTRACT_TITLE COMMENT='Title or name of the contract',
    CONTRACTS.STATUS AS STATUS COMMENT='Contract status' SAMPLE_VALUES ('Active', 'Expired', 'Pending'),
    CONTRACTS.SIGNED_BY_CUSTOMER AS SIGNED_BY_CUSTOMER COMMENT='Customer signatory',
    CONTRACTS.SIGNED_BY_PROVIDER AS SIGNED_BY_PROVIDER COMMENT='Provider signatory',
    CONTRACTS.CONTRACT_DATE AS CONTRACT_DATE COMMENT='Date the contract was signed',
    CONTRACTS.EXPIRY_DATE AS EXPIRY_DATE COMMENT='Contract expiration date',
    CONTRACTS.SIGNATURE_DATE AS SIGNATURE_DATE COMMENT='Date contract was formally signed'
  );

-- -----------------------------------------------------------------------------
-- 2d. SV_CUSTOMERS - Master customer records semantic view
-- -----------------------------------------------------------------------------
CREATE OR REPLACE SEMANTIC VIEW ANDE_DB.PUBLIC.SV_CUSTOMERS
  TABLES (CUSTOMERS AS ANDE_DB.PUBLIC.CUSTOMERS_IT PRIMARY KEY (MASTER_CUSTOMER_ID))
  FACTS (
    CUSTOMERS.MATCH_CONFIDENCE AS MATCH_CONFIDENCE COMMENT='Confidence score for identity matching',
    CUSTOMERS.RECORD_COUNT AS RECORD_COUNT COMMENT='Number of source system records matched'
  )
  DIMENSIONS (
    CUSTOMERS.MASTER_CUSTOMER_ID AS MASTER_CUSTOMER_ID COMMENT='Unique master customer record identifier',
    CUSTOMERS.SOURCE_SYSTEM AS SOURCE_SYSTEM COMMENT='Source system origin' SAMPLE_VALUES ('SALESFORCE', 'SAP', 'WEB'),
    CUSTOMERS.FULL_NAME AS FULL_NAME COMMENT='Customer full name',
    CUSTOMERS.FIRST_NAME AS FIRST_NAME COMMENT='Customer first name',
    CUSTOMERS.LAST_NAME AS LAST_NAME COMMENT='Customer last name',
    CUSTOMERS.EMAIL AS EMAIL COMMENT='Customer email address',
    CUSTOMERS.PHONE AS PHONE COMMENT='Customer phone number',
    CUSTOMERS.MOBILE_PHONE AS MOBILE_PHONE COMMENT='Customer mobile phone number',
    CUSTOMERS.CITY AS CITY COMMENT='Customer city',
    CUSTOMERS.COUNTRY AS COUNTRY COMMENT='Customer country',
    CUSTOMERS.POSTAL_CODE AS POSTAL_CODE COMMENT='Customer postal code',
    CUSTOMERS.STREET AS STREET COMMENT='Customer street address',
    CUSTOMERS.PPSN_SSN AS PPSN_SSN COMMENT='Personal Public Service Number or Social Security Number',
    CUSTOMERS.SF_ACCOUNT_NAME AS SF_ACCOUNT_NAME COMMENT='Salesforce account company name',
    CUSTOMERS.TITLE AS TITLE COMMENT='Job title',
    CUSTOMERS.DEPARTMENT AS DEPARTMENT COMMENT='Department',
    CUSTOMERS.DATE_OF_BIRTH AS DATE_OF_BIRTH COMMENT='Customer date of birth'
  );

-- -----------------------------------------------------------------------------
-- 2e. SV_WEB_ACTIVITY - Web analytics semantic view
-- -----------------------------------------------------------------------------
CREATE OR REPLACE SEMANTIC VIEW ANDE_DB.PUBLIC.SV_WEB_ACTIVITY
  TABLES (WEB_ACTIVITY AS ANDE_DB.PUBLIC.WEB_ACTIVITY_IT PRIMARY KEY (ACTIVITY_ID))
  FACTS (
    WEB_ACTIVITY.SESSION_DURATION_SECONDS AS SESSION_DURATION_SECONDS COMMENT='Duration of web session in seconds',
    WEB_ACTIVITY.PAGES_VIEWED AS PAGES_VIEWED COMMENT='Number of pages viewed'
  )
  DIMENSIONS (
    WEB_ACTIVITY.ACTIVITY_ID AS ACTIVITY_ID COMMENT='Unique web activity event identifier',
    WEB_ACTIVITY.MASTER_CUSTOMER_ID AS MASTER_CUSTOMER_ID COMMENT='Customer master record ID',
    WEB_ACTIVITY.ACTIVITY_TYPE AS ACTIVITY_TYPE COMMENT='Type of web activity' SAMPLE_VALUES ('page_view', 'form_submit', 'download'),
    WEB_ACTIVITY.PAGE_URL AS PAGE_URL COMMENT='URL of the page visited',
    WEB_ACTIVITY.CHANNEL AS CHANNEL COMMENT='Marketing channel' SAMPLE_VALUES ('organic', 'paid', 'social', 'email', 'direct'),
    WEB_ACTIVITY.DEVICE_TYPE AS DEVICE_TYPE COMMENT='Device type' SAMPLE_VALUES ('desktop', 'mobile', 'tablet'),
    WEB_ACTIVITY.BROWSER AS BROWSER COMMENT='Web browser used',
    WEB_ACTIVITY.FORM_NAME AS FORM_NAME COMMENT='Name of form submitted',
    WEB_ACTIVITY.CAMPAIGN_SOURCE AS CAMPAIGN_SOURCE COMMENT='Campaign source (UTM)',
    WEB_ACTIVITY.CAMPAIGN_MEDIUM AS CAMPAIGN_MEDIUM COMMENT='Campaign medium (UTM)',
    WEB_ACTIVITY.FORM_SUBMITTED AS FORM_SUBMITTED COMMENT='Whether a form was submitted',
    WEB_ACTIVITY.ACTIVITY_DATE AS ACTIVITY_DATE COMMENT='Date and time of the web activity'
  );

-- -----------------------------------------------------------------------------
-- 2f. SV_DEPENDENTS - Insurance dependents semantic view
-- -----------------------------------------------------------------------------
CREATE OR REPLACE SEMANTIC VIEW ANDE_DB.PUBLIC.SV_DEPENDENTS
  TABLES (DEPENDENTS AS ANDE_DB.PUBLIC.DEPENDENTS_IT PRIMARY KEY (DEPENDENT_ID))
  DIMENSIONS (
    DEPENDENTS.DEPENDENT_ID AS DEPENDENT_ID COMMENT='Unique dependent identifier',
    DEPENDENTS.MASTER_CUSTOMER_ID AS MASTER_CUSTOMER_ID COMMENT='Customer master record ID',
    DEPENDENTS.FULL_NAME AS FULL_NAME COMMENT='Dependent full name',
    DEPENDENTS.GENDER AS GENDER COMMENT='Dependent gender' SAMPLE_VALUES ('Male', 'Female'),
    DEPENDENTS.RELATIONSHIP AS RELATIONSHIP COMMENT='Relationship to primary customer' SAMPLE_VALUES ('Spouse', 'Child', 'Parent'),
    DEPENDENTS.DRIVER_STATUS AS DRIVER_STATUS COMMENT='Driving status' SAMPLE_VALUES ('Full License', 'Learner', 'None'),
    DEPENDENTS.LICENSE_TYPE AS LICENSE_TYPE COMMENT='Type of driving license',
    DEPENDENTS.DATE_OF_BIRTH AS DATE_OF_BIRTH COMMENT='Dependent date of birth'
  );


-- =============================================================================
-- SECTION 3: CORTEX AGENT
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ANDE_AGENT - Unified AI assistant for AND-E Insurance
-- Combines document search and structured data querying capabilities.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE AGENT ANDE_DB.PUBLIC.ANDE_AGENT
  MODEL = 'claude-sonnet-4-6'
  ORCHESTRATION_BUDGET_SECONDS = 120
  ORCHESTRATION_BUDGET_TOKENS = 100000
  TOOLS = (
    document_search = TOOL_SPEC(
      TYPE = 'cortex_search',
      DESCRIPTION = 'Search across all insurance policy documents and contracts. Use this to find specific policy details, coverage information, vehicle details, exclusions, premiums, and contract terms.'
    ),
    query_customer_data = TOOL_SPEC(
      TYPE = 'cortex_analyst_text_to_sql',
      DESCRIPTION = 'Query structured customer data including customer records, contracts, calls, web activity, and dependents. Use this for analytical questions, aggregations, counts, filtering, and any question about customer data that requires SQL.'
    )
  )
  TOOL_RESOURCES = (
    document_search = (SEARCH_SERVICE => 'ANDE_DB.PUBLIC.DOCUMENT_SEARCH_SERVICE'),
    query_customer_data = (
      SEMANTIC_VIEW => 'ANDE_DB.PUBLIC.SV_CUSTOMER_360',
      EXECUTION_ENVIRONMENT => (TYPE => 'warehouse', WAREHOUSE => 'ANDE_IWH')
    )
  )
  INSTRUCTIONS = (
    ORCHESTRATION => 'You are Agent, an intelligent assistant for AND.e Insurance. You help users search and analyze customer data, insurance policies, claims, contracts, and call records. When answering questions about documents or policies, use the document_search tool. For questions about customer data, contracts, calls, web activity, or any analytical/aggregate queries, use the query_customer_data tool which queries structured data. Always provide clear, specific answers with relevant details from the data.',
    RESPONSE => 'Format your responses clearly. When showing data, use tables where appropriate. When referencing documents or policies, include the policy/contract ID and key details. Be concise but thorough.'
  )
  SAMPLE_QUESTIONS = (
    'What claims are currently pending for Colm Moynihan?',
    'Show me all motor claims over EUR 10,000',
    'What is the total value of approved claims in Ireland?',
    'What is the excess on the Lexus RX policy?',
    'How many customers do we have in the United States?'
  );
