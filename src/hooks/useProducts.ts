import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface Ingredient {
  barcode: string;
  name?: string;
  lot: string;
  expiry_date: string;
  quantity?: number;
  scanned_at: string;
}

export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  lot: string;
  supplier_id: string | null;
  arrival_date: string;
  expiry_date: string | null;
  quantity: number;
  unit: string;
  notes: string | null;
  ingredients: Ingredient[] | null;
  created_at: string;
  updated_at: string;
  suppliers?: {
    id: string;
    name: string;
    category: string | null;
  } | null;
}

export interface ProductInput {
  barcode?: string;
  name: string;
  lot: string;
  supplier_id?: string;
  arrival_date: string;
  expiry_date?: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredients?: Ingredient[];
}

export function useProducts(search?: string) {
  return useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, suppliers(id, name, category)')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,lot.ilike.%${search}%,barcode.ilike.%${search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data.map(p => ({
        ...p,
        ingredients: (p.ingredients || []) as unknown as Ingredient[],
      })) as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, suppliers(id, name, category)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        ingredients: (data.ingredients || []) as unknown as Ingredient[],
      } as Product;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const dbProduct = {
        ...product,
        ingredients: (product.ingredients || []) as unknown as Json,
      };
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Prodotto aggiunto', description: 'Il prodotto è stato registrato con successo.' });
    },
    onError: (error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: ProductInput & { id: string }) => {
      const dbProduct = {
        ...data,
        ingredients: (data.ingredients || []) as unknown as Json,
      };
      const { error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Prodotto aggiornato', description: 'Le modifiche sono state salvate.' });
    },
    onError: (error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Prodotto eliminato', description: 'Il prodotto è stato rimosso dall\'archivio.' });
    },
    onError: (error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });
}

export function useProductStats() {
  return useQuery({
    queryKey: ['product-stats'],
    queryFn: async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*, suppliers(name)');

      if (allError) throw allError;

      const total = allProducts?.length || 0;
      const thisWeek = allProducts?.filter(p => new Date(p.created_at) >= oneWeekAgo).length || 0;
      const thisMonth = allProducts?.filter(p => new Date(p.created_at) >= oneMonthAgo).length || 0;
      
      const expiringSoon = allProducts?.filter(p => {
        if (!p.expiry_date) return false;
        const expiryDate = new Date(p.expiry_date);
        return expiryDate >= now && expiryDate <= sevenDaysFromNow;
      }) || [];

      const expired = allProducts?.filter(p => {
        if (!p.expiry_date) return false;
        return new Date(p.expiry_date) < now;
      }) || [];

      // Group by supplier
      const bySupplier = allProducts?.reduce((acc, p) => {
        const supplierName = p.suppliers?.name || 'Senza fornitore';
        acc[supplierName] = (acc[supplierName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total,
        thisWeek,
        thisMonth,
        expiringSoon,
        expired,
        bySupplier,
      };
    },
  });
}
