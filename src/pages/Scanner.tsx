import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Keyboard, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { useProductLookup } from '@/hooks/useProductLookup';

export default function Scanner() {
  const [mode, setMode] = useState<'menu' | 'scan'>('menu');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const navigate = useNavigate();
  const { lookupProduct } = useProductLookup();

  const handleBarcodeDetected = async (barcode: string) => {
    setIsLookingUp(true);
    const productInfo = await lookupProduct(barcode);
    setIsLookingUp(false);
    
    const params = new URLSearchParams({ barcode });
    
    if (productInfo) {
      if (productInfo.name) params.set('name', productInfo.name);
      if (productInfo.ingredients) params.set('ingredients_text', productInfo.ingredients);
      if (productInfo.allergens?.length) params.set('allergens', productInfo.allergens.join(', '));
      if (productInfo.brand) params.set('brand', productInfo.brand);
    }
    
    navigate(`/products/new?${params.toString()}`);
  };

  const handleManualEntry = () => {
    navigate('/products/new');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-2xl font-display font-bold text-foreground">Scanner</h1>

        {mode === 'menu' && (
          <div className="space-y-4">
            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <Camera className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Scansione Prodotto</h2>
                  <p className="text-muted-foreground text-sm">
                    Scansiona il codice a barre per ottenere automaticamente le informazioni del prodotto
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => setMode('scan')} 
                    className="w-full gradient-primary h-auto py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-semibold">Scansiona Codice</div>
                        <div className="text-xs opacity-80">Cerca automaticamente nome e ingredienti</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={handleManualEntry}
                    variant="outline"
                    className="w-full h-auto py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Keyboard className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-semibold">Inserimento Manuale</div>
                        <div className="text-xs text-muted-foreground">Compila tutti i campi</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => navigate('/products')}
                    variant="ghost"
                    className="w-full"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Vai al Registro Prodotti
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'scan' && !isLookingUp && (
          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onClose={() => setMode('menu')}
          />
        )}

        {isLookingUp && (
          <Card>
            <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Ricerca informazioni prodotto...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
