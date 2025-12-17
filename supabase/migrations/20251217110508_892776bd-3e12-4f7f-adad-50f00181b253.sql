-- Aggiungi colonna ingredienti alla tabella products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredients jsonb DEFAULT '[]'::jsonb;

-- Commento per spiegare la struttura
COMMENT ON COLUMN public.products.ingredients IS 'Array di ingredienti con struttura: [{barcode, name, lot, expiry_date, quantity, scanned_at}]';