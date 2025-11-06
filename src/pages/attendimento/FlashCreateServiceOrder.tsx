import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TwoStepServiceOrderForm from '@/components/serviceOrders/TwoStepServiceOrderForm';

/**
 * Página de criação rápida de Ordem de Serviço
 * Utilizada a partir do workflow para criar O.S. de forma otimizada
 */
export const FlashCreateServiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extrair parâmetros da URL
  const workflowOrigin = searchParams.get('workflowOrigin');
  const returnTo = searchParams.get('returnTo');
  const stageId = searchParams.get('stageId');
  const funnelId = searchParams.get('funnelId');
  const returnParams = searchParams.get('returnParams');

  /**
   * Handler para cancelamento - retorna ao workflow
   */
  const handleCancel = () => {
    if (returnTo) {
      // Reconstrói a URL de retorno com os parâmetros originais
      const returnUrl = new URL(returnTo, window.location.origin);
      if (returnParams) {
        const params = new URLSearchParams(returnParams);
        params.forEach((value, key) => {
          returnUrl.searchParams.set(key, value);
        });
      }
      navigate(returnUrl.pathname + returnUrl.search);
    } else {
      // Fallback para o workflow padrão
      navigate('/attendimento/workflow');
    }
  };

  /**
   * Handler para sucesso na criação - retorna ao workflow
   */
  const handleSuccess = () => {
    if (returnTo) {
      // Reconstrói a URL de retorno com os parâmetros originais
      const returnUrl = new URL(returnTo, window.location.origin);
      if (returnParams) {
        const params = new URLSearchParams(returnParams);
        params.forEach((value, key) => {
          returnUrl.searchParams.set(key, value);
        });
      }
      navigate(returnUrl.pathname + returnUrl.search);
    } else {
      // Fallback para o workflow padrão
      navigate('/attendimento/workflow');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Workflow
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Criação Rápida de O.S.
          </h1>
          <p className="text-gray-600 mt-2">
            Crie uma nova Ordem de Serviço de forma otimizada e retorne ao workflow
          </p>
          {workflowOrigin && (
            <p className="text-sm text-blue-600 mt-1">
              Origem: {workflowOrigin}
            </p>
          )}
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <TwoStepServiceOrderForm
            onCancel={handleCancel}
            onSuccess={handleSuccess}
            stageId={stageId}
            funnelId={funnelId}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashCreateServiceOrder;