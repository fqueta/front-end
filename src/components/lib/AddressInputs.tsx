import { useEffect, useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MaskedInputField } from '@/components/lib/MaskedInputField';
import { cepApplyMask, cepRemoveMask } from '@/lib/masks/cep-apply-mask';
import { Controller } from 'react-hook-form';
import InputMask from "react-input-mask-next";

interface AddressInputsProps {
  form: any;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function AddressInputs({form}: AddressInputsProps){
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const numeroInputRef = useRef<HTMLInputElement>(null);

  /**
   * Função para buscar dados do CEP na API ViaCEP
   * @param cep - CEP limpo (apenas números)
   */
  const fetchCepData = async (cep: string) => {
    if (cep.length !== 8) return;
    
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await response.json();
      
      if (!data.erro) {
        // Preenche os campos automaticamente
        form.setValue("config.endereco", data.logradouro || "");
        form.setValue("config.bairro", data.bairro || "");
        form.setValue("config.cidade", data.localidade || "");
        form.setValue("config.uf", data.uf || "");
        
        // Foca no campo número após preencher os dados
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  /**
   * Manipula a mudança do CEP
   * @param value - Valor do CEP com máscara
   */
  const handleCepChange = (value: string) => {
    const cleanCep = cepRemoveMask(value);
    
    // Atualiza o valor no formulário
    form.setValue("cep", value);
    
    // Se o CEP tem 8 dígitos, busca os dados
    if (cleanCep.length === 8) {
      fetchCepData(cleanCep);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Campo CEP com máscara e busca automática */}
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP {isLoadingCep && "(Buscando...)"}</FormLabel>
            <FormControl>
              <Controller
                name="cep"
                control={form.control}
                render={({ field }) => (
                  <InputMask
                    mask="99999-999"
                    value={field.value || ""}
                    onChange={(e) => {
                        field.onChange(e.target.value);
                        handleCepChange(e.target.value);
                    }}
                    disabled={isLoadingCep}
                    inputRef={field.ref}
                    >
                    <Input 
                        placeholder="00000-000"
                    />
                    </InputMask>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="config.endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Endereço" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="config.numero"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input 
                placeholder="Número" 
                {...field} 
                value={field.value || ''}
                ref={numeroInputRef}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="config.complemento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Complemento" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="config.bairro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro</FormLabel>
            <FormControl>
              <Input placeholder="Bairro" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="config.cidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
            <FormControl>
              <Input placeholder="Cidade" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="config.uf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>UF</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="AL">AL</SelectItem>
                <SelectItem value="AP">AP</SelectItem>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="BA">BA</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="DF">DF</SelectItem>
                <SelectItem value="ES">ES</SelectItem>
                <SelectItem value="GO">GO</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="MT">MT</SelectItem>
                <SelectItem value="MS">MS</SelectItem>
                <SelectItem value="MG">MG</SelectItem>
                <SelectItem value="PA">PA</SelectItem>
                <SelectItem value="PB">PB</SelectItem>
                <SelectItem value="PR">PR</SelectItem>
                <SelectItem value="PE">PE</SelectItem>
                <SelectItem value="PI">PI</SelectItem>
                <SelectItem value="RJ">RJ</SelectItem>
                <SelectItem value="RN">RN</SelectItem>
                <SelectItem value="RS">RS</SelectItem>
                <SelectItem value="RO">RO</SelectItem>
                <SelectItem value="RR">RR</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="SP">SP</SelectItem>
                <SelectItem value="SE">SE</SelectItem>
                <SelectItem value="TO">TO</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}