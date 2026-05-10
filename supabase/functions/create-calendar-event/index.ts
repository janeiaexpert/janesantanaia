import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

const BodySchema = z.object({
  appointment_id: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_CALENDAR_API_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GOOGLE_CALENDAR_API_KEY) throw new Error("GOOGLE_CALENDAR_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: appt, error: aerr } = await admin
      .from("appointments")
      .select("*")
      .eq("id", parsed.data.appointment_id)
      .maybeSingle();
    if (aerr) throw aerr;
    if (!appt) throw new Error("Appointment not found");

    const { data: settings } = await admin
      .from("business_settings")
      .select("slot_duration_minutes")
      .maybeSingle();
    const duration = settings?.slot_duration_minutes ?? 60;

    // Build start/end in São Paulo timezone
    const timeZone = "America/Sao_Paulo";
    const [hh, mm] = (appt.appointment_time as string).slice(0, 5).split(":").map(Number);
    const startISO = `${appt.appointment_date}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
    const endMinutes = hh * 60 + mm + duration;
    const eh = Math.floor(endMinutes / 60);
    const em = endMinutes % 60;
    const endISO = `${appt.appointment_date}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00`;

    const event = {
      summary: `Consulta — ${appt.client_name}`,
      description: [
        `Cliente: ${appt.client_name}`,
        `Telefone: ${appt.client_phone}`,
        appt.client_email ? `Email: ${appt.client_email}` : null,
        appt.notes ? `Observações: ${appt.notes}` : null,
      ].filter(Boolean).join("\n"),
      start: { dateTime: startISO, timeZone },
      end: { dateTime: endISO, timeZone },
      reminders: { useDefault: true },
    };

    const resp = await fetch(`${GATEWAY_URL}/calendars/primary/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_CALENDAR_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(`Google Calendar [${resp.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(
      JSON.stringify({ success: true, event_id: data.id, html_link: data.htmlLink }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("create-calendar-event error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
