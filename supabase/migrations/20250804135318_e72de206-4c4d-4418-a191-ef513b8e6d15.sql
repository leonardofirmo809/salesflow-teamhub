-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');

-- Create task priority enum  
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(user_id),
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view tasks assigned to them or created by them" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Users can create tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tasks they created or are assigned to" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Users can delete tasks they created or admins/managers can delete any" 
ON public.tasks 
FOR DELETE 
TO authenticated
USING (
  auth.uid() = created_by OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

-- Create trigger for automatic timestamp updates on tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create task comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for task comments
CREATE POLICY "Users can view comments on tasks they have access to" 
ON public.task_comments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_comments.task_id 
    AND (
      auth.uid() = tasks.assigned_to OR 
      auth.uid() = tasks.created_by OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'manager')
    )
  )
);

CREATE POLICY "Users can create comments on tasks they have access to" 
ON public.task_comments 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_comments.task_id 
    AND (
      auth.uid() = tasks.assigned_to OR 
      auth.uid() = tasks.created_by OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'manager')
    )
  )
);