DROP POLICY IF EXISTS "Anyone can create appointment" ON public.appointments;

CREATE POLICY "Anyone can create appointment"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(client_name)) >= 2
  AND length(trim(client_phone)) >= 8
  AND client_email IS NOT NULL
  AND client_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND appointment_date >= CURRENT_DATE
  AND appointment_time IS NOT NULL
  AND status = 'pending'::appointment_status
);