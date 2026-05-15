GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON TABLE public.appointments TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can create appointment" ON public.appointments;

CREATE POLICY "Anyone can create appointment"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);