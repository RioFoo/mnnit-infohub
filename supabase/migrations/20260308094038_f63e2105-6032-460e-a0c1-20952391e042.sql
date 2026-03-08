
-- Fix the permissive notifications insert policy
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
