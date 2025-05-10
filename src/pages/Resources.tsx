
import { PageTitle } from "@/components/layout/PageTitle";

export default function Resources() {
  return (
    <div className="animate-fade-in">
      <PageTitle title="Recursos" subtitle="Acesse seus materiais de estudo" />
      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-center text-xl font-semibold">
          Biblioteca de Recursos em Construção
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Esta funcionalidade estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
