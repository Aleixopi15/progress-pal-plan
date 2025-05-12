
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Obter iniciais do nome do usuário a partir dos metadados se disponíveis
  const userMetadata = user?.user_metadata as { nome?: string; sobrenome?: string } | undefined;
  const nome = userMetadata?.nome || 'Usuário';
  const sobrenome = userMetadata?.sobrenome || '';
  
  const initials = nome && sobrenome
    ? `${nome[0]}${sobrenome[0]}`.toUpperCase()
    : nome
      ? nome[0].toUpperCase()
      : 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="hidden lg:flex lg:items-center">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <span className="font-bold text-primary">StudyPlan</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
          <span className="sr-only">Pesquisar</span>
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuLabel className="font-normal text-sm text-muted-foreground">
              {nome} {sobrenome}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
