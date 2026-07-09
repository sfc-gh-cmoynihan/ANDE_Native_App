import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [claimsSample, mechanics, claimStats] = await Promise.all([
      querySnowflake(`
        SELECT CLAIM_ID, CUSTOMER_NAME, CLAIM_DATE, CLAIM_AMOUNT, CLAIM_TYPE, 
               VEHICLE_MODEL, CITY, STATUS,
               ST_X(LOCATION) AS LNG, ST_Y(LOCATION) AS LAT
        FROM CUSTOMER_360.PUBLIC.UK_CLAIMS_GEO
        SAMPLE (5000 ROWS)
      `),
      querySnowflake(`
        SELECT MECHANIC_ID, GARAGE_NAME, ADDRESS, CITY, POSTCODE, PHONE, 
               RATING, SPECIALIZATION,
               ST_X(LOCATION) AS LNG, ST_Y(LOCATION) AS LAT
        FROM CUSTOMER_360.PUBLIC.TOYOTA_APPROVED_MECHANICS
      `),
      querySnowflake(`
        SELECT COUNT(*) AS TOTAL_CLAIMS, 
               SUM(CLAIM_AMOUNT) AS TOTAL_AMOUNT,
               COUNT(DISTINCT CITY) AS CITIES_AFFECTED
        FROM CUSTOMER_360.PUBLIC.UK_CLAIMS_GEO
      `),
    ])

    return Response.json({
      claims: claimsSample || [],
      mechanics: mechanics || [],
      stats: claimStats?.[0] || {},
    })
  } catch (e) {
    console.error("[geospatial]", e)
    return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 })
  }
}
