
import { PageTitle } from "@/components/layout/PageTitle";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6 p-4">
      <PageTitle 
        title="Perfil" 
        subtitle="Gerencie suas informações pessoais"
      />
      
      <div className="grid gap-6">
        <ProfileForm />
        
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Informações sobre sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID da Conta</p>
                  <p className="text-sm text-muted-foreground">{user?.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => signOut()}>Sair da conta</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
