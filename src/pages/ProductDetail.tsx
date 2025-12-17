import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Package, User, Barcode, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Layout } from '@/components/Layout';
import { ProductForm } from '@/components/ProductForm';
import { useProduct, useUpdateProduct, useDeleteProduct, ProductInput } from '@/hooks/useProducts';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: product, isLoading, error } = useProduct(id!);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleUpdate = (data: ProductInput) => {
    updateProduct.mutate({ id: id!, ...data }, {
      onSuccess: () => setShowEditDialog(false),
    });
  };

  const handleDelete = () => {
    deleteProduct.mutate(id!, {
      onSuccess: () => navigate('/products'),
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Prodotto non trovato</p>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Torna ai prodotti
          </Button>
        </div>
      </Layout>
    );
  }

  const getExpiryInfo = () => {
    if (!product.expiry_date) return null;
    
    const days = differenceInDays(new Date(product.expiry_date), new Date());
    
    if (days < 0) {
      return { 
        label: `Scaduto da ${Math.abs(days)} giorni`, 
        variant: 'destructive' as const,
        icon: AlertTriangle 
      };
    }
    if (days === 0) {
      return { label: 'Scade oggi', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (days <= 3) {
      return { label: `Scade tra ${days} giorni`, variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (days <= 7) {
      return { label: `Scade tra ${days} giorni`, variant: 'warning' as const, icon: null };
    }
    return { label: `Scade tra ${days} giorni`, variant: 'default' as const, icon: null };
  };

  const expiryInfo = getExpiryInfo();

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground flex-1 truncate">
            {product.name}
          </h1>
        </div>

        {expiryInfo && (
          <Card className={`border-${expiryInfo.variant === 'warning' ? 'warning' : expiryInfo.variant === 'destructive' ? 'destructive' : 'border'}`}>
            <CardContent className="p-4 flex items-center gap-3">
              {expiryInfo.icon && <expiryInfo.icon className={`h-5 w-5 text-${expiryInfo.variant}`} />}
              <Badge 
                variant={expiryInfo.variant === 'warning' ? 'outline' : expiryInfo.variant}
                className={expiryInfo.variant === 'warning' ? 'bg-warning text-warning-foreground border-0' : ''}
              >
                {expiryInfo.label}
              </Badge>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dettagli Prodotto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.barcode && (
              <div className="flex items-start gap-3">
                <Barcode className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Codice a Barre</p>
                  <p className="font-mono">{product.barcode}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Lotto</p>
                <p className="font-medium">{product.lot}</p>
              </div>
            </div>

            {product.suppliers && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fornitore</p>
                  <p className="font-medium">{product.suppliers.name}</p>
                  {product.suppliers.category && (
                    <p className="text-sm text-muted-foreground">{product.suppliers.category}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Data Arrivo</p>
                <p className="font-medium">
                  {format(new Date(product.arrival_date), 'd MMMM yyyy', { locale: it })}
                </p>
              </div>
            </div>

            {product.expiry_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Data Scadenza</p>
                  <p className="font-medium">
                    {format(new Date(product.expiry_date), 'd MMMM yyyy', { locale: it })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Quantità</p>
                <p className="font-medium text-lg">{product.quantity} {product.unit}</p>
              </div>
            </div>

            {product.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Note</p>
                <p className="text-foreground">{product.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            onClick={() => setShowEditDialog(true)} 
            className="flex-1 gradient-primary"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare "{product.name}"? Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Registrato il {format(new Date(product.created_at), 'd MMM yyyy HH:mm', { locale: it })}
        </p>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica Prodotto</DialogTitle>
            </DialogHeader>
            <ProductForm 
              defaultValues={product}
              onSubmit={handleUpdate}
              isLoading={updateProduct.isPending}
              submitLabel="Salva Modifiche"
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
