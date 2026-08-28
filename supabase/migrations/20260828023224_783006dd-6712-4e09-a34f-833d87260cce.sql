ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_appointment_date_appointment_time_key;

CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot_unique
  ON public.appointments (appointment_date, appointment_time)
  WHERE status <> 'cancelled';

ALTER TABLE public.appointments REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
END $$;