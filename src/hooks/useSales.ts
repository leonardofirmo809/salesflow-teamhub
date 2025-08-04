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
  customer_name: string;
  customer_email: string | null;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  sale_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator_profile?: {
    id: string;
    user_id: string;
    full_name: string | null;
    role: 'admin' | 'manager' | 'member';
  };
}

export const useSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      // Temporarily disable this call until the sales table is created
      setSales([]);
      setError('A tabela de vendas será criada após a migração do banco de dados');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: {
    customer_name: string;
    customer_email?: string;
    product: string;
    amount: number;
    sale_date?: string;
  }) => {
    try {
      // Temporarily disable this call until the sales table is created
      const errorMsg = 'Execute a migração do banco de dados primeiro';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar venda';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      // Temporarily disable this call until the sales table is created
      const errorMsg = 'Execute a migração do banco de dados primeiro';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar venda';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const deleteSale = async (id: string) => {
    try {
      // Temporarily disable this call until the sales table is created
      const errorMsg = 'Execute a migração do banco de dados primeiro';
      setError(errorMsg);
      return { error: errorMsg };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar venda';
      setError(errorMsg);
      return { error: errorMsg };
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