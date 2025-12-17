import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ProductInfo {
  barcode: string;
  name: string;
  ingredients?: string;
  allergens?: string[];
  brand?: string;
  imageUrl?: string;
}

export function useProductLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const lookupProduct = async (barcode: string): Promise<ProductInfo | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );
      
      if (!response.ok) {
        throw new Error('Prodotto non trovato');
      }

      const data = await response.json();
      
      if (data.status !== 1 || !data.product) {
        toast({
          title: 'Prodotto non trovato',
          description: 'Il codice a barre non è presente nel database. Inserisci i dati manualmente.',
          variant: 'destructive',
        });
        return { barcode, name: '' };
      }

      const product = data.product;
      
      return {
        barcode,
        name: product.product_name_it || product.product_name || '',
        ingredients: product.ingredients_text_it || product.ingredients_text || '',
        allergens: product.allergens_tags?.map((a: string) => 
          a.replace('en:', '').replace('it:', '')
        ) || [],
        brand: product.brands || '',
        imageUrl: product.image_url || '',
      };
    } catch (error) {
      console.error('Product lookup error:', error);
      toast({
        title: 'Errore ricerca',
        description: 'Impossibile cercare il prodotto. Inserisci i dati manualmente.',
        variant: 'destructive',
      });
      return { barcode, name: '' };
    } finally {
      setIsLoading(false);
    }
  };

  return { lookupProduct, isLoading };
}
