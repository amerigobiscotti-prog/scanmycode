import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import logoCompleto from '@/assets/logo-completo.png';

export default function Login() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({ title: 'Errore', description: 'Inserisci la password', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const success = await login(password);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      toast({ title: 'Accesso negato', description: 'Password non corretta', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex justify-center mb-8">
          <img 
            src={logoCompleto} 
            alt="Macellum" 
            className="h-32 object-contain"
          />
        </div>

        <Card className="shadow-glow border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-display text-secondary">
              Tracciabilità
            </CardTitle>
            <CardDescription>
              Inserisci la password per accedere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold gradient-primary"
                disabled={loading}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-secondary-foreground/60 text-sm mt-6">
          App Tracciabilità Macelleria
        </p>
      </div>
    </div>
  );
}
