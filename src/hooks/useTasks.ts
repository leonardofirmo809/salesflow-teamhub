import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'member';
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_profile?: Profile;
  creator_profile?: Profile;
}

export interface TaskComment {
  id: string;
  task_id: string;
  comment: string;
  created_by: string;
  created_at: string;
  creator_profile?: Profile;
}

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, user_id, full_name, role),
          creator_profile:profiles!tasks_created_by_fkey(id, user_id, full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data as Task[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    assigned_to?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            created_by: user?.id,
          },
        ])
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, user_id, full_name, role),
          creator_profile:profiles!tasks_created_by_fkey(id, user_id, full_name, role)
        `)
        .single();

      if (error) throw error;
      setTasks(prev => [data as Task, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar tarefa';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, user_id, full_name, role),
          creator_profile:profiles!tasks_created_by_fkey(id, user_id, full_name, role)
        `)
        .single();

      if (error) throw error;
      setTasks(prev => prev.map(task => task.id === id ? data as Task : task));
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar tarefa';
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== id));
      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar tarefa';
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name');

        if (error) throw error;
        setProfiles(data || []);
      } catch (err) {
        console.error('Erro ao carregar perfis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return { profiles, loading };
};