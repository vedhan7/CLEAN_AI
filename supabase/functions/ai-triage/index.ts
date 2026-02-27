// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Webhook received payload:", JSON.stringify(payload, null, 2));

    const record = payload.record;
    if (!record || !record.id) {
      throw new Error("No record found in payload");
    }

    if (record.priority !== 'pending') {
      console.log("Already triaged. Skipping.");
      return new Response(JSON.stringify({ status: "skipped" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) throw new Error("GEMINI_API_KEY is not set.");

    // Prompt construction
    let prompt = `Analyze this civic complaint. Issue Type: ${record.issue_type}. Description: ${record.description || "None"}. \n`;
    prompt += `Based on the issue type, description, and the provided photo, analyze the severity of the civic issue. \n`;
    prompt += `Return a strict JSON object with a single field "priority" which must be exactly one of: "critical", "high", "medium", "low". \n`;
    prompt += `CRITICAL: Major health hazards, massive trash dumps, completely blocked roads. HIGH: Overflowing bins, dead animals. MEDIUM: Standard missed collection. LOW: Minor litter.\n`;
    prompt += `Output nothing but valid JSON. Example: {"priority": "high"}`;

    const parts: any[] = [{ text: prompt }];

    // If an image URL exists, fetch it and convert to base64 to send to Gemini
    if (record.image_url) {
      console.log("Fetching image from URL:", record.image_url);
      const imgRes = await fetch(record.image_url);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64String
          }
        });
      } else {
        console.log("Failed to fetch image, proceeding with text only.");
      }
    }

    console.log("Calling Gemini API...");
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiRes.ok) {
      const errTxt = await geminiRes.text();
      throw new Error(`Gemini API Error: ${errTxt}`);
    }

    const aiData = await geminiRes.json();
    console.log("Gemini Response:", JSON.stringify(aiData));

    let detectedPriority = "medium"; // default fallback
    try {
      const textResp = aiData.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResp);
      if (["critical", "high", "medium", "low"].includes(parsed.priority)) {
        detectedPriority = parsed.priority;
      }
    } catch (parseErr) {
      console.error("Could not parse Gemini JSON response:", parseErr);
    }

    console.log(`Assigned priority: ${detectedPriority} to complaint ID: ${record.id}`);

    // Update the database record using the service role key to bypass RLS
    const supabaseUrl = Deno.env.get("DB_URL") || "";
    const supabaseKey = Deno.env.get("DB_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabaseAdmin
      .from('complaints')
      .update({ priority: detectedPriority })
      .eq('id', record.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ status: "success", priority: detectedPriority }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
