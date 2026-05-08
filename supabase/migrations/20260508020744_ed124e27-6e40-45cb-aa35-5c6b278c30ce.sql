
-- Business settings (single row)
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT NOT NULL DEFAULT '',
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  opening_time TIME NOT NULL DEFAULT '08:00',
  closing_time TIME NOT NULL DEFAULT '17:00',
  working_days INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business settings viewable by everyone"
  ON public.business_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert business settings"
  ON public.business_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update business settings"
  ON public.business_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.business_settings (whatsapp_number) VALUES ('');

-- Appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','rescheduled','cancelled','completed');

-- Appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_date, appointment_time)
);

CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create appointment"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view appointments"
  ON public.appointments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update appointments"
  ON public.appointments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public function: returns only taken time slots for a date (no PII)
CREATE OR REPLACE FUNCTION public.get_taken_slots(p_date DATE)
RETURNS TABLE(appointment_time TIME)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT appointment_time
  FROM public.appointments
  WHERE appointment_date = p_date
    AND status NOT IN ('cancelled');
$$;

GRANT EXECUTE ON FUNCTION public.get_taken_slots(DATE) TO anon, authenticated;
