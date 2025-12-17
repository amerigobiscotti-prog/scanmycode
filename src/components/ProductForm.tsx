import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSuppliers } from '@/hooks/useSuppliers';
import { ProductInput } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

const productSchema = z.object({
  barcode: z.string().optional(),
  name: z.string().min(1, 'Nome prodotto obbligatorio').max(200, 'Nome troppo lungo'),
  lot: z.string().min(1, 'Numero lotto obbligatorio').max(100, 'Lotto troppo lungo'),
  supplier_id: z.string().optional(),
  arrival_date: z.date(),
  expiry_date: z.date().optional(),
  quantity: z.number().min(0, 'Quantità deve essere positiva'),
  unit: z.string().min(1, 'Unità di misura obbligatoria'),
  notes: z.string().max(500, 'Note troppo lunghe').optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductInput & { id?: string }>;
  onSubmit: (data: ProductInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const units = [
  { value: 'kg', label: 'Chilogrammi (kg)' },
  { value: 'pz', label: 'Pezzi (pz)' },
  { value: 'conf', label: 'Confezioni (conf)' },
  { value: 'g', label: 'Grammi (g)' },
];

export function ProductForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salva' }: ProductFormProps) {
  const { data: suppliers } = useSuppliers();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode: defaultValues?.barcode || '',
      name: defaultValues?.name || '',
      lot: defaultValues?.lot || '',
      supplier_id: defaultValues?.supplier_id || '',
      arrival_date: defaultValues?.arrival_date ? new Date(defaultValues.arrival_date) : new Date(),
      expiry_date: defaultValues?.expiry_date ? new Date(defaultValues.expiry_date) : undefined,
      quantity: defaultValues?.quantity || 0,
      unit: defaultValues?.unit || 'kg',
      notes: defaultValues?.notes || '',
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    onSubmit({
      barcode: data.barcode || undefined,
      name: data.name,
      lot: data.lot,
      supplier_id: data.supplier_id || undefined,
      arrival_date: format(data.arrival_date, 'yyyy-MM-dd'),
      expiry_date: data.expiry_date ? format(data.expiry_date, 'yyyy-MM-dd') : undefined,
      quantity: data.quantity,
      unit: data.unit,
      notes: data.notes || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Codice a Barre</FormLabel>
              <FormControl>
                <Input placeholder="8001234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Prodotto *</FormLabel>
              <FormControl>
                <Input placeholder="Es. Fiorentina di Chianina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero Lotto *</FormLabel>
              <FormControl>
                <Input placeholder="Es. L2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornitore</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona fornitore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.category && `- ${supplier.category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="arrival_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Arrivo *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'dd/MM/yyyy') : 'Seleziona'}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Scadenza</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'dd/MM/yyyy') : 'Seleziona'}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantità *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unità *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unità" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Note aggiuntive..." 
                  className="resize-none" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full gradient-primary" 
          disabled={isLoading}
        >
          {isLoading ? 'Salvataggio...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
