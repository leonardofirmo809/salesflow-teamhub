import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User, Package, Calendar, DollarSign } from 'lucide-react';
import { Sale } from '@/hooks/useSales';

interface SaleCardProps {
  sale: Sale;
  onEdit: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusLabels = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export function SaleCard({ sale, onEdit, onDelete }: SaleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{sale.customer_name}</h3>
            </div>
            {sale.customer_email && (
              <p className="text-sm text-muted-foreground">{sale.customer_email}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[sale.status]}>
              {statusLabels[sale.status]}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(sale)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(sale.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Produto</p>
              <p className="font-medium">{sale.product}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-medium text-green-600">{formatCurrency(sale.amount)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Data da Venda</p>
              <p className="font-medium">{formatDate(sale.sale_date)}</p>
            </div>
          </div>
        </div>
        
        {sale.creator_profile && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Criado por: {sale.creator_profile.full_name || 'Usuário'} em {formatDate(sale.created_at)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}