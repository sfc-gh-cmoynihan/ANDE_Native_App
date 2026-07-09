import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

const FCA_PHRASE = "%Toyota Insurance Services%Financial Conduct Authority%983839%"

export async function GET() {
  try {
    const sql = `
      SELECT AGENT_NAME,
             COUNT(*) AS TOTAL_CALLS,
             SUM(CASE WHEN TRANSCRIPTION ILIKE '${FCA_PHRASE}' THEN 1 ELSE 0 END) AS COMPLIANT_CALLS,
             ROUND(SUM(CASE WHEN TRANSCRIPTION ILIKE '${FCA_PHRASE}' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS COMPLIANCE_PCT
      FROM CUSTOMER_360.PUBLIC.CUSTOMER_CALLS
      GROUP BY AGENT_NAME
      ORDER BY COMPLIANCE_PCT DESC
    `

    const detailSql = `
      SELECT CALL_ID, AGENT_NAME, CALL_DATE, DURATION_SECONDS, CALL_TYPE, SENTIMENT,
             CASE WHEN TRANSCRIPTION ILIKE '${FCA_PHRASE}' THEN TRUE ELSE FALSE END AS FCA_COMPLIANT
      FROM CUSTOMER_360.PUBLIC.CUSTOMER_CALLS
      ORDER BY CALL_DATE DESC
    `

    const [summary, detail] = await Promise.all([
      querySnowflake(sql),
      querySnowflake(detailSql),
    ])

    return Response.json({ summary, detail })
  } catch (e) {
    console.error(new Date().toISOString(), "[greenflag]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to fetch compliance data" },
      { status: 500 }
    )
  }
}
