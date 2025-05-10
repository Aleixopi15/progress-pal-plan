
import { PageTitle } from "@/components/layout/PageTitle";

export default function Progress() {
  return (
    <div className="animate-fade-in">
      <PageTitle title="Progresso" subtitle="Acompanhe sua evolução nos estudos" />
      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-center text-xl font-semibold">
          Análise de Progresso em Construção
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
