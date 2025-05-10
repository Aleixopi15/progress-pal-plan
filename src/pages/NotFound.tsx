
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <h2 className="mt-2 text-2xl font-semibold">Página não encontrada</h2>
      <p className="mt-4 max-w-md text-center text-muted-foreground">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  );
};

export default NotFound;
