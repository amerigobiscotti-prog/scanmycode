import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Flashlight, FlashlightOff, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [torch, setTorch] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      setScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Errore fotocamera',
        description: 'Non è possibile accedere alla fotocamera. Usa l\'inserimento manuale.',
        variant: 'destructive',
      });
      setManualEntry(true);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setScanning(false);
  };

  const toggleTorch = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          // @ts-ignore - torch is valid but not in types
          advanced: [{ torch: !torch }]
        });
        setTorch(!torch);
      } catch (error) {
        toast({
          title: 'Torcia non disponibile',
          description: 'Il dispositivo non supporta la torcia.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBarcodeSubmit = (code: string) => {
    if (code.trim()) {
      stopScanning();
      navigate(`/products/new?barcode=${encodeURIComponent(code.trim())}`);
    }
  };

  // Simulated barcode detection - in production, you'd use a library like @mebjas/html5-qrcode
  const simulateScan = () => {
    const demoBarcode = `8001234567890`;
    handleBarcodeSubmit(demoBarcode);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-2xl font-display font-bold text-foreground">Scanner</h1>

        {!scanning && !manualEntry && (
          <div className="space-y-4">
            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-muted-foreground">
                  Scansiona il codice a barre del prodotto o inseriscilo manualmente
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button 
                    onClick={startScanning} 
                    className="flex-1 gradient-primary"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Avvia Scanner
                  </Button>
                  <Button 
                    onClick={() => setManualEntry(true)} 
                    variant="outline"
                    className="flex-1"
                  >
                    <Keyboard className="mr-2 h-5 w-5" />
                    Manuale
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {scanning && (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="w-full aspect-[4/3] object-cover bg-secondary"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-2 border-primary rounded-lg shadow-glow" />
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary"
                    onClick={toggleTorch}
                    className="rounded-full"
                  >
                    {torch ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={stopScanning}
                    className="rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              Inquadra il codice a barre nel riquadro
            </p>

            {/* Demo button - in production this would be handled by barcode detection */}
            <Button 
              onClick={simulateScan} 
              variant="outline" 
              className="w-full"
            >
              Demo: Simula Scansione
            </Button>

            <Button 
              onClick={() => {
                stopScanning();
                setManualEntry(true);
              }} 
              variant="ghost" 
              className="w-full"
            >
              Inserisci manualmente
            </Button>
          </div>
        )}

        {manualEntry && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inserimento Manuale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Codice a barre"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleBarcodeSubmit(barcode)}
                  className="flex-1 gradient-primary"
                  disabled={!barcode.trim()}
                >
                  Continua
                </Button>
                <Button 
                  onClick={() => {
                    setManualEntry(false);
                    setBarcode('');
                  }}
                  variant="outline"
                >
                  Annulla
                </Button>
              </div>
              <Button 
                onClick={() => navigate('/products/new')}
                variant="ghost"
                className="w-full"
              >
                Continua senza codice
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
