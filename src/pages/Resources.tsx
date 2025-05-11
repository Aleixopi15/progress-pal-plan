
import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, File, FileText, FilePlus, FolderPlus, Search, Download, Star, Clock, Grid, List, MoreHorizontal, ExternalLink, Upload } from "lucide-react";

interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  type: "pdf" | "video" | "note" | "link" | "flash";
  subject?: string;
  url?: string;
  tags: string[];
  dateAdded: Date;
  isFavorite: boolean;
}

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const [resources, setResources] = useState<ResourceItem[]>([
    {
      id: "1",
      title: "Resumo de Física Mecânica",
      description: "Resumo completo de mecânica newtoniana com fórmulas e exemplos",
      type: "pdf",
      subject: "Física",
      tags: ["mecânica", "newton", "leis do movimento"],
      dateAdded: new Date(2025, 3, 15),
      isFavorite: true,
    },
    {
      id: "2",
      title: "Videoaula - Equações de Primeiro Grau",
      description: "Explicação detalhada sobre resolução de equações de 1º grau",
      type: "video",
      subject: "Matemática",
      url: "https://youtube.com/watch?v=example",
      tags: ["álgebra", "equações", "primeiro grau"],
      dateAdded: new Date(2025, 3, 20),
      isFavorite: false,
    },
    {
      id: "3",
      title: "Mapa Mental - Literatura Brasileira",
      description: "Mapa mental cobrindo as principais escolas literárias brasileiras",
      type: "note",
      subject: "Português",
      tags: ["literatura", "resumo", "escolas literárias"],
      dateAdded: new Date(2025, 4, 5),
      isFavorite: true,
    },
    {
      id: "4",
      title: "Khan Academy - Química Orgânica",
      description: "Curso completo de química orgânica",
      type: "link",
      subject: "Química",
      url: "https://www.khanacademy.org/example",
      tags: ["química orgânica", "curso", "externa"],
      dateAdded: new Date(2025, 4, 10),
      isFavorite: false,
    },
    {
      id: "5",
      title: "Flashcards de Biologia Celular",
      description: "Conjunto de flashcards sobre componentes e funções celulares",
      type: "flash",
      subject: "Biologia",
      tags: ["biologia celular", "flashcards", "memorização"],
      dateAdded: new Date(2025, 4, 12),
      isFavorite: false,
    },
    {
      id: "6",
      title: "Exercícios de História do Brasil",
      description: "Lista de exercícios sobre o período colonial e imperial",
      type: "pdf",
      subject: "História",
      tags: ["história do brasil", "exercícios", "colonial"],
      dateAdded: new Date(2025, 4, 18),
      isFavorite: false,
    },
  ]);

  const [newResource, setNewResource] = useState<Partial<ResourceItem>>({
    title: "",
    description: "",
    type: "pdf",
    subject: "",
    url: "",
    tags: [],
    isFavorite: false,
  });

  // Filtrar recursos por pesquisa e matéria
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery.trim() === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === null || resource.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  // Lista única de matérias disponíveis
  const subjects = Array.from(new Set(resources.map(r => r.subject).filter(Boolean)));

  const handleAddResource = () => {
    if (!newResource.title || !newResource.type) {
      return;
    }

    const resource: ResourceItem = {
      id: Date.now().toString(),
      title: newResource.title,
      description: newResource.description,
      type: newResource.type as "pdf" | "video" | "note" | "link" | "flash",
      subject: newResource.subject,
      url: newResource.url,
      tags: newResource.tags || [],
      dateAdded: new Date(),
      isFavorite: newResource.isFavorite || false,
    };

    setResources([...resources, resource]);
    setNewResource({
      title: "",
      description: "",
      type: "pdf",
      subject: "",
      url: "",
      tags: [],
      isFavorite: false,
    });
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setResources(resources.map(resource => 
      resource.id === id ? { ...resource, isFavorite: !resource.isFavorite } : resource
    ));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <File className="h-5 w-5" />;
      case "note":
        return <FileText className="h-5 w-5" />;
      case "link":
        return <ExternalLink className="h-5 w-5" />;
      case "flash":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case "pdf":
        return "PDF";
      case "video":
        return "Vídeo";
      case "note":
        return "Anotação";
      case "link":
        return "Link";
      case "flash":
        return "Flashcards";
      default:
        return type;
    }
  };

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Recursos" 
        subtitle="Acesse seus materiais de estudo"
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Adicionar Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Recurso</DialogTitle>
              <DialogDescription>
                Adicione um novo material de estudo à sua biblioteca.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-title" className="col-span-1">
                  Título
                </Label>
                <Input
                  id="resource-title"
                  className="col-span-3"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Ex: Resumo de Física Mecânica"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-type" className="col-span-1">
                  Tipo
                </Label>
                <Select 
                  onValueChange={(value) => setNewResource({ 
                    ...newResource, 
                    type: value as "pdf" | "video" | "note" | "link" | "flash" 
                  })}
                  value={newResource.type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="note">Anotação</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="flash">Flashcards</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-subject" className="col-span-1">
                  Matéria
                </Label>
                <Select 
                  onValueChange={(value) => setNewResource({ ...newResource, subject: value })}
                  value={newResource.subject}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matemática">Matemática</SelectItem>
                    <SelectItem value="Física">Física</SelectItem>
                    <SelectItem value="Química">Química</SelectItem>
                    <SelectItem value="Biologia">Biologia</SelectItem>
                    <SelectItem value="História">História</SelectItem>
                    <SelectItem value="Geografia">Geografia</SelectItem>
                    <SelectItem value="Português">Português</SelectItem>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newResource.type === "video" || newResource.type === "link") && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="resource-url" className="col-span-1">
                    URL
                  </Label>
                  <Input
                    id="resource-url"
                    className="col-span-3"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-tags" className="col-span-1">
                  Tags
                </Label>
                <Input
                  id="resource-tags"
                  className="col-span-3"
                  placeholder="Tags separadas por vírgula"
                  value={newResource.tags?.join(", ") || ""}
                  onChange={(e) => setNewResource({ 
                    ...newResource, 
                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                  })}
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="resource-description" className="col-span-1 pt-2">
                  Descrição
                </Label>
                <Textarea
                  id="resource-description"
                  className="col-span-3"
                  rows={3}
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Breve descrição do recurso..."
                />
              </div>

              {(newResource.type === "pdf" || newResource.type === "flash") && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="col-span-1">
                    Arquivo
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {newResource.type === "pdf" ? "PDF (Máx. 10MB)" : "Imagens ou PDF (Máx. 10MB)"}
                          </p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAddResource}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="md:w-1/4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar recursos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="pt-4">
                <h3 className="font-medium text-sm mb-3">Filtrar por Matéria</h3>
                <div className="space-y-1">
                  <Button 
                    variant={selectedSubject === null ? "secondary" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedSubject(null)}
                  >
                    Todas
                  </Button>

                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={selectedSubject === subject ? "secondary" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedSubject(subject as string)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total de Recursos</span>
                <span className="text-xl font-bold">{resources.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PDFs</span>
                <span className="font-medium">{resources.filter(r => r.type === "pdf").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vídeos</span>
                <span className="font-medium">{resources.filter(r => r.type === "video").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Anotações</span>
                <span className="font-medium">{resources.filter(r => r.type === "note").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Links</span>
                <span className="font-medium">{resources.filter(r => r.type === "link").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Flashcards</span>
                <span className="font-medium">{resources.filter(r => r.type === "flash").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
            </TabsList>

            {["all", "favorites", "recent"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="animate-fade-in">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {filteredResources
                      .filter(resource => {
                        if (tabValue === "favorites") return resource.isFavorite;
                        if (tabValue === "recent") {
                          // Últimos 7 dias
                          const sevenDaysAgo = new Date();
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                          return resource.dateAdded >= sevenDaysAgo;
                        }
                        return true;
                      })
                      .map((resource) => (
                        <Card key={resource.id} className="overflow-hidden h-full flex flex-col">
                          <CardHeader className="p-4 pb-0">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <div className={`rounded-md p-2 ${
                                  resource.type === "pdf" ? "bg-primary/10" :
                                  resource.type === "video" ? "bg-secondary/10" :
                                  resource.type === "note" ? "bg-accent/10" :
                                  resource.type === "link" ? "bg-muted/30" :
                                  "bg-primary/10"
                                }`}>
                                  {getResourceIcon(resource.type)}
                                </div>
                                <div>
                                  <CardTitle className="text-base">{resource.title}</CardTitle>
                                  {resource.subject && (
                                    <CardDescription className="text-xs">
                                      {resource.subject}
                                    </CardDescription>
                                  )}
                                </div>
                              </div>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={resource.isFavorite ? "text-primary" : "text-muted-foreground"}
                                  onClick={() => handleToggleFavorite(resource.id)}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {}}>
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {}}>
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteResource(resource.id)} className="text-destructive">
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pb-3 flex-grow">
                            {resource.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted/50">
                                  {tag}
                                </span>
                              ))}
                              {resource.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted/50">
                                  +{resource.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-auto">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {resource.dateAdded.toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-xs font-medium">
                              {getResourceTypeLabel(resource.type)}
                            </div>
                          </CardFooter>
                        </Card>
                      ))
                    }
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {filteredResources
                      .filter(resource => {
                        if (tabValue === "favorites") return resource.isFavorite;
                        if (tabValue === "recent") {
                          // Últimos 7 dias
                          const sevenDaysAgo = new Date();
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                          return resource.dateAdded >= sevenDaysAgo;
                        }
                        return true;
                      })
                      .map((resource) => (
                        <div key={resource.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className={`rounded-md p-2 ${
                            resource.type === "pdf" ? "bg-primary/10" :
                            resource.type === "video" ? "bg-secondary/10" :
                            resource.type === "note" ? "bg-accent/10" :
                            resource.type === "link" ? "bg-muted/30" :
                            "bg-primary/10"
                          }`}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{resource.title}</h3>
                              <div className="flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={resource.isFavorite ? "text-primary" : "text-muted-foreground"}
                                  onClick={() => handleToggleFavorite(resource.id)}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {}}>
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {}}>
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteResource(resource.id)} className="text-destructive">
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1 mt-1">
                              {resource.subject && <span>{resource.subject}</span>}
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {resource.dateAdded.toLocaleDateString("pt-BR")}
                              </span>
                              <span className="font-medium">
                                {getResourceTypeLabel(resource.type)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.tags.slice(0, 5).map((tag, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted/50">
                                  {tag}
                                </span>
                              ))}
                              {resource.tags.length > 5 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted/50">
                                  +{resource.tags.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {filteredResources.filter(resource => {
                  if (tabValue === "favorites") return resource.isFavorite;
                  if (tabValue === "recent") {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return resource.dateAdded >= sevenDaysAgo;
                  }
                  return true;
                }).length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">Nenhum recurso encontrado</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tabValue === "favorites" 
                        ? "Adicione recursos aos favoritos para vê-los aqui."
                        : tabValue === "recent"
                        ? "Nenhum recurso adicionado recentemente."
                        : "Adicione recursos ou ajuste os filtros para ver resultados."}
                    </p>
                    {tabValue === "all" && resources.length === 0 && (
                      <Button className="mt-4" onClick={() => document.querySelector('[role="dialog"]')?.focus()}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Adicionar Recurso
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
