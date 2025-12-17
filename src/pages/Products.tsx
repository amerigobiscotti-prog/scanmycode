import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Package, Calendar, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { ProductForm } from '@/components/ProductForm';
import { useProducts, useCreateProduct, ProductInput } from '@/hooks/useProducts';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  const { data: products, isLoading } = useProducts(search);
  const createProduct = useCreateProduct();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowNewDialog(true);
      searchParams.delete('new');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const initialBarcode = searchParams.get('barcode') || undefined;
  const initialLot = searchParams.get('lot') || undefined;
  const initialExpiryDate = searchParams.get('expiry_date') || undefined;

  const handleCreate = (data: ProductInput) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        setShowNewDialog(false);
        searchParams.delete('barcode');
        searchParams.delete('lot');
        searchParams.delete('expiry_date');
        setSearchParams(searchParams);
      },
    });
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const days = differenceInDays(new Date(expiryDate), new Date());
    
    if (days < 0) {
      return { label: 'Scaduto', variant: 'destructive' as const, days };
    }
    if (days <= 3) {
      return { label: `${days}g`, variant: 'destructive' as const, days };
    }
    if (days <= 7) {
      return { label: `${days}g`, variant: 'warning' as const, days };
    }
    return { label: `${days}g`, variant: 'default' as const, days };
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Prodotti</h1>
          <Button onClick={() => setShowNewDialog(true)} className="gradient-primary">
            <Plus className="h-5 w-5 mr-1" />
            Nuovo
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, lotto o codice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-24 bg-muted" />
              </Card>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'Nessun prodotto trovato' : 'Nessun prodotto registrato'}
              </p>
              {!search && (
                <Button 
                  onClick={() => setShowNewDialog(true)} 
                  className="mt-4 gradient-primary"
                >
                  Aggiungi il primo prodotto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {products?.map((product) => {
              const expiryStatus = getExpiryStatus(product.expiry_date);
              
              return (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Lotto: {product.lot}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(product.arrival_date), 'd MMM yyyy', { locale: it })}</span>
                            <span className="text-foreground font-medium">
                              {product.quantity} {product.unit}
                            </span>
                          </div>
                          {product.suppliers && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {product.suppliers.name}
                            </p>
                          )}
                        </div>
                        {expiryStatus && (
                          <Badge 
                            variant={expiryStatus.variant === 'warning' ? 'outline' : expiryStatus.variant}
                            className={expiryStatus.variant === 'warning' ? 'bg-warning text-warning-foreground border-0' : ''}
                          >
                            {expiryStatus.days < 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {expiryStatus.label}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Prodotto</DialogTitle>
            </DialogHeader>
            <ProductForm 
              defaultValues={{ 
                barcode: initialBarcode,
                lot: initialLot,
                expiry_date: initialExpiryDate,
              }}
              onSubmit={handleCreate}
              isLoading={createProduct.isPending}
              submitLabel="Aggiungi Prodotto"
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
