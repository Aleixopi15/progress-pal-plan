
import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { File, Video, FileText, Plus, Search, Bookmark, Star, Paperclip, FileImage, FileAudio, Download, Share2, Clock, Trash2 } from "lucide-react";

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [resources, setResources] = useState([
    {
      id: "1",
      title: "Apostila de Matemática - Álgebra",
      type: "document",
      format: "pdf",
      subject: "Matemática",
      description: "Material completo sobre álgebra linear, matrizes e determinantes",
      url: "#",
      dateAdded: "2023-05-10",
      isFavorite: true,
      tags: ["álgebra", "matrizes", "determinantes"]
    },
    {
      id: "2",
      title: "Videoaula - Física Mecânica",
      type: "video",
      format: "mp4",
      subject: "Física",
      description: "Aula sobre leis de Newton e aplicações",
      url: "#",
      dateAdded: "2023-05-12",
      isFavorite: false,
      tags: ["mecânica", "leis de newton"]
    },
    {
      id: "3",
      title: "Resumo de Literatura Brasileira",
      type: "document",
      format: "pdf",
      subject: "Português",
      description: "Resumo das principais obras do modernismo brasileiro",
      url: "#",
      dateAdded: "2023-05-15",
      isFavorite: true,
      tags: ["literatura", "modernismo"]
    },
    {
      id: "4",
      title: "Exercícios de Química Orgânica",
      type: "document",
      format: "pdf",
      subject: "Química",
      description: "Lista com 50 exercícios sobre química orgânica",
      url: "#",
      dateAdded: "2023-05-18",
      isFavorite: false,
      tags: ["química orgânica", "exercícios"]
    },
    {
      id: "5",
      title: "Podcast - História do Brasil",
      type: "audio",
      format: "mp3",
      subject: "História",
      description: "Podcast sobre o período colonial brasileiro",
      url: "#",
      dateAdded: "2023-05-20",
      isFavorite: false,
      tags: ["período colonial", "história do brasil"]
    },
    {
      id: "6",
      title: "Mapas Mentais - Geografia",
      type: "image",
      format: "jpg",
      subject: "Geografia",
      description: "Conjunto de mapas mentais sobre geografia física",
      url: "#",
      dateAdded: "2023-05-22",
      isFavorite: true,
      tags: ["mapas mentais", "geografia física"]
    },
  ]);

  const [newResource, setNewResource] = useState({
    title: "",
    type: "document",
    format: "pdf",
    subject: "",
    description: "",
    url: "",
    tags: ""
  });

  const handleAddResource = () => {
    if (!newResource.title || !newResource.subject) {
      return;
    }

    const resource = {
      id: Date.now().toString(),
      title: newResource.title,
      type: newResource.type,
      format: newResource.format,
      subject: newResource.subject,
      description: newResource.description,
      url: newResource.url || "#",
      dateAdded: new Date().toISOString().split('T')[0],
      isFavorite: false,
      tags: newResource.tags ? newResource.tags.split(',').map(tag => tag.trim()) : []
    };

    setResources([...resources, resource]);
    setNewResource({
      title: "",
      type: "document",
      format: "pdf",
      subject: "",
      description: "",
      url: "",
      tags: ""
    });
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setResources(
      resources.map(resource => 
        resource.id === id 
          ? { ...resource, isFavorite: !resource.isFavorite } 
          : resource
      )
    );
  };

  // Filtrar recursos
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === "all" || resource.subject === selectedSubject;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  // Obter lista única de matérias
  const subjects = Array.from(new Set(resources.map(resource => resource.subject)));

  // Renderizar ícone com base no tipo
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6" />;
      case "video":
        return <Video className="h-6 w-6" />;
      case "audio":
        return <FileAudio className="h-6 w-6" />;
      case "image":
        return <FileImage className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <PageTitle title="Recursos" subtitle="Gerencie seus materiais de estudo">
        <Dialog>
          <DialogTrigger asChild>
            <Button data-trigger="add-resource">
              <Plus className="mr-2 h-4 w-4" />
              Novo Recurso
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
                  placeholder="Ex: Apostila de Matemática"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-type" className="col-span-1">
                  Tipo
                </Label>
                <Select 
                  onValueChange={(value) => setNewResource({ ...newResource, type: value })}
                  value={newResource.type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="audio">Áudio</SelectItem>
                    <SelectItem value="image">Imagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-format" className="col-span-1">
                  Formato
                </Label>
                <Select 
                  onValueChange={(value) => setNewResource({ ...newResource, format: value })}
                  value={newResource.format}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-tags" className="col-span-1">
                  Tags
                </Label>
                <Input
                  id="resource-tags"
                  className="col-span-3"
                  value={newResource.tags}
                  onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                  placeholder="Ex: álgebra, matrizes (separadas por vírgula)"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource-description" className="col-span-1">
                  Descrição
                </Label>
                <Textarea
                  id="resource-description"
                  className="col-span-3"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Descrição do recurso..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddResource}>Adicionar Recurso</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar recursos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-filter">Matéria</Label>
                <Select 
                  onValueChange={setSelectedSubject}
                  value={selectedSubject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as matérias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as matérias</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Tipo</Label>
                <Select 
                  onValueChange={setSelectedType}
                  value={selectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="document">Documentos</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="audio">Áudios</SelectItem>
                    <SelectItem value="image">Imagens</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="favorites-only" 
                  checked={favorites.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFavorites(resources.filter(r => r.isFavorite).map(r => r.id));
                    } else {
                      setFavorites([]);
                    }
                  }}
                />
                <Label htmlFor="favorites-only">Mostrar apenas favoritos</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubject(undefined);
                  setSelectedType(undefined);
                  setFavorites([]);
                }}
              >
                Limpar Filtros
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de recursos</span>
                  <span className="font-medium">{resources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Documentos</span>
                  <span className="font-medium">{resources.filter(r => r.type === "document").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vídeos</span>
                  <span className="font-medium">{resources.filter(r => r.type === "video").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Áudios</span>
                  <span className="font-medium">{resources.filter(r => r.type === "audio").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Imagens</span>
                  <span className="font-medium">{resources.filter(r => r.type === "image").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Favoritos</span>
                  <span className="font-medium">{resources.filter(r => r.isFavorite).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grade</TabsTrigger>
                <TabsTrigger value="list">Lista</TabsTrigger>
              </TabsList>
              <span className="text-sm text-muted-foreground">
                {filteredResources.length} recursos encontrados
              </span>
            </div>

            <TabsContent value="grid" className="animate-fade-in">
              {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-primary/10 p-2">
                              {renderTypeIcon(resource.type)}
                            </div>
                            <CardTitle className="text-base">{resource.title}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(resource.id)}
                            className={resource.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{resource.subject}</Badge>
                          <Badge variant="secondary">{resource.format.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {resource.dateAdded}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Paperclip className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">Nenhum recurso encontrado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Não encontramos recursos que correspondam aos seus filtros.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => document.querySelector('[data-trigger="add-resource"]')?.dispatchEvent(new Event('click'))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Recurso
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="animate-fade-in">
              {filteredResources.length > 0 ? (
                <div className="space-y-2">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id}>
                      <div className="flex items-start p-4 gap-4">
                        <div className="rounded-md bg-primary/10 p-2 shrink-0">
                          {renderTypeIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {resource.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(resource.id)}
                              className={resource.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{resource.subject}</Badge>
                            <Badge variant="secondary">{resource.format.toUpperCase()}</Badge>
                            {resource.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {resource.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{resource.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <div className="text-xs text-muted-foreground text-right">
                            {resource.dateAdded}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteResource(resource.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Paperclip className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">Nenhum recurso encontrado</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Não encontramos recursos que correspondam aos seus filtros.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => document.querySelector('[data-trigger="add-resource"]')?.dispatchEvent(new Event('click'))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Recurso
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
