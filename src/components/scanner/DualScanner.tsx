import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarcodeScanner } from './BarcodeScanner';
import { TextOCRScanner } from './TextOCRScanner';
import { Camera, ScanText, Keyboard, Check, X, ChevronRight } from 'lucide-react';

export interface ScannedProduct {
  barcode: string;
  lot: string;
  expiryDate: string;
  rawOcrText?: string;
}

interface DualScannerProps {
  onComplete: (product: ScannedProduct) => void;
  onCancel: () => void;
}

type ScanStep = 'barcode' | 'ocr' | 'review';

export function DualScanner({ onComplete, onCancel }: DualScannerProps) {
  const [step, setStep] = useState<ScanStep>('barcode');
  const [barcode, setBarcode] = useState('');
  const [lot, setLot] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  const [manualBarcode, setManualBarcode] = useState(false);
  const [manualOcr, setManualOcr] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Cleanup all camera streams when component unmounts
  useEffect(() => {
    return () => {
      setIsActive(false);
      // Stop all active media streams
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {});
      
      // Stop any existing video elements
      document.querySelectorAll('video').forEach(video => {
        if (video.srcObject) {
          const mediaStream = video.srcObject as MediaStream;
          mediaStream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      });
    };
  }, []);

  const handleBarcodeDetected = (code: string) => {
    setBarcode(code);
    setManualBarcode(false);
    setStep('ocr');
  };

  const handleTextDetected = (text: string) => {
    setRawOcrText(text);
    parseOcrText(text);
    setManualOcr(false);
    setStep('review');
  };

  const parseOcrText = (text: string) => {
    // Try to extract lot and expiry from OCR text
    const lotMatch = text.match(/(?:lotto?|lot|l\.?)\s*[:.]?\s*([A-Z0-9-]+)/i);
    const dateMatch = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    
    if (lotMatch) {
      setLot(lotMatch[1]);
    }
    
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      setExpiryDate(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  };

  const handleComplete = () => {
    onComplete({
      barcode,
      lot,
      expiryDate,
      rawOcrText,
    });
  };

  const handleSkipOcr = () => {
    setManualOcr(true);
    setStep('review');
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'barcode' ? 'bg-primary text-primary-foreground' : 
          barcode ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {barcode ? <Check className="h-4 w-4" /> : '1'}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'ocr' ? 'bg-primary text-primary-foreground' : 
          (lot || expiryDate) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
        }`}>
          {(lot || expiryDate) ? <Check className="h-4 w-4" /> : '2'}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          3
        </div>
      </div>

      {/* Step 1: Barcode */}
      {step === 'barcode' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Passo 1: Scansiona Codice a Barre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!manualBarcode ? (
              <>
                <BarcodeScanner 
                  onBarcodeDetected={handleBarcodeDetected}
                  onClose={onCancel}
                />
                <Button 
                  variant="ghost" 
                  onClick={() => setManualBarcode(true)}
                  className="w-full"
                >
                  <Keyboard className="mr-2 h-4 w-4" />
                  Inserisci manualmente
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Codice a barre</Label>
                  <Input
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Es. 8001234567890"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep('ocr')}
                    disabled={!barcode.trim()}
                    className="flex-1 gradient-primary"
                  >
                    Continua
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setManualBarcode(false)}
                  >
                    Scansiona
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: OCR */}
      {step === 'ocr' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ScanText className="h-5 w-5" />
              Passo 2: Scansiona Lotto e Scadenza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!manualOcr ? (
              <>
                <TextOCRScanner
                  onTextDetected={handleTextDetected}
                  onClose={() => setStep('barcode')}
                />
                <Button 
                  variant="ghost" 
                  onClick={handleSkipOcr}
                  className="w-full"
                >
                  <Keyboard className="mr-2 h-4 w-4" />
                  Inserisci manualmente
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Lotto</Label>
                  <Input
                    value={lot}
                    onChange={(e) => setLot(e.target.value)}
                    placeholder="Es. L12345"
                  />
                </div>
                <div>
                  <Label>Data scadenza</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setStep('review')}
                  className="w-full gradient-primary"
                >
                  Continua
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5" />
              Passo 3: Verifica i Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Codice a barre</Label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
            <div>
              <Label>Lotto</Label>
              <Input
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="Es. L12345"
              />
            </div>
            <div>
              <Label>Data scadenza</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            
            {rawOcrText && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Testo OCR rilevato:</p>
                <p className="text-sm font-mono">{rawOcrText}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleComplete}
                disabled={!barcode.trim()}
                className="flex-1 gradient-primary"
              >
                <Check className="mr-2 h-4 w-4" />
                Conferma
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
              >
                <X className="mr-2 h-4 w-4" />
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
