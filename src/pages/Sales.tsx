import { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import { SaleCard } from '@/components/SaleCard';
import { SaleDialog } from '@/components/SaleDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Sales() {
  const { sales, loading, createSale, updateSale, deleteSale } = useSales();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const pendingSales = sales.filter(sale => sale.status === 'pending').length;

  const handleCreateSale = async (saleData: any) => {
    const { error } = await createSale(saleData);
    if (!error) {
      setDialogOpen(false);
    }
    return { error };
  };

  const handleUpdateSale = async (saleData: any) => {
    if (!editingSale) return { error: 'Nenhuma venda selecionada' };
    
    const { error } = await updateSale(editingSale.id, saleData);
    if (!error) {
      setDialogOpen(false);
      setEditingSale(null);
    }
    return { error };
  };

  const handleEditSale = (sale: any) => {
    setEditingSale(sale);
    setDialogOpen(true);
  };

  const handleDeleteSale = async (saleId: string) => {
    await deleteSale(saleId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground">Gerencie suas vendas e acompanhe o desempenho</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Concluídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendas */}
      <div className="grid gap-4">
        {sales.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma venda encontrada</CardTitle>
              <CardDescription>
                Comece criando sua primeira venda clicando no botão "Nova Venda"
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          sales.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              onEdit={handleEditSale}
              onDelete={handleDeleteSale}
            />
          ))
        )}
      </div>

      <SaleDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingSale(null);
        }}
        onSubmit={editingSale ? handleUpdateSale : handleCreateSale}
        sale={editingSale}
      />
    </div>
  );
}