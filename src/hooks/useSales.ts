
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
    console.log('fetchSales called, user:', user);
    if (!user) {
      console.log('No user, skipping fetch');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching sales from database...');
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Sales fetch result:', { data, error });

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

      console.log('Processed sales:', salesWithCreator);
      setSales(salesWithCreator);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: any) => {
    console.log('createSale called with:', saleData);
    console.log('User authenticated:', !!user, user?.id);
    
    if (!user) {
      console.error('User not authenticated');
      return { error: 'Usuário não autenticado' };
    }

    try {
      const insertData = {
        customer_name: saleData.customer_name || saleData.customerName,
        customer_email: saleData.customer_email || saleData.customerEmail || null,
        product: saleData.product,
        amount: saleData.amount,
        status: saleData.status,
        sale_date: saleData.sale_date || saleData.saleDate || new Date().toISOString(),
        created_by: user.id
      };

      console.log('Inserting sale with data:', insertData);

      const { data, error } = await supabase
        .from('sales')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) throw error;

      await fetchSales();
      return { error: null };
    } catch (err) {
      console.error('Erro ao criar venda:', err);
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
    console.log('useSales useEffect triggered, user:', user);
    if (user) {
      fetchSales();
    } else {
      setSales([]);
      setLoading(false);
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
