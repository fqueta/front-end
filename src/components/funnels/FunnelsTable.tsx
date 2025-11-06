import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Power, 
  PowerOff,
  Search,
  Plus,
  Filter,
  BarChart3
} from "lucide-react";
import { Funnel as FunnelType } from "@/types";

interface FunnelsTableProps {
  funnels: FunnelType[];
  isLoading: boolean;
  onEdit: (funnel: FunnelType) => void;
  onDelete: (id: string) => void;
  onView: (funnel: FunnelType) => void;
  onDuplicate: (funnel: FunnelType) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onCreate: () => void;
  onViewStats: (funnel: FunnelType) => void;
}

/**
 * Componente de tabela para exibir e gerenciar funis
 */
export default function FunnelsTable({
  funnels,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onToggleStatus,
  onCreate,
  onViewStats
}: FunnelsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<FunnelType | null>(null);

  // Filtrar funis baseado no termo de busca
  const filteredFunnels = funnels.filter(funnel =>
    funnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (funnel.description && funnel.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /**
   * Confirma a exclusão do funil
   */
  const handleDeleteConfirm = () => {
    if (funnelToDelete) {
      onDelete(funnelToDelete.id);
      setDeleteDialogOpen(false);
      setFunnelToDelete(null);
    }
  };

  /**
   * Abre o diálogo de confirmação de exclusão
   */
  const handleDeleteClick = (funnel: FunnelType) => {
    setFunnelToDelete(funnel);
    setDeleteDialogOpen(true);
  };

  /**
   * Formata a data de criação
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Funis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  // console.log('funnels', funnels);
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Funis
              </CardTitle>
              <CardDescription>
                Gerencie os funis do seu sistema de vendas e atendimento
              </CardDescription>
            </div>
            <Button onClick={onCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Funil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barra de Busca */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar funis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          {filteredFunnels.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhum funil encontrado" : "Nenhum funil cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente ajustar os termos de busca"
                  : "Comece criando seu primeiro funil para organizar seu processo"
                }
              </p>
              {!searchTerm && (
                <Button onClick={onCreate} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Funil
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Nome
                      </div>
                    </TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunnels.map((funnel) => (
                    <TableRow key={funnel.id}>
                      <TableCell className="font-medium">
                        {funnel.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {funnel.description || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: funnel.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {funnel.color}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={funnel.isActive ? "default" : "secondary"}>
                          {funnel.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(funnel.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(funnel)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewStats(funnel)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Estatísticas
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(funnel)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(funnel)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onToggleStatus(funnel.id, !funnel.isActive)}
                            >
                              {funnel.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(funnel)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funil "{funnelToDelete?.name}"?
              Esta ação não pode ser desfeita e todas as etapas e dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}