-- Create links table for bio links
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Public read access (bio links are public)
CREATE POLICY "Links are viewable by everyone" 
ON public.links 
FOR SELECT 
USING (true);

-- Only authenticated users can manage links
CREATE POLICY "Authenticated users can insert links" 
ON public.links 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update links" 
ON public.links 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete links" 
ON public.links 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Insert default links
INSERT INTO public.links (title, url, icon, position) VALUES
  ('Instagram', 'https://instagram.com', 'instagram', 1),
  ('WhatsApp', 'https://wa.me/5511999999999', 'message-circle', 2),
  ('E-book Gratuito', '#', 'book-open', 3),
  ('Loja', '#', 'shopping-bag', 4),
  ('Contato', 'mailto:contato@guiafacil.com', 'mail', 5);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_links_updated_at
BEFORE UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();