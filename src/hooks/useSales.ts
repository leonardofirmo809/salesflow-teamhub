import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Temporary interface until the sales table is created in the database
interface SalesRow {
  id: string;
  customer_name: string;
  customer_email: string | null;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  sale_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  customerName: string;
  customerEmail: string;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  saleDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    fullName: string;
  };
}

export const useSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const salesWithCreator = data?.map(sale => ({
        id: sale.id,
        customerName: sale.customer_name,
        customerEmail: sale.customer_email || '',
        product: sale.product,
        amount: sale.amount,
        status: sale.status as 'pending' | 'processing' | 'completed' | 'cancelled',
        saleDate: sale.sale_date,
        createdBy: sale.created_by,
        createdAt: sale.created_at,
        updatedAt: sale.updated_at,
        creator: undefined
      })) || [];

      setSales(salesWithCreator);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'creator'>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          customer_name: saleData.customerName,
          customer_email: saleData.customerEmail,
          product: saleData.product,
          amount: saleData.amount,
          status: saleData.status,
          sale_date: saleData.saleDate,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSales();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro ao criar venda' };
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const updateData: any = {};
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
      if (updates.customerEmail !== undefined) updateData.customer_email = updates.customerEmail;
      if (updates.product !== undefined) updateData.product = updates.product;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.saleDate !== undefined) updateData.sale_date = updates.saleDate;

      const { error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchSales();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro ao atualizar venda' };
    }
  };

  const deleteSale = async (id: string) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSales();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro ao deletar venda' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    updateSale,
    deleteSale,
  };
};