import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { AircraftForm } from '@/components/aircraft/AircraftForm';
import { AircraftTable } from '@/components/aircraft/AircraftTable';
import { useAircraftList, useCreateAircraft, useUpdateAircraft, useDeleteAircraft } from '@/hooks/aircraft';
import { useClientsList } from '@/hooks/clients';
import type { AircraftRecord, CreateAircraftInput, UpdateAircraftInput } from '@/types/aircraft';

// Schema de validação para o formulário
const aircraftSchema = z.object({
  client_id: z.string().min(1, 'Proprietário é obrigatório'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  config: z.string().optional().default(''),
  description: z.string().optional().default(''),
  active: z.boolean().default(true)
});

type AircraftFormData = z.infer<typeof aircraftSchema>;

/**
 * Página de gerenciamento de aeronaves
 */
export default function Aircraft() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<AircraftRecord | null>(null);
  const navigate = useNavigate();

  // Hooks para aeronaves
  const { data: aircraftResponse, isLoading: isLoadingAircraft, refetch } = useAircraftList();
  // console.log('Debug - aircraftResponse:', aircraftResponse);
  const aircraft = aircraftResponse || [];
  // console.log('Debug - aircraft:', aircraft);
  const createMutation = useCreateAircraft({
    onSuccess: () => {
      toast.success('Aeronave criada com sucesso!');
      setIsDialogOpen(false);
      refetch();
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar aeronave');
    }
  });
  const updateMutation = useUpdateAircraft({
    onSuccess: () => {
      toast.success('Aeronave atualizada com sucesso!');
      setIsDialogOpen(false);
      setEditingAircraft(null);
      refetch();
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar aeronave');
    }
  });
  const deleteMutation = useDeleteAircraft({
    onSuccess: () => {
      toast.success('Aeronave excluída com sucesso!');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao excluir aeronave');
    }
  });

  // Hook para clientes (proprietários)
  const { data: clientsResponse, isLoading: isLoadingClients } = useClientsList();
  const clients = clientsResponse?.data || [];

  // Formulário
  const form = useForm<AircraftFormData>({
    resolver: zodResolver(aircraftSchema),
    defaultValues: {
      client_id: '',
      matricula: '',
      config: '',
      description: '',
      active: true
    }
  });

  /**
   * Manipula o envio do formulário
   */
  const onSubmit = async (data: AircraftFormData) => {
    try {
      if (editingAircraft) {
        const updateData: UpdateAircraftInput = {
          client_id: data.client_id,
          matricula: data.matricula,
          config: data.config || '',
          description: data.description || '',
          active: data.active
        };
        await updateMutation.mutateAsync({ id: editingAircraft.id, data: updateData });
      } else {
        const createData: CreateAircraftInput = {
          client_id: data.client_id,
          matricula: data.matricula,
          config: data.config || '',
          description: data.description || '',
          active: data.active
        };
        await createMutation.mutateAsync(createData);
      }
    } catch (error) {
      // Erro já tratado nos hooks de mutação
    }
  };

  /**
   * Abre o diálogo para criar nova aeronave
   */
  const handleCreate = () => {
    setEditingAircraft(null);
    form.reset({
      client_id: '',
      matricula: '',
      config: '',
      description: '',
      active: true
    });
    setIsDialogOpen(true);
  };

  /**
   * Abre o diálogo para editar aeronave
   */
  const handleEdit = (aircraft: AircraftRecord) => {
    setEditingAircraft(aircraft);
    form.reset({
      client_id: aircraft.client_id,
      matricula: aircraft.matricula,
      config: aircraft.config || '',
      description: aircraft.description || '',
      active: aircraft.active
    });
    setIsDialogOpen(true);
  };

  /**
   * Exclui uma aeronave
   */
  const handleDelete = async (aircraft: AircraftRecord) => {
    try {
      await deleteMutation.mutateAsync(aircraft.id);
    } catch (error) {
      // Erro já tratado no hook de mutação
    }
  };

  /**
   * Cancela a edição/criação
   */
  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingAircraft(null);
    form.reset();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Aeronaves</CardTitle>
              <CardDescription>
                Cadastre e gerencie as aeronaves dos seus clientes
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Aeronave
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AircraftTable
            aircraft={aircraft}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(aircraft) => navigate(`/aircraft/${aircraft.id}`)}
            isLoading={isLoadingAircraft}
          />
        </CardContent>
      </Card>

      {/* Dialog para criar/editar aeronave */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAircraft ? 'Editar Aeronave' : 'Nova Aeronave'}
            </DialogTitle>
            <DialogDescription>
              {editingAircraft
                ? 'Atualize as informações da aeronave'
                : 'Preencha os dados para cadastrar uma nova aeronave'
              }
            </DialogDescription>
          </DialogHeader>
          <AircraftForm
            form={form}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            editingAircraft={editingAircraft}
            clients={clients}
            isLoadingClients={isLoadingClients}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}