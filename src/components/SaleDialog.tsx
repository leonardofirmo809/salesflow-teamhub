import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sale } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<{ error: string | null }>;
  sale?: Sale | null;
}

export function SaleDialog({ open, onOpenChange, onSubmit, sale }: SaleDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    product: '',
    amount: '',
    status: 'pending' as 'pending' | 'processing' | 'completed' | 'cancelled',
    sale_date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sale) {
      setFormData({
        customer_name: sale.customer_name,
        customer_email: sale.customer_email || '',
        product: sale.product,
        amount: sale.amount.toString(),
        status: sale.status,
        sale_date: sale.sale_date.split('T')[0], // Format for date input
      });
    } else {
      setFormData({
        customer_name: '',
        customer_email: '',
        product: '',
        amount: '',
        status: 'pending',
        sale_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [sale, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.product || !formData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      customer_email: formData.customer_email || undefined,
    };

    const { error } = await onSubmit(submitData);
    
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: sale ? "Venda atualizada com sucesso" : "Venda criada com sucesso",
      });
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {sale ? 'Editar Venda' : 'Nova Venda'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Nome do Cliente *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Digite o nome do cliente"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email do Cliente</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product">Produto *</Label>
            <Input
              id="product"
              value={formData.product}
              onChange={(e) => handleInputChange('product', e.target.value)}
              placeholder="Digite o nome do produto"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sale_date">Data da Venda</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => handleInputChange('sale_date', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : sale ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}