import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientRecord } from '@/types/clients';
import { Mail, Phone } from 'lucide-react';
interface ClientsTableProps {
  clients: ClientRecord[];
  onEdit: (client: ClientRecord) => void;
  onDelete: (client: ClientRecord) => void;
  onView?: (client: ClientRecord) => void;
  isLoading: boolean;
}

export function ClientsTable({ clients, onEdit, onDelete, onView, isLoading }: ClientsTableProps) {
  if (isLoading) {
    return <div className="text-center py-4">Carregando clientes...</div>;
  }
  
  if (clients.length === 0) {
    return <div className="text-center py-4">Nenhum cliente encontrado</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Localização</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>
              {client.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</div>}
              {client.config?.celular && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.config.celular}</div>}
            </TableCell>
            <TableCell>
              {client.tipo_pessoa === 'pf' ? client.cpf : client.cnpj}
            </TableCell>
            <TableCell>
              {client.config?.cidade && `${client.config.cidade}/${client.config.uf}`}
            </TableCell>
            <TableCell>
              <Badge className={client.ativo === 's' ? "success" : "destructive"}>
                {client.ativo === 's' ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(client)}>
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(client)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(client)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}