import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Code,
  Database,
  Globe,
  Settings
} from "lucide-react";

/**
 * Página de teste para desenvolvimento e debugging
 * Inclui componentes de UI, testes de API e funcionalidades gerais
 */
export default function Test() {
  const [testInput, setTestInput] = useState("");
  const [testTextarea, setTestTextarea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  /**
   * Função para testar notificações toast
   */
  const testToast = () => {
    toast.success("Toast de sucesso funcionando!", {
      description: "Este é um teste da funcionalidade de notificação."
    });
  };

  /**
   * Função para testar loading state
   */
  const testLoading = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.info("Teste de loading concluído!");
  };

  /**
   * Função para adicionar resultado de teste
   */
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  /**
   * Função para limpar resultados
   */
  const clearResults = () => {
    setTestResults([]);
    toast.info("Resultados limpos!");
  };

  /**
   * Função para testar componentes de UI
   */
  const testUIComponents = () => {
    addTestResult("Teste de componentes UI executado");
    toast.success("Componentes UI testados com sucesso!");
  };
  /**
   * constate para carregar opções de select
   */
  const [selectOptions, setSelectOptions] = useState([
    { value: "1", label: "Opção 1" },
    { value: "2", label: "Opção 2" },
    { value: "3", label: "Opção 3" },
  ]);
  const selectOptions2 = [
    { value: "4", label: "Opção 4" },
    { value: "5", label: "Opção 5" },
    { value: "6", label: "Opção 6" },
    { value: "7", label: "Opção 7" },
    { value: "8", label: "Opção 8" },
    { value: "9", label: "Opção 9" },
    { value: "10", label: "Opção 10" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Página de Teste</h1>
          <p className="text-muted-foreground">
            Ambiente para testes de desenvolvimento e debugging
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Testes de UI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Testes de Interface
            </CardTitle>
            <CardDescription>
              Teste os componentes de UI e interações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Input de Teste</Label>
              <Input
                id="test-input"
                placeholder="Digite algo para testar..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-textarea">Textarea de Teste</Label>
              <Textarea
                id="test-textarea"
                placeholder="Digite um texto mais longo..."
                value={testTextarea}
                onChange={(e) => setTestTextarea(e.target.value)}
                rows={3}
              />
            </div>
            {/* <div>
              <label htmlFor="test-select-multi">Select Multip</label>
              <Select isMulti options={selectOptions2} />
            </div> */}
            <div>
              <label htmlFor="test-select">Select de teste</label>
              <Select
                id="test-select"
                options={selectOptions}
                value={selectOptions[0].value}
                onChange={(e) => {alert(e.target.value)}}
              >
                <SelectTrigger>
                  <SelectContent>
                    {selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Badge Padrão</Badge>
              <Badge variant="secondary">Badge Secundário</Badge>
              <Badge variant="destructive">Badge Destrutivo</Badge>
              <Badge variant="outline">Badge Outline</Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={testUIComponents}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Testar UI
              </Button>
              <Button variant="outline" onClick={testToast}>
                Testar Toast
              </Button>
              <Button  onClick={() => setSelectOptions([...selectOptions, ...selectOptions2])}>
                Add Opção ao Select
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card de Testes de Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Testes de Sistema
            </CardTitle>
            <CardDescription>
              Teste funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={testLoading}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Carregando..." : "Teste Loading"}
              </Button>

              <Button 
                variant="outline"
                onClick={() => addTestResult("Teste manual executado")}
                className="w-full"
              >
                <Globe className="h-4 w-4 mr-2" />
                Teste Manual
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Resultados dos Testes</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearResults}
                  disabled={testResults.length === 0}
                >
                  Limpar
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum teste executado ainda...
                  </p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <p key={index} className="text-sm font-mono">
                        {result}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Informações do Sistema */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>
              Dados úteis para desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Status da Aplicação
                </h4>
                <p className="text-sm text-muted-foreground">
                  Aplicação funcionando corretamente
                </p>
                <Badge variant="outline" className="text-green-600">
                  Online
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Ambiente
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ambiente de desenvolvimento
                </p>
                <Badge variant="outline" className="text-blue-600">
                  Development
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Code className="h-4 w-4 text-purple-500" />
                  Versão
                </h4>
                <p className="text-sm text-muted-foreground">
                  Versão atual do sistema
                </p>
                <Badge variant="outline" className="text-purple-600">
                  v3.0.0
                </Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-md">
              <h4 className="font-semibold mb-2">Dados de Entrada:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Input:</strong> {testInput || "Vazio"}</p>
                <p><strong>Textarea:</strong> {testTextarea || "Vazio"}</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}