import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

const FRAUD_SURNAMES = [
  "Boswell", "Loveridge", "Cooper", "Hearn", "Young",
  "Ward", "Connors", "McDonagh", "Joyce", "Fury", "Gorman",
]

export async function GET() {
  try {
    const surnameConds = FRAUD_SURNAMES.map(
      (s) => `UPPER(c.CUSTOMER_NAME) LIKE '%${s.toUpperCase()}%'`
    ).join(" OR ")

    const sql = `
      SELECT c.CLAIM_ID, c.MASTER_CUSTOMER_ID, c.CUSTOMER_NAME, c.CLAIM_TYPE, c.CLAIM_DATE,
             c.CLAIM_AMOUNT, c.STATUS, c.DESCRIPTION, c.RESOLUTION_DATE, c.COUNTRY,
             g.EMAIL AS CUSTOMER_EMAIL
      FROM ANDE_DB.PUBLIC.CUSTOMER_CLAIMS c
      LEFT JOIN ANDE_DB.PUBLIC.CUSTOMER_MASTER_GOLDEN_TABLE g
        ON c.MASTER_CUSTOMER_ID = g.MASTER_CUSTOMER_ID
      WHERE (${surnameConds})
         OR UPPER(c.CUSTOMER_NAME) LIKE '%JOHN JO%'
      ORDER BY c.CLAIM_DATE DESC
      LIMIT 200
    `

    const rows = await querySnowflake(sql)
    return Response.json(rows)
  } catch (e) {
    console.error(new Date().toISOString(), "[fraud]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to fetch fraud claims" },
      { status: 500 }
    )
  }
}
