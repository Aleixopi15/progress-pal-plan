
import { PageTitle } from "@/components/layout/PageTitle";

export default function Profile() {
  return (
    <div className="animate-fade-in">
      <PageTitle title="Perfil" subtitle="Gerencie suas informações pessoais" />
      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-center text-xl font-semibold">
          Perfil de Usuário em Construção
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
