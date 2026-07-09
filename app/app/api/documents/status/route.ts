import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

const VALID_STATUSES = ["Submitted", "Open", "Rejected", "Accepted", "Paid"]

export async function POST(request: Request) {
  try {
    const { claimId, status } = await request.json()

    if (!claimId || !status) {
      return Response.json({ error: "claimId and status are required" }, { status: 400 })
    }
    if (!VALID_STATUSES.includes(status)) {
      return Response.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 })
    }

    const safeClaimId = claimId.replace(/'/g, "''")
    const sql = `UPDATE ANDE_DB.PUBLIC.CUSTOMER_CLAIMS SET STATUS = '${status}' WHERE CLAIM_ID = '${safeClaimId}'`
    await querySnowflake(sql)

    return Response.json({ success: true, claimId, status })
  } catch (e) {
    console.error(new Date().toISOString(), "[claims-status-update]", e)
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to update status" },
      { status: 500 }
    )
  }
}
