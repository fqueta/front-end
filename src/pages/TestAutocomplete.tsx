import React, { useState } from 'react';
import { ClientRecord } from '@/types/clients';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { ClientAutocompleteSelect } from '@/components/clients/ClientAutocompleteSelect';
import { ClientAutocompleteDownshift } from '@/components/clients/ClientAutocompleteDownshift';

/**
 * Página de teste para comparar os componentes de autocomplete
 * Permite testar performance e compatibilidade com Firefox
 */
export const TestAutocomplete: React.FC = () => {
  const [selectedClient1, setSelectedClient1] = useState<ClientRecord | null>(null);
  const [selectedClient2, setSelectedClient2] = useState<ClientRecord | null>(null);
  const [selectedClient3, setSelectedClient3] = useState<ClientRecord | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teste de Componentes Autocomplete
        </h1>
        <p className="text-gray-600">
          Compare a performance dos diferentes componentes de autocomplete
        </p>
      </div>

      {/* Componente Original (Radix UI) */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          1. Componente Original (Radix UI + Command)
        </h2>
        <div className="space-y-4">
          <ClientAutocomplete
            onClientSelect={setSelectedClient1}
            selectedClient={selectedClient1}
            placeholder="Buscar cliente (Original)..."
          />
          {selectedClient1 && (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm font-medium">Cliente selecionado:</p>
              <p className="text-sm text-gray-600">
                {selectedClient1.name} - {selectedClient1.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Componente React-Select */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          2. React-Select (Recomendado)
        </h2>
        <div className="space-y-4">
          <ClientAutocompleteSelect
            onClientSelect={setSelectedClient2}
            selectedClient={selectedClient2}
            placeholder="Buscar cliente (React-Select)..."
          />
          {selectedClient2 && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm font-medium text-green-800">Cliente selecionado:</p>
              <p className="text-sm text-green-600">
                {selectedClient2.name} - {selectedClient2.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Componente Downshift */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          3. Downshift (Alternativa Leve)
        </h2>
        <div className="space-y-4">
          <ClientAutocompleteDownshift
            onClientSelect={setSelectedClient3}
            selectedClient={selectedClient3}
            placeholder="Buscar cliente (Downshift)..."
          />
          {selectedClient3 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Cliente selecionado:</p>
              <p className="text-sm text-blue-600">
                {selectedClient3.name} - {selectedClient3.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instruções de teste */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          Instruções para Teste
        </h3>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li>• <strong>Firefox:</strong> Teste especialmente no Firefox para verificar se o travamento foi resolvido</li>
          <li>• <strong>Performance:</strong> Digite rapidamente e observe a responsividade</li>
          <li>• <strong>Scroll:</strong> Use o scroll do mouse nos dropdowns para testar suavidade</li>
          <li>• <strong>Teclado:</strong> Use as setas e Enter para navegar</li>
          <li>• <strong>Busca:</strong> Digite nomes como "João", "Maria" ou emails</li>
        </ul>
      </div>

      {/* Resumo das seleções */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Resumo das Seleções
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">Original:</p>
            <p className="text-gray-600">
              {selectedClient1 ? selectedClient1.name : 'Nenhum cliente selecionado'}
            </p>
          </div>
          <div>
            <p className="font-medium">React-Select:</p>
            <p className="text-gray-600">
              {selectedClient2 ? selectedClient2.name : 'Nenhum cliente selecionado'}
            </p>
          </div>
          <div>
            <p className="font-medium">Downshift:</p>
            <p className="text-gray-600">
              {selectedClient3 ? selectedClient3.name : 'Nenhum cliente selecionado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAutocomplete;