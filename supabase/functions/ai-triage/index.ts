import { GoogleGenerativeAI } from "@google/generative-ai";

Deno.serve(async (req) => {
    const { complaint_id, type, description } = await req.json();

    // Step 1: Call Gemini for priority classification
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
    You are an AI civic triage assistant for Madurai City Corporation.
    Evaluate this waste/sanitation complaint and assign ONE priority.

    Issue Type: ${type}
    Description: ${description || "No description"}

    Rules:
    - "critical": immediate health/safety risk (dead animal, sewage overflow)
    - "high": heavily impacts public spaces (overflowing bin in market)
    - "medium": standard issues (missed collection, dirty toilet)
    - "low": minor, non-urgent

    Respond with ONLY ONE word: critical, high, medium, or low.
  `;

    const result = await model.generateContent(prompt);
    let priority = result.response.text().trim().toLowerCase();
    if (!["critical", "high", "medium", "low"].includes(priority)) {
        priority = "medium";
    }

    // Step 2: Update the complaint with AI priority
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    await fetch(`${supabaseUrl}/rest/v1/complaints?id=eq.${complaint_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ priority, updated_at: new Date().toISOString() }),
    });

    // Step 3: Create timeline entry
    await fetch(`${supabaseUrl}/rest/v1/complaint_timeline`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
            complaint_id,
            status: "pending",
            message: `Complaint filed. AI Priority: ${priority.toUpperCase()}`,
            actor_id: null,
        }),
    });

    return new Response(JSON.stringify({ priority }), {
        headers: { "Content-Type": "application/json" },
    });
});
