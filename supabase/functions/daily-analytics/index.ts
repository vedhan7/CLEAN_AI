Deno.serve(async () => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const today = new Date().toISOString().split("T")[0];

    // Fetch today's complaints
    const res = await fetch(
        `${supabaseUrl}/rest/v1/complaints?created_at=gte.${today}T00:00:00Z`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const complaints = await res.json();

    // Aggregate stats
    const stats = {
        report_date: today,
        total_complaints: complaints.length,
        resolved_complaints: complaints.filter(c => c.status === "resolved").length,
        avg_resolution_hours: 0,
        by_type: {},
        by_ward: {},
        by_priority: {},
    };

    let totalMs = 0;
    let resolvedCount = 0;
    for (const c of complaints) {
        stats.by_type[c.type] = (stats.by_type[c.type] || 0) + 1;
        stats.by_ward[c.ward_id] = (stats.by_ward[c.ward_id] || 0) + 1;
        stats.by_priority[c.priority] = (stats.by_priority[c.priority] || 0) + 1;
        if (c.resolved_at) {
            totalMs += new Date(c.resolved_at) - new Date(c.created_at);
            resolvedCount++;
        }
    }
    stats.avg_resolution_hours = resolvedCount > 0
        ? +(totalMs / resolvedCount / 3600000).toFixed(1)
        : 0;

    // Upsert into analytics_daily
    await fetch(`${supabaseUrl}/rest/v1/analytics_daily`, {
        method: "POST",
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(stats),
    });

    return new Response(JSON.stringify({ ok: true }));
});
