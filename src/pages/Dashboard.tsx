import { Link } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, QrCode, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { useProductStats } from '@/hooks/useProducts';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Dashboard() {
  const { data: stats, isLoading } = useProductStats();

  const getExpiryBadge = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) {
      return <Badge variant="destructive">Scaduto</Badge>;
    }
    if (days <= 3) {
      return <Badge className="bg-destructive text-destructive-foreground">{days}g</Badge>;
    }
    return <Badge className="bg-warning text-warning-foreground">{days}g</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE d MMMM", { locale: it })}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/scan">
            <Card className="hover:shadow-glow transition-all cursor-pointer border-primary/20 hover:border-primary">
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Scansiona</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/products?new=true">
            <Card className="hover:shadow-glow transition-all cursor-pointer border-primary/20 hover:border-primary">
              <CardContent className="p-6 flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Nuovo Prodotto</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Totale Prodotti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? '...' : stats?.total || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Questa Settimana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {isLoading ? '...' : stats?.thisWeek || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Questo Mese
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? '...' : stats?.thisMonth || 0}
              </p>
            </CardContent>
          </Card>

          <Card className={stats?.expiringSoon?.length ? 'border-warning' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                In Scadenza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stats?.expiringSoon?.length ? 'text-warning' : 'text-foreground'}`}>
                {isLoading ? '...' : stats?.expiringSoon?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Products Alert */}
        {stats?.expiringSoon && stats.expiringSoon.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Prodotti in Scadenza (7 giorni)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.expiringSoon.slice(0, 5).map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">Lotto: {product.lot}</p>
                  </div>
                  {product.expiry_date && getExpiryBadge(product.expiry_date)}
                </Link>
              ))}
              {stats.expiringSoon.length > 5 && (
                <Link to="/products?filter=expiring">
                  <Button variant="outline" className="w-full mt-2">
                    Vedi tutti ({stats.expiringSoon.length})
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Expired Products Alert */}
        {stats?.expired && stats.expired.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
                <Clock className="h-5 w-5" />
                Prodotti Scaduti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.expired.slice(0, 3).map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.id}`}
                  className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Scaduto il {format(new Date(product.expiry_date!), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Badge variant="destructive">Scaduto</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
