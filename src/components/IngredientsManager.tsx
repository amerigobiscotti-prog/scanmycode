import { useState } from 'react';
import { Plus, Trash2, Package, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DualScanner, ScannedProduct } from '@/components/scanner/DualScanner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Ingredient } from '@/hooks/useProducts';

interface IngredientsManagerProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export function IngredientsManager({ ingredients, onChange }: IngredientsManagerProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualIngredient, setManualIngredient] = useState({
    barcode: '',
    name: '',
    lot: '',
    expiry_date: '',
  });

  const handleScanComplete = (product: ScannedProduct) => {
    const newIngredient: Ingredient = {
      barcode: product.barcode,
      lot: product.lot,
      expiry_date: product.expiryDate,
      scanned_at: new Date().toISOString(),
    };
    onChange([...ingredients, newIngredient]);
    setShowScanner(false);
  };

  const handleManualAdd = () => {
    if (!manualIngredient.barcode || !manualIngredient.lot) return;
    
    const newIngredient: Ingredient = {
      barcode: manualIngredient.barcode,
      name: manualIngredient.name || undefined,
      lot: manualIngredient.lot,
      expiry_date: manualIngredient.expiry_date,
      scanned_at: new Date().toISOString(),
    };
    
    onChange([...ingredients, newIngredient]);
    setManualIngredient({ barcode: '', name: '', lot: '', expiry_date: '' });
    setShowManual(false);
  };

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Ingredienti ({ingredients.length})
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowScanner(true)}
            >
              <Camera className="h-4 w-4 mr-1" />
              Scansiona
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowManual(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Manuale
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ingredients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nessun ingrediente aggiunto. Scansiona o aggiungi manualmente.
          </p>
        ) : (
          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {ing.name || `Prodotto ${ing.barcode}`}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Lotto: {ing.lot}</span>
                    {ing.expiry_date && (
                      <span>
                        Scad: {format(new Date(ing.expiry_date), 'd MMM yyyy', { locale: it })}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scansiona Ingrediente</DialogTitle>
          </DialogHeader>
          <DualScanner
            onComplete={handleScanComplete}
            onCancel={() => setShowScanner(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Ingrediente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Codice a barre *</Label>
              <Input
                value={manualIngredient.barcode}
                onChange={(e) => setManualIngredient(prev => ({ ...prev, barcode: e.target.value }))}
                placeholder="8001234567890"
              />
            </div>
            <div>
              <Label>Nome (opzionale)</Label>
              <Input
                value={manualIngredient.name}
                onChange={(e) => setManualIngredient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es. Pangrattato"
              />
            </div>
            <div>
              <Label>Lotto *</Label>
              <Input
                value={manualIngredient.lot}
                onChange={(e) => setManualIngredient(prev => ({ ...prev, lot: e.target.value }))}
                placeholder="Es. L12345"
              />
            </div>
            <div>
              <Label>Data scadenza</Label>
              <Input
                type="date"
                value={manualIngredient.expiry_date}
                onChange={(e) => setManualIngredient(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleManualAdd}
                disabled={!manualIngredient.barcode || !manualIngredient.lot}
                className="flex-1 gradient-primary"
              >
                Aggiungi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManual(false)}
              >
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
