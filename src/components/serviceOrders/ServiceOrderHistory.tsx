/**
 * Componente para exibir o histórico de alterações de uma ordem de serviço
 * Utiliza o sistema de auditoria para mostrar todas as mudanças realizadas
 */

import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  useServiceOrderAudit,
  ServiceOrderAuditEntry,
  ServiceOrderAuditEntityType,
  ServiceOrderAuditFormatter
} from '@/services/audit/ServiceOrderAudit';

interface ServiceOrderHistoryProps {
  /** ID da ordem de serviço para buscar o histórico */
  serviceOrderId: string;
  /** Número máximo de entradas a exibir (padrão: 10) */
  maxEntries?: number;
  /** Se deve mostrar apenas um resumo ou histórico completo */
  compact?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para exibir uma entrada individual do histórico
 */
const HistoryEntry: React.FC<{ 
  entry: ServiceOrderAuditEntry; 
  isExpanded: boolean; 
  onToggle: () => void;
}> = ({ entry, isExpanded, onToggle }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'UPDATE':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'DELETE':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'STATUS_CHANGE':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'STATUS_CHANGE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasDetails = entry.changes && entry.changes.length > 0;

  return (
    <div className="border-l-2 border-gray-200 pl-4 pb-4 relative">
      <div className="absolute -left-2 top-0 bg-white border-2 border-gray-200 rounded-full p-1">
        {getActionIcon(entry.action)}
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={getActionColor(entry.action)}>
              {ServiceOrderAuditFormatter.formatAction(entry.action)}
            </Badge>
            <span className="text-sm text-gray-500">
              {entry.timestamp.toLocaleString('pt-BR')}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-1">
            {ServiceOrderAuditFormatter.formatEntry(entry)}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>{entry.userName || 'Sistema'}</span>
          </div>
        </div>
        
        {hasDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {hasDetails && (
        <Collapsible open={isExpanded}>
          <CollapsibleContent className="mt-2">
            <div className="bg-gray-50 rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Detalhes das alterações:
              </h4>
              <ul className="space-y-1">
                {ServiceOrderAuditFormatter.formatChanges(entry.changes!).map((change, index) => (
                  <li key={index} className="text-xs text-gray-600">
                    • {change}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

/**
 * Componente principal do histórico de alterações
 */
export const ServiceOrderHistory: React.FC<ServiceOrderHistoryProps> = ({
  serviceOrderId,
  maxEntries = 10,
  compact = false,
  className = ''
}) => {
  const { auditService } = useServiceOrderAudit();
  const [history, setHistory] = useState<ServiceOrderAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    /**
     * Carrega o histórico de alterações da ordem de serviço
     */
    const loadHistory = () => {
      try {
        setLoading(true);
        const entries = auditService.getEntityHistory(
          ServiceOrderAuditEntityType.SERVICE_ORDER,
          serviceOrderId
        );
        
        // Limita o número de entradas se especificado
        const limitedEntries = maxEntries ? entries.slice(0, maxEntries) : entries;
        setHistory(limitedEntries);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [serviceOrderId, maxEntries, auditService]);

  /**
   * Alterna a expansão de uma entrada do histórico
   */
  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Nenhuma alteração registrada para esta ordem de serviço.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Alterações
          <Badge variant="secondary" className="ml-auto">
            {history.length} {history.length === 1 ? 'entrada' : 'entradas'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compact ? (
          // Versão compacta - apenas lista simples
          <div className="space-y-2">
            {history.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                <div className="flex-shrink-0">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {ServiceOrderAuditFormatter.formatEntry(entry)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
            {history.length > 3 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                E mais {history.length - 3} alterações...
              </p>
            )}
          </div>
        ) : (
          // Versão completa - timeline detalhada
          <div className="space-y-4">
            {history.map((entry) => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                isExpanded={expandedEntries.has(entry.id)}
                onToggle={() => toggleEntryExpansion(entry.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceOrderHistory;