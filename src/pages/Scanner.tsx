import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Keyboard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { DualScanner, ScannedProduct } from '@/components/scanner/DualScanner';

export default function Scanner() {
  const [mode, setMode] = useState<'menu' | 'dual' | 'quick'>('menu');
  const navigate = useNavigate();

  const handleDualScanComplete = (product: ScannedProduct) => {
    const params = new URLSearchParams({
      barcode: product.barcode,
      lot: product.lot,
      expiry_date: product.expiryDate,
    });
    navigate(`/products/new?${params.toString()}`);
  };

  const handleQuickScan = () => {
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
                    Scegli come inserire il prodotto
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => setMode('dual')} 
                    className="w-full gradient-primary h-auto py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="h-6 w-6" />
                      <div className="text-left">
                        <div className="font-semibold">Doppia Scansione</div>
                        <div className="text-xs opacity-80">Barcode + OCR (lotto e scadenza)</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={handleQuickScan}
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

        {mode === 'dual' && (
          <DualScanner
            onComplete={handleDualScanComplete}
            onCancel={() => setMode('menu')}
          />
        )}
      </div>
    </Layout>
  );
}
