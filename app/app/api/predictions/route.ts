import { querySnowflake } from "@/lib/snowflake"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [monthlyHistory, seasonalPattern, policyYearRisk, claimTypes] = await Promise.all([
      // Monthly claims time series (actual history)
      querySnowflake(`
        SELECT TO_CHAR(CLAIM_DATE, 'YYYY-MM') AS MONTH,
               COUNT(*) AS CLAIMS,
               SUM(CLAIM_AMOUNT) AS TOTAL_AMOUNT
        FROM ANDE_DB.PUBLIC.CUSTOMER_CLAIMS
        GROUP BY TO_CHAR(CLAIM_DATE, 'YYYY-MM')
        ORDER BY MONTH
      `),
      // Seasonal pattern by calendar month (averaged across years)
      querySnowflake(`
        SELECT MONTH(CLAIM_DATE) AS MONTH_NUM,
               MONTHNAME(CLAIM_DATE) AS MONTH_NAME,
               COUNT(*) AS CLAIMS,
               SUM(CLAIM_AMOUNT) AS TOTAL_AMOUNT
        FROM ANDE_DB.PUBLIC.CUSTOMER_CLAIMS
        GROUP BY MONTH(CLAIM_DATE), MONTHNAME(CLAIM_DATE)
        ORDER BY MONTH_NUM
      `),
      // Claims by policy year (years since contract start)
      querySnowflake(`
        SELECT DATEDIFF('year', c.CONTRACT_DATE, cl.CLAIM_DATE) + 1 AS POLICY_YEAR,
               COUNT(*) AS CLAIMS,
               AVG(cl.CLAIM_AMOUNT) AS AVG_AMOUNT,
               SUM(cl.CLAIM_AMOUNT) AS TOTAL_AMOUNT
        FROM ANDE_DB.PUBLIC.CUSTOMER_CLAIMS cl
        JOIN ANDE_DB.PUBLIC.CUSTOMER_CONTRACTS c
          ON cl.MASTER_CUSTOMER_ID = c.MASTER_CUSTOMER_ID
        WHERE DATEDIFF('year', c.CONTRACT_DATE, cl.CLAIM_DATE) >= 0
        GROUP BY POLICY_YEAR
        ORDER BY POLICY_YEAR
      `),
      // Claims by type for context
      querySnowflake(`
        SELECT CLAIM_TYPE, COUNT(*) AS CLAIMS, SUM(CLAIM_AMOUNT) AS TOTAL_AMOUNT
        FROM ANDE_DB.PUBLIC.CUSTOMER_CLAIMS
        GROUP BY CLAIM_TYPE
        ORDER BY CLAIMS DESC
      `),
    ])

    // Compute seasonal indices (ratio of each month's claims to average)
    const totalClaims = (seasonalPattern || []).reduce((s: number, r: any) => s + (r.CLAIMS || 0), 0)
    const avgMonthly = totalClaims / 12
    const seasonalIndices = (seasonalPattern || []).map((r: any) => ({
      monthNum: r.MONTH_NUM,
      monthName: r.MONTH_NAME,
      claims: r.CLAIMS,
      totalAmount: r.TOTAL_AMOUNT,
      seasonalIndex: avgMonthly > 0 ? r.CLAIMS / avgMonthly : 1,
    }))

    // Compute forecast for next 12 months
    const history = monthlyHistory || []
    const recentMonths = history.slice(-3)
    const baseline = recentMonths.length > 0
      ? recentMonths.reduce((s: number, r: any) => s + (r.CLAIMS || 0), 0) / recentMonths.length
      : avgMonthly

    const lastMonth = history.length > 0 ? history[history.length - 1].MONTH : "2026-05"
    const [lastYear, lastMon] = lastMonth.split("-").map(Number)

    const forecast = []
    for (let i = 1; i <= 12; i++) {
      const m = ((lastMon - 1 + i) % 12) + 1
      const y = lastYear + Math.floor((lastMon - 1 + i) / 12)
      const idx = seasonalIndices.find((s: any) => s.monthNum === m)
      const seasonalFactor = idx ? idx.seasonalIndex : 1
      const predicted = Math.round(baseline * seasonalFactor * 10) / 10
      forecast.push({
        month: `${y}-${String(m).padStart(2, "0")}`,
        monthName: idx?.monthName || "",
        predicted,
        seasonalFactor: Math.round(seasonalFactor * 100) / 100,
      })
    }

    // Staffing recommendations (1 agent handles ~15 claims/day → ~330/month)
    const CLAIMS_PER_AGENT_PER_MONTH = 330
    const staffing = forecast.map((f: any) => ({
      ...f,
      recommendedAgents: Math.max(1, Math.ceil(f.predicted / CLAIMS_PER_AGENT_PER_MONTH * 100)),
    }))

    // Summary KPIs
    const peakMonth = seasonalIndices.reduce((max: any, s: any) => s.claims > (max?.claims || 0) ? s : max, seasonalIndices[0])
    const totalHistoricalClaims = totalClaims
    const avgClaimsPerMonth = Math.round(avgMonthly * 10) / 10
    const peakForecast = forecast.reduce((max: any, f: any) => f.predicted > (max?.predicted || 0) ? f : max, forecast[0])

    return Response.json({
      monthlyHistory: history,
      seasonalIndices,
      policyYearRisk: policyYearRisk || [],
      claimTypes: claimTypes || [],
      forecast,
      staffing,
      kpis: {
        peakMonth: peakMonth?.monthName || "N/A",
        peakMonthClaims: peakMonth?.claims || 0,
        avgClaimsPerMonth,
        totalHistoricalClaims,
        peakForecastMonth: peakForecast?.monthName || "N/A",
        peakForecastClaims: peakForecast?.predicted || 0,
        highestRiskPolicyYear: (policyYearRisk || []).reduce((max: any, r: any) => (r.CLAIMS > (max?.CLAIMS || 0) ? r : max), policyYearRisk?.[0])?.POLICY_YEAR || "N/A",
      },
    })
  } catch (e) {
    console.error("[predictions]", e)
    return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 })
  }
}
