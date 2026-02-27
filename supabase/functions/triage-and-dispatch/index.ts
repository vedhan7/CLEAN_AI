import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.0"

// Environment Variables required in Supabase Edge Functions Dashboard
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY")

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { record } = await req.json()
        // Triggered automatically on INSERT to the 'complaints' table

        // 1. Ask Gemini to evaluate the complaint severity
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
        const prompt = `
      Evaluate the complaint severity:
      Type: ${record.issue_type}
      Description: ${record.description}
      Reply exactly with one lowercase word: critical, high, medium, or low.
    `
        const result = await model.generateContent(prompt)
        let priority = result.response.text().trim().toLowerCase()

        if (!['critical', 'high', 'medium', 'low'].includes(priority)) {
            priority = 'medium'
        }

        // 2. Initialize admin DB client to update the record
        const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Find nearest available LCV worker in the same ward (Simple Logic Stub)
        const { data: worker } = await adminClient
            .from('workers')
            .select('*')
            .eq('ward_id', record.ward_id)
            .eq('is_available', true)
            .limit(1)
            .single()

        const assigned_to = worker ? worker.id : null

        // 3. Update the complaint in Database
        const { error } = await adminClient
            .from('complaints')
            .update({ priority, assigned_to, status: assigned_to ? 'assigned' : 'filed' })
            .eq('id', record.id)

        if (error) throw error

        // 4. If assigned, Trigger WhatsApp API logic (calling another function or executing inline)
        if (assigned_to) {
            console.log(`Must notify worker: ${worker.phone} via WhatsApp Meta Cloud API.`);
            // Whatsapp fetch call goes here
            // fetch('https://graph.facebook.com/v17.0/.../messages', { method: 'POST', body: ...})
        }

        return new Response(JSON.stringify({ success: true, new_priority: priority, assigned: !!assigned_to }), {
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
