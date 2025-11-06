import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Database,
  Cloud
} from "lucide-react";
import { SyncStatus, SyncConflict } from "@/types";
import { useSyncMonitor } from "@/hooks/workflows";

interface SyncPanelProps {
  className?: string;
}

/**
 * Componente de painel para gerenciar sincronização de dados
 */
export default function SyncPanel({ className }: SyncPanelProps) {
  const [showForceDialog, setShowForceDialog] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);
  
  const {
    status,
    isLoading,
    error,
    refetch,
    syncLocal,
    forceSync,
    pushLocal,
    resolveConflicts,
    isSyncing,
    syncError
  } = useSyncMonitor();

  /**
   * Formata a data da última sincronização
   */
  const formatLastSync = (dateString?: string) => {
    if (!dateString) return "Nunca";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  };

  /**
   * Retorna o ícone de status baseado no estado da sincronização
   */
  const getStatusIcon = () => {
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error || syncError) return <XCircle className="h-4 w-4 text-destructive" />;
    if (status?.hasConflicts) return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (status?.isOnline) return <CheckCircle className="h-4 w-4 text-success" />;
    return <WifiOff className="h-4 w-4 text-muted-foreground" />;
  };

  /**
   * Retorna a cor do badge baseado no status
   */
  const getStatusVariant = () => {
    if (isSyncing) return "secondary";
    if (error || syncError) return "destructive";
    if (status?.hasConflicts) return "warning";
    if (status?.isOnline) return "default";
    return "secondary";
  };

  /**
   * Retorna o texto do status
   */
  const getStatusText = () => {
    if (isSyncing) return "Sincronizando...";
    if (error || syncError) return "Erro na sincronização";
    if (status?.hasConflicts) return "Conflitos detectados";
    if (status?.isOnline) return "Sincronizado";
    return "Offline";
  };

  /**
   * Confirma e executa sincronização forçada
   */
  const handleForceSync = () => {
    forceSync();
    setShowForceDialog(false);
  };

  /**
   * Confirma e executa push dos dados locais
   */
  const handlePushLocal = () => {
    pushLocal();
    setShowPushDialog(false);
  };

  /**
   * Resolve conflitos automaticamente (aceita dados da API)
   */
  const handleAutoResolveConflicts = () => {
    if (status?.conflicts) {
      const resolvedConflicts = status.conflicts.map(conflict => ({
        ...conflict,
        resolution: 'api' as const
      }));
      resolveConflicts(resolvedConflicts);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sincronização
              </CardTitle>
              <CardDescription>
                Status da sincronização com a API
              </CardDescription>
            </div>
            <Badge variant={getStatusVariant()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações de Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wifi className="h-4 w-4" />
                Conexão
              </div>
              <div className="font-medium">
                {status?.isOnline ? "Online" : "Offline"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Última Sync
              </div>
              <div className="font-medium">
                {formatLastSync(status?.lastSync)}
              </div>
            </div>
          </div>

          {/* Progresso de Sincronização */}
          {isSyncing && status?.syncProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{status.syncProgress.percentage}%</span>
              </div>
              <Progress value={status.syncProgress.percentage} />
              <p className="text-xs text-muted-foreground">
                {status.syncProgress.currentStep}
              </p>
            </div>
          )}

          {/* Estatísticas */}
          {status && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {status.pendingChanges || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Pendentes
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {status.syncedItems || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Sincronizados
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {status.conflicts?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Conflitos
                </div>
              </div>
            </div>
          )}

          {/* Conflitos */}
          {status?.hasConflicts && status.conflicts && (
            <div className="space-y-2">
              <Separator />
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-warning">
                  Conflitos Detectados
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAutoResolveConflicts}
                  disabled={isSyncing}
                >
                  Resolver Automaticamente
                </Button>
              </div>
              <div className="space-y-1">
                {status.conflicts.slice(0, 3).map((conflict, index) => (
                  <div key={index} className="text-xs p-2 bg-warning/10 rounded">
                    <div className="font-medium">{conflict.entityType}</div>
                    <div className="text-muted-foreground">{conflict.description}</div>
                  </div>
                ))}
                {status.conflicts.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{status.conflicts.length - 3} conflitos adicionais
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Erro */}
          {(error || syncError) && (
            <div className="space-y-2">
              <Separator />
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <XCircle className="h-4 w-4" />
                  Erro na Sincronização
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {error?.message || syncError?.message || "Erro desconhecido"}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Ações */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncLocal()}
                disabled={isSyncing || !status?.isOnline}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sincronizar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={refetch}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Atualizar Status
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForceDialog(true)}
                disabled={isSyncing || !status?.isOnline}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar da API
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPushDialog(true)}
                disabled={isSyncing || !status?.isOnline || !status?.pendingChanges}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Enviar Local
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação - Força Sync */}
      <AlertDialog open={showForceDialog} onOpenChange={setShowForceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Baixar Dados da API</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá sobrescrever todos os dados locais com os dados da API.
              Todas as alterações não sincronizadas serão perdidas.
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceSync}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Confirmação - Push Local */}
      <AlertDialog open={showPushDialog} onOpenChange={setShowPushDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar Dados Locais</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá enviar todas as alterações locais para a API.
              Os dados na API serão atualizados com as informações locais.
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePushLocal}>
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}