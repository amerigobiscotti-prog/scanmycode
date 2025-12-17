import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, ScanText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextOCRScannerProps {
  onTextDetected: (text: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function TextOCRScanner({ 
  onTextDetected, 
  onClose, 
  title = "Scansione Lotto/Scadenza",
  description = "Inquadra il testo con lotto e data di scadenza"
}: TextOCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ocrReady, setOcrReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeCamera();
    initializeOCR();
    
    return () => {
      stopCamera();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Errore fotocamera',
        description: 'Non è possibile accedere alla fotocamera.',
        variant: 'destructive',
      });
    }
  };

  const initializeOCR = async () => {
    try {
      const { pipeline } = await import('@huggingface/transformers');
      
      console.log('Loading OCR model...');
      workerRef.current = await pipeline(
        'image-to-text',
        'Xenova/trocr-small-printed',
        { device: 'webgpu' }
      );
      
      setOcrReady(true);
      console.log('OCR ready');
    } catch (error) {
      console.error('OCR initialization error:', error);
      // Fallback: try without WebGPU
      try {
        const { pipeline } = await import('@huggingface/transformers');
        workerRef.current = await pipeline(
          'image-to-text',
          'Xenova/trocr-small-printed'
        );
        setOcrReady(true);
        console.log('OCR ready (CPU fallback)');
      } catch (fallbackError) {
        console.error('OCR fallback error:', fallbackError);
        toast({
          title: 'OCR non disponibile',
          description: 'Inserisci i dati manualmente.',
          variant: 'destructive',
        });
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  const captureAndProcess = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/png');
      
      console.log('Processing image with OCR...');
      const result = await workerRef.current(imageData);
      
      console.log('OCR result:', result);
      
      if (result && result[0]?.generated_text) {
        const text = result[0].generated_text;
        onTextDetected(text);
        stopCamera();
      } else {
        toast({
          title: 'Testo non rilevato',
          description: 'Riprova avvicinando la fotocamera al testo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: 'Errore elaborazione',
        description: 'Impossibile leggere il testo. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onTextDetected, toast]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="relative bg-secondary rounded-lg overflow-hidden">
      <div className="relative">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className="w-full aspect-[4/3] object-cover bg-black"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-24 border-2 border-accent rounded-lg bg-accent/10" />
        </div>
        
        {/* Loading indicator */}
        {!ocrReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Caricamento OCR...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          size="icon" 
          variant="destructive"
          onClick={handleClose}
          className="rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="text-center">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <Button 
          onClick={captureAndProcess}
          disabled={!ocrReady || isProcessing}
          className="w-full gradient-primary"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Elaborazione...
            </>
          ) : (
            <>
              <ScanText className="mr-2 h-5 w-5" />
              Scansiona Testo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
