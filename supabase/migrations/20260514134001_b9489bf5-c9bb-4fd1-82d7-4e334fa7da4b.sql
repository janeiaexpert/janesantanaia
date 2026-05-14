DROP POLICY IF EXISTS "Anyone can create appointment" ON public.appointments;

CREATE POLICY "Anyone can create appointment"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

GRANT INSERT ON public.appointments TO anon, authenticated;