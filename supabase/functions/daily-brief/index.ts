import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0"

// This function is meant to be hit by a pg_cron scheduled job every day at 6:00 AM
// It fetches all unresolved complaints from yesterday and generates an actionable summary for Councillors

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY")

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

serve(async (req) => {
    try {
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Fetch complaints from the last 24 hours that are NOT resolved
        const { data: issues, error } = await adminClient
            .from('complaints')
            .select('ward_id, issue_type, priority, description, created_at')
            .neq('status', 'resolved')
            .order('ward_id', { ascending: true })

        if (error) throw error

        if (!issues || issues.length === 0) {
            return new Response("No pending issues to brief.", { status: 200 })
        }

        // 2. Generate a prompt for Gemini to summarize
        const issuesText = issues.map(i => `Ward ${i.ward_id}: [${i.priority.toUpperCase()}] ${i.issue_type} - ${i.description || 'No desc'}`).join('\n')

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
        const prompt = `
      You are the Chief AI Officer for the Madurai Corporation.
      Analyze the following unresolved complaints from yesterday.
      Provide a clean, bulleted "Daily Action Brief" highlighting:
      1. Wards with the most critical issues.
      2. Patterns in issue types (e.g., are there many overflowing bins?).
      3. Your recommendation for where the Commissioner should deploy extra LCVs today.

      Raw Data:
      ${issuesText}
    `
        const result = await model.generateContent(prompt)
        const actionBrief = result.response.text().trim()

        // 3. (Mock) Send the brief to the Commissioner's WhatsApp or save to a 'daily_briefs' table
        console.log("Daily Brief Generated:\n", actionBrief)

        return new Response(JSON.stringify({ success: true, brief: actionBrief }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})
