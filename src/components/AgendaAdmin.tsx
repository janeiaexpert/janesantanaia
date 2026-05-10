import { useEffect, useState } from "react";
import { Calendar, Save, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BusinessSettings {
  id: string;
  slot_duration_minutes: number;
  opening_time: string;
  closing_time: string;
  working_days: number[];
}

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  notes: string | null;
}

const STATUS_LABEL: Record<Appointment["status"], string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  rescheduled: "Remarcado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const formatDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const AgendaAdmin = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(formatDateLocal(new Date()));

  // reschedule modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: a }] = await Promise.all([
      supabase.from("business_settings").select("*").maybeSingle(),
      supabase.from("appointments").select("*").order("appointment_date", { ascending: true }).order("appointment_time", { ascending: true }),
    ]);
    if (s) setSettings(s as BusinessSettings);
    if (a) setAppointments(a as Appointment[]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_settings")
        .update({
          slot_duration_minutes: settings.slot_duration_minutes,
          opening_time: settings.opening_time,
          closing_time: settings.closing_time,
          working_days: settings.working_days,
        })
        .eq("id", settings.id);
      if (error) throw error;
      toast({ title: "Configurações salvas!" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (d: number) => {
    if (!settings) return;
    const ws = settings.working_days.includes(d)
      ? settings.working_days.filter(x => x !== d)
      : [...settings.working_days, d].sort();
    setSettings({ ...settings, working_days: ws });
  };

  const updateStatus = async (id: string, status: Appointment["status"]) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: "Status atualizado" });
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setAppointments(appointments.filter(a => a.id !== id));
    toast({ title: "Agendamento excluído" });
  };

  const startReschedule = (a: Appointment) => {
    setEditingId(a.id);
    setEditDate(a.appointment_date);
    setEditTime(a.appointment_time.slice(0, 5));
  };

  const saveReschedule = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("appointments")
      .update({ appointment_date: editDate, appointment_time: editTime, status: "rescheduled" })
      .eq("id", editingId);
    if (error) {
      toast({ title: "Erro ao remarcar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Consulta remarcada!" });
    setEditingId(null);
    loadAll();
  };

  const sendWhatsApp = (a: Appointment, action: "confirm" | "remind" | "reschedule") => {
    const phone = a.client_phone.replace(/\D/g, "");
    const [y, m, d] = a.appointment_date.split("-");
    const time = a.appointment_time.slice(0, 5);
    const date = `${d}/${m}/${y}`;
    let text = "";
    if (action === "confirm") text = `Olá ${a.client_name}! Confirmamos sua consulta para ${date} às ${time}. Até lá!`;
    else if (action === "remind") text = `Olá ${a.client_name}! Lembrete da sua consulta amanhã, ${date} às ${time}.`;
    else text = `Olá ${a.client_name}! Precisamos remarcar sua consulta de ${date} às ${time}. Qual horário fica melhor para você?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filtered = filterDate
    ? appointments.filter(a => a.appointment_date === filterDate)
    : appointments;

  if (loading) return <p className="text-center text-muted-foreground py-8">Carregando...</p>;

  return (
    <div className="space-y-4">
      {/* Settings */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Configurações da Agenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Número do WhatsApp (com DDI, só números)</Label>
              <Input
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value.replace(/\D/g, "") })}
                placeholder="5511999999999"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Abertura</Label>
                <Input type="time" value={settings.opening_time.slice(0, 5)} onChange={(e) => setSettings({ ...settings, opening_time: e.target.value + ":00" })} />
              </div>
              <div className="space-y-1">
                <Label>Fechamento</Label>
                <Input type="time" value={settings.closing_time.slice(0, 5)} onChange={(e) => setSettings({ ...settings, closing_time: e.target.value + ":00" })} />
              </div>
              <div className="space-y-1">
                <Label>Duração (min)</Label>
                <Input type="number" min={10} max={240} step={5} value={settings.slot_duration_minutes} onChange={(e) => setSettings({ ...settings, slot_duration_minutes: parseInt(e.target.value) || 60 })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dias de funcionamento</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, idx) => {
                  const active = settings.working_days.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-accent"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">Agendamentos ({filtered.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-auto" />
            <Button variant="outline" size="sm" onClick={() => setFilterDate("")}>Todos</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum agendamento.</p>
          ) : (
            filtered.map((a) => (
              <div key={a.id} className="p-4 bg-muted rounded-lg space-y-2">
                {editingId === a.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                      <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveReschedule}>Salvar nova data</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold">{a.client_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {a.client_phone}
                        </p>
                        <p className="text-sm">
                          📅 {a.appointment_date.split("-").reverse().join("/")} • ⏰ {a.appointment_time.slice(0, 5)}
                        </p>
                        {a.notes && <p className="text-xs text-muted-foreground mt-1">📝 {a.notes}</p>}
                      </div>
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.id, e.target.value as Appointment["status"])}
                        className="text-xs border border-border rounded px-2 py-1 bg-background"
                      >
                        {Object.entries(STATUS_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      <Button size="sm" variant="outline" onClick={() => sendWhatsApp(a, "confirm")}>
                        <MessageCircle className="w-3 h-3 mr-1" /> Confirmar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendWhatsApp(a, "remind")}>
                        Lembrete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { sendWhatsApp(a, "reschedule"); startReschedule(a); }}>
                        Remarcar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteAppointment(a.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaAdmin;
