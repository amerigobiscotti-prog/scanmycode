import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onBarcodeDetected, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (isMounted) {
        await startScanning();
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('barcode-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });
      
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          console.log('Barcode detected:', decodedText);
          onBarcodeDetected(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore scan errors - they happen frequently during scanning
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Scanner error:', error);
      toast({
        title: 'Errore fotocamera',
        description: 'Non è possibile accedere alla fotocamera. Controlla i permessi.',
        variant: 'destructive',
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // 2 = SCANNING
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (error) {
        // Silently handle errors during cleanup
        console.debug('Scanner cleanup:', error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleTorch = async () => {
    if (scannerRef.current) {
      try {
        const state = await scannerRef.current.getRunningTrackCameraCapabilities();
        if (state.torchFeature().isSupported()) {
          await state.torchFeature().apply(!torch);
          setTorch(!torch);
        } else {
          toast({
            title: 'Torcia non disponibile',
            description: 'Il dispositivo non supporta la torcia.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Torch error:', error);
      }
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="relative bg-secondary rounded-lg overflow-hidden">
      <div id="barcode-reader" className="w-full" style={{ minHeight: '300px' }} />
      
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button 
          size="icon" 
          variant="secondary"
          onClick={toggleTorch}
          className="rounded-full bg-background/80"
        >
          {torch ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
        </Button>
        <Button 
          size="icon" 
          variant="destructive"
          onClick={handleClose}
          className="rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground py-3">
        Inquadra il codice a barre nel riquadro
      </p>
    </div>
  );
}
