import { useState } from 'react';
import { Plus, Edit, Trash2, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/Layout';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, Supplier } from '@/hooks/useSuppliers';

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: { name: string; category?: string }) => void;
  isLoading: boolean;
}

function SupplierForm({ supplier, onSubmit, isLoading }: SupplierFormProps) {
  const [name, setName] = useState(supplier?.name || '');
  const [category, setCategory] = useState(supplier?.category || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), category: category.trim() || undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome Fornitore *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Fattoria Rossi"
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Es. Carni Bovine"
        />
      </div>
      <Button type="submit" className="w-full gradient-primary" disabled={isLoading || !name.trim()}>
        {isLoading ? 'Salvataggio...' : supplier ? 'Salva Modifiche' : 'Aggiungi Fornitore'}
      </Button>
    </form>
  );
}

export default function Suppliers() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data: suppliers, isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const handleCreate = (data: { name: string; category?: string }) => {
    createSupplier.mutate(data, {
      onSuccess: () => setShowDialog(false),
    });
  };

  const handleUpdate = (data: { name: string; category?: string }) => {
    if (editingSupplier) {
      updateSupplier.mutate({ id: editingSupplier.id, ...data }, {
        onSuccess: () => {
          setEditingSupplier(null);
          setShowDialog(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteSupplier.mutate(id);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingSupplier(null);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Fornitori</h1>
          <Button onClick={() => setShowDialog(true)} className="gradient-primary">
            <Plus className="h-5 w-5 mr-1" />
            Nuovo
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-20 bg-muted" />
              </Card>
            ))}
          </div>
        ) : suppliers?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun fornitore registrato</p>
              <Button onClick={() => setShowDialog(true)} className="mt-4 gradient-primary">
                Aggiungi il primo fornitore
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {suppliers?.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {supplier.name}
                        </h3>
                        {supplier.category && (
                          <p className="text-sm text-muted-foreground truncate">
                            {supplier.category}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare "{supplier.name}"? I prodotti associati perderanno il riferimento al fornitore.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(supplier.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              supplier={editingSupplier || undefined}
              onSubmit={editingSupplier ? handleUpdate : handleCreate}
              isLoading={createSupplier.isPending || updateSupplier.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
