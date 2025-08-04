import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Gestão</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.user_metadata?.full_name || user?.email}!
            </p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Tarefas</CardTitle>
              <CardDescription>
                Crie, atribua e acompanhe tarefas da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tasks">
                <Button className="w-full">
                  Acessar Tarefas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas</CardTitle>
              <CardDescription>
                Centralize informações de vendas e gere relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organização</CardTitle>
              <CardDescription>
                Organize tarefas e vendas por pastas/categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
