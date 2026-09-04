import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteColors } from "@/hooks/useSiteColors";
import { z } from "zod";

type AppointmentStatus = "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed";

interface MyAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  client_name: string;
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  rescheduled: "Remarcado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const STATUS_VARIANT: Record<AppointmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  rescheduled: "outline",
  cancelled: "destructive",
  completed: "outline",
};

interface BusinessSettings {
  slot_duration_minutes: number;
  opening_time: string;
  closing_time: string;
  working_days: number[];
  whatsapp_number: string | null;
}


const schema = z.object({
  client_name: z.string().trim().min(2, "Nome muito curto").max(100),
  client_phone: z.string().trim().min(8, "Telefone inválido").max(20),
  client_email: z.string().trim().email("Email inválido").max(150),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};
const fromMinutes = (m: number) => {
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${h}:${mm}`;
};

const formatDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Agenda = () => {
  const navigate = useNavigate();
  useSiteColors();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateLocal(new Date()));
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    notes: "",
  });

  const [myAppointments, setMyAppointments] = useState<MyAppointment[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [trackedEmail, setTrackedEmail] = useState<string>("");

  const loadMyAppointments = async (email: string) => {
    if (!email || !email.includes("@")) return;
    setLookupLoading(true);
    const { data } = await supabase.rpc("get_my_appointments", { p_email: email });
    if (data) setMyAppointments(data as MyAppointment[]);
    setLookupLoading(false);
  };

  // Auto-refresh "Meus agendamentos" via realtime + polling fallback
  useEffect(() => {
    if (!trackedEmail) return;
    const channel = supabase
      .channel(`my-appts-${trackedEmail}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadMyAppointments(trackedEmail),
      )
      .subscribe();
    const interval = setInterval(() => loadMyAppointments(trackedEmail), 15000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [trackedEmail]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("business_settings").select("*").maybeSingle();
      if (data) setSettings(data as BusinessSettings);
      setLoading(false);
    })();
  }, []);

  const loadTakenSlots = async (date: string) => {
    const { data } = await supabase.rpc("get_taken_slots", { p_date: date });
    if (data) setTakenSlots((data as { appointment_time: string }[]).map(r => r.appointment_time.slice(0, 5)));
    else setTakenSlots([]);
  };

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime("");
    loadTakenSlots(selectedDate);
    const channel = supabase
      .channel(`slots-${selectedDate}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadTakenSlots(selectedDate),
      )
      .subscribe();
    const interval = setInterval(() => loadTakenSlots(selectedDate), 20000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [selectedDate]);

  const slots = useMemo(() => {
    if (!settings) return [];
    const open = toMinutes(settings.opening_time.slice(0, 5));
    const close = toMinutes(settings.closing_time.slice(0, 5));
    const dur = settings.slot_duration_minutes > 0 ? settings.slot_duration_minutes : 60;
    const out: string[] = [];
    for (let t = open; t + dur <= close; t += dur) out.push(fromMinutes(t));
    return out;
  }, [settings]);

  const isToday = selectedDate === formatDateLocal(new Date());

  // A slot is unavailable when it overlaps any existing appointment interval,
  // or when it is already in the past (for today).
  const unavailable = useMemo(() => {
    const dur = settings?.slot_duration_minutes && settings.slot_duration_minutes > 0 ? settings.slot_duration_minutes : 60;
    const takenRanges = takenSlots.map(t => {
      const start = toMinutes(t);
      return [start, start + dur] as [number, number];
    });
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const set = new Set<string>();
    for (const s of slots) {
      const start = toMinutes(s);
      const end = start + dur;
      const overlaps = takenRanges.some(([ts, te]) => start < te && ts < end);
      const past = isToday && start <= nowMinutes;
      if (overlaps || past) set.add(s);
    }
    return set;
  }, [slots, takenSlots, settings, isToday]);

  const isWorkingDay = useMemo(() => {
    if (!settings || !selectedDate) return true;
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return settings.working_days.includes(dow);
  }, [settings, selectedDate]);

  const hasFreeSlot = slots.some(s => !unavailable.has(s));

  const minDate = formatDateLocal(new Date());


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      toast({ title: "Escolha um horário", variant: "destructive" });
      return;
    }
    if (unavailable.has(selectedTime)) {
      toast({ title: "Horário indisponível", description: "Escolha outro horário.", variant: "destructive" });
      setSelectedTime("");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Dados inválidos", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .insert({
          client_name: parsed.data.client_name,
          client_phone: parsed.data.client_phone,
          client_email: parsed.data.client_email,
          notes: parsed.data.notes || null,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
        });

      if (error) {
        // 23505 = unique_violation (horário já ocupado)
        if (error.code === "23505") {
          toast({ title: "Horário indisponível", description: "Esse horário acabou de ser ocupado.", variant: "destructive" });
          setSelectedTime("");
          await loadTakenSlots(selectedDate);
        } else {
          throw error;
        }
        return;
      }

      const waNumber = (settings?.whatsapp_number || "").replace(/\D/g, "");
      if (waNumber) {
        const msg = [
          "*Novo agendamento — Tex IA*",
          `Nome: ${parsed.data.client_name}`,
          `WhatsApp: ${parsed.data.client_phone}`,
          `Email: ${parsed.data.client_email}`,
          `Data: ${selectedDate.split("-").reverse().join("/")}`,
          `Horário: ${selectedTime}`,
          parsed.data.notes ? `Observações: ${parsed.data.notes}` : null,
        ].filter(Boolean).join("\n");
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
      }

      toast({
        title: "Agendamento recebido!",
        description: waNumber
          ? "Envie a mensagem no WhatsApp que abrimos para confirmar mais rápido."
          : "Você receberá uma confirmação em breve.",
      });

      setSelectedTime("");
      await loadTakenSlots(selectedDate);
      setTrackedEmail(parsed.data.client_email);
      await loadMyAppointments(parsed.data.client_email);
      setForm({ ...form, notes: "" });


    } catch (err: any) {
      toast({ title: "Erro ao agendar", description: err?.message ?? "Tente novamente", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Agendar Consulta</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarCheck className="w-5 h-5" /> Escolha data e horário
            </CardTitle>
            {settings && (
              <p className="text-sm text-muted-foreground">
                Funcionamento: {settings.opening_time.slice(0, 5)} às {settings.closing_time.slice(0, 5)} • Consultas de {settings.slot_duration_minutes} min
              </p>
            )}
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 space-y-4">
            <div className="space-y-1">
              <Label>Data</Label>
              <Input
                type="date"
                value={selectedDate}
                min={minDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {!isWorkingDay ? (
              <p className="text-sm text-destructive">Não atendemos neste dia. Escolha outra data.</p>
            ) : (
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Horários disponíveis</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {slots.map((s) => {
                    const taken = unavailable.has(s);
                    const isSelected = selectedTime === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={taken}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTime(s)}
                        className={`px-2 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                          taken
                            ? "bg-muted text-muted-foreground line-through cursor-not-allowed opacity-60"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-border"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                  {slots.length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground">Nenhum horário configurado.</p>
                  )}
                </div>
                {slots.length > 0 && !hasFreeSlot && (
                  <p className="text-sm text-destructive">Todos os horários deste dia estão ocupados. Escolha outra data.</p>
                )}
                <p className="text-xs text-muted-foreground">Horários riscados já estão ocupados ou já passaram.</p>
              </div>

            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seus dados</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label>Nome completo *</Label>
                <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp / Telefone *</Label>
                <Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} required maxLength={20} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  required
                  maxLength={150}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Observações (opcional)</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} maxLength={500} />
              </div>

              <Button type="submit" className="w-full" disabled={submitting || !selectedTime || !isWorkingDay}>
                <CalendarCheck className="w-4 h-4 mr-2" />
                {submitting ? "Enviando..." : "Solicitar agendamento"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Após enviar, seu agendamento será confirmado em breve.
              </p>
            </form>
          </CardContent>
        </Card>

        {(myAppointments.length > 0 || lookupLoading) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meus agendamentos</CardTitle>
              <p className="text-sm text-muted-foreground">Status atualizado das suas consultas.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {lookupLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
              {myAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <p className="font-medium">
                      {a.appointment_date.split("-").reverse().join("/")} • {a.appointment_time.slice(0, 5)}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.client_name}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Voltar ao site</Link>
        </div>
      </div>
    </main>
  );
};

export default Agenda;
