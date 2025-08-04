import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task } from '@/hooks/useTasks';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, updates: { status: string }) => void;
  variant?: 'kanban' | 'list';
}

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange, variant = 'kanban' }: TaskCardProps) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
  };

  const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
  };

  const statusLabels = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluída',
    overdue: 'Atrasada',
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const displayStatus = isOverdue ? 'overdue' : task.status;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, { status: newStatus });
  };

  if (variant === 'list') {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">{task.title}</h3>
                <Badge className={`${priorityColors[task.priority]} text-xs`}>
                  {priorityLabels[task.priority]}
                </Badge>
                <Badge className={`${statusColors[displayStatus]} text-xs`}>
                  {statusLabels[displayStatus]}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.assigned_profile && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assigned_profile.full_name || 'Usuário sem nome'}
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {task.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    Marcar como Concluída
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {task.status === 'pending' && (
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  Iniciar
                </DropdownMenuItem>
              )}
              {task.status === 'in_progress' && (
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  Concluir
                </DropdownMenuItem>
              )}
              {task.status === 'completed' && (
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  Reabrir
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={`${priorityColors[task.priority]} text-xs`}>
            {priorityLabels[task.priority]}
          </Badge>
          {isOverdue && (
            <Badge className={`${statusColors.overdue} text-xs`}>
              Atrasada
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {task.assigned_profile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{task.assigned_profile.full_name || 'Usuário sem nome'}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};