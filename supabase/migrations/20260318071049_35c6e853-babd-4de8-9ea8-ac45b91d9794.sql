
CREATE TABLE public.saved_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled CV',
  template text NOT NULL DEFAULT 'classic',
  cv_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CVs" ON public.saved_cvs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CVs" ON public.saved_cvs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own CVs" ON public.saved_cvs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own CVs" ON public.saved_cvs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_cvs_updated_at BEFORE UPDATE ON public.saved_cvs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
