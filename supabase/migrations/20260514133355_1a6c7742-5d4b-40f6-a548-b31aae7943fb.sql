CREATE OR REPLACE FUNCTION public.get_my_appointments(p_email text)
RETURNS TABLE(id uuid, appointment_date date, appointment_time time, status appointment_status, client_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, appointment_date, appointment_time, status, client_name
  FROM public.appointments
  WHERE lower(client_email) = lower(p_email)
  ORDER BY appointment_date DESC, appointment_time DESC
  LIMIT 20;
$$;