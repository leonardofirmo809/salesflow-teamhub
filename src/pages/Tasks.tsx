import { useState } from 'react';
import { useTasks, useProfiles } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, User, ArrowLeft } from 'lucide-react';
import { TaskDialog } from '@/components/TaskDialog';
import { TaskCard } from '@/components/TaskCard';
import { Link } from 'react-router-dom';

const Tasks = () => {
  const { user } = useAuth();
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const { profiles } = useProfiles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
  });

  const handleCreateTask = async (taskData: any) => {
    const result = await createTask(taskData);
    if (result.error) {
      console.error('Erro ao criar tarefa:', result.error);
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    const result = await updateTask(id, updates);
    if (result.error) {
      console.error('Erro ao atualizar tarefa:', result.error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const result = await deleteTask(id);
    if (result.error) {
      console.error('Erro ao deletar tarefa:', result.error);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Tarefas</h1>
              <p className="text-muted-foreground">
                Organize e acompanhe o progresso da equipe
              </p>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{pendingTasks.length}</CardTitle>
              <CardDescription>Pendentes</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{inProgressTasks.length}</CardTitle>
              <CardDescription>Em Andamento</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{completedTasks.length}</CardTitle>
              <CardDescription>Concluídas</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-destructive">{overdueTasks.length}</CardTitle>
              <CardDescription>Atrasadas</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Pendentes
                  <Badge variant="secondary">{pendingTasks.length}</Badge>
                </h3>
                <div className="space-y-4">
                  {pendingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleUpdateTask}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Em Andamento
                  <Badge variant="secondary">{inProgressTasks.length}</Badge>
                </h3>
                <div className="space-y-4">
                  {inProgressTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleUpdateTask}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Concluídas
                  <Badge variant="secondary">{completedTasks.length}</Badge>
                </h3>
                <div className="space-y-4">
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleUpdateTask}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Atrasadas
                  <Badge variant="destructive">{overdueTasks.length}</Badge>
                </h3>
                <div className="space-y-4">
                  {overdueTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleUpdateTask}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleUpdateTask}
                  variant="list"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <TaskDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
          editingTask={editingTask}
          profiles={profiles}
        />
      </div>
    </div>
  );
};

export default Tasks;