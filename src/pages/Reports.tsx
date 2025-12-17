import { Download, Package, TrendingUp, Calendar, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { useProductStats, useProducts } from '@/hooks/useProducts';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(6, 70%, 62%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(200, 70%, 50%)', 'hsl(280, 70%, 50%)'];

export default function Reports() {
  const { data: stats, isLoading: statsLoading } = useProductStats();
  const { data: products } = useProducts();

  const pieData = stats?.bySupplier
    ? Object.entries(stats.bySupplier).map(([name, value]) => ({ name, value }))
    : [];

  const exportToCSV = () => {
    if (!products || products.length === 0) return;

    const headers = ['Nome', 'Codice a Barre', 'Lotto', 'Fornitore', 'Data Arrivo', 'Data Scadenza', 'Quantità', 'Unità', 'Note'];
    
    const rows = products.map(p => [
      p.name,
      p.barcode || '',
      p.lot,
      p.suppliers?.name || '',
      p.arrival_date,
      p.expiry_date || '',
      p.quantity.toString(),
      p.unit,
      p.notes || ''
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tracciabilita_macellum_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Report</h1>
          <Button 
            onClick={exportToCSV} 
            variant="outline"
            disabled={!products || products.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Totale Archivio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {statsLoading ? '...' : stats?.total || 0}
              </p>
              <p className="text-sm text-muted-foreground">prodotti registrati</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ultima Settimana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {statsLoading ? '...' : stats?.thisWeek || 0}
              </p>
              <p className="text-sm text-muted-foreground">nuovi inserimenti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ultimo Mese
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {statsLoading ? '...' : stats?.thisMonth || 0}
              </p>
              <p className="text-sm text-muted-foreground">nuovi inserimenti</p>
            </CardContent>
          </Card>

          <Card className={stats?.expiringSoon?.length ? 'border-warning' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                In Scadenza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stats?.expiringSoon?.length ? 'text-warning' : 'text-foreground'}`}>
                {statsLoading ? '...' : stats?.expiringSoon?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">prossimi 7 giorni</p>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuzione per Fornitore
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Nessun dato disponibile</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Table */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riepilogo per Fornitore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">{item.value} prodotti</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
