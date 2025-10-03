/**
 * Sistema de tratamento de erros para módulo financeiro
 * Fornece tipos e classes específicas para diferentes tipos de erros
 */

// Tipos de erro específicos do módulo financeiro
export enum FinancialErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Códigos de erro específicos
export enum FinancialErrorCode {
  // Validação
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DATE = 'INVALID_DATE',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  
  // Regras de negócio
  ACCOUNT_ALREADY_PAID = 'ACCOUNT_ALREADY_PAID',
  ACCOUNT_ALREADY_RECEIVED = 'ACCOUNT_ALREADY_RECEIVED',
  ACCOUNT_CANCELLED = 'ACCOUNT_CANCELLED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  OVERDUE_ACCOUNT = 'OVERDUE_ACCOUNT',
  
  // Recursos não encontrados
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  SUPPLIER_NOT_FOUND = 'SUPPLIER_NOT_FOUND',
  
  // Conflitos
  DUPLICATE_INVOICE = 'DUPLICATE_INVOICE',
  CATEGORY_IN_USE = 'CATEGORY_IN_USE',
  
  // Serviços externos
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',
  BANK_API_ERROR = 'BANK_API_ERROR',
  
  // Sistema
  DATABASE_ERROR = 'DATABASE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

// Interface base para erros financeiros
export interface FinancialErrorDetails {
  type: FinancialErrorType;
  code: FinancialErrorCode;
  message: string;
  field?: string;
  value?: any;
  timestamp: string;
  requestId?: string;
  userId?: string;
}

// Classe base para erros financeiros
export class FinancialError extends Error {
  public readonly type: FinancialErrorType;
  public readonly code: FinancialErrorCode;
  public readonly field?: string;
  public readonly value?: any;
  public readonly timestamp: string;
  public readonly requestId?: string;
  public readonly userId?: string;

  constructor(details: FinancialErrorDetails) {
    super(details.message);
    this.name = 'FinancialError';
    this.type = details.type;
    this.code = details.code;
    this.field = details.field;
    this.value = details.value;
    this.timestamp = details.timestamp;
    this.requestId = details.requestId;
    this.userId = details.userId;
  }

  /**
   * Converte o erro para um objeto JSON
   */
  toJSON(): FinancialErrorDetails {
    return {
      type: this.type,
      code: this.code,
      message: this.message,
      field: this.field,
      value: this.value,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId
    };
  }

  /**
   * Verifica se é um erro de validação
   */
  isValidationError(): boolean {
    return this.type === FinancialErrorType.VALIDATION_ERROR;
  }

  /**
   * Verifica se é um erro de regra de negócio
   */
  isBusinessRuleError(): boolean {
    return this.type === FinancialErrorType.BUSINESS_RULE_ERROR;
  }

  /**
   * Verifica se é um erro de rede
   */
  isNetworkError(): boolean {
    return this.type === FinancialErrorType.NETWORK_ERROR;
  }
}

// Classes específicas para diferentes tipos de erro
export class ValidationError extends FinancialError {
  constructor(code: FinancialErrorCode, message: string, field?: string, value?: any) {
    super({
      type: FinancialErrorType.VALIDATION_ERROR,
      code,
      message,
      field,
      value,
      timestamp: new Date().toISOString()
    });
  }
}

export class BusinessRuleError extends FinancialError {
  constructor(code: FinancialErrorCode, message: string, details?: any) {
    super({
      type: FinancialErrorType.BUSINESS_RULE_ERROR,
      code,
      message,
      value: details,
      timestamp: new Date().toISOString()
    });
  }
}

export class NotFoundError extends FinancialError {
  constructor(code: FinancialErrorCode, message: string, resourceId?: string) {
    super({
      type: FinancialErrorType.NOT_FOUND_ERROR,
      code,
      message,
      value: resourceId,
      timestamp: new Date().toISOString()
    });
  }
}

export class NetworkError extends FinancialError {
  constructor(message: string, originalError?: Error) {
    super({
      type: FinancialErrorType.NETWORK_ERROR,
      code: FinancialErrorCode.TIMEOUT_ERROR,
      message,
      value: originalError?.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  [FinancialErrorCode.INVALID_AMOUNT]: 'Valor inválido. Deve ser um número positivo.',
  [FinancialErrorCode.INVALID_DATE]: 'Data inválida. Use o formato YYYY-MM-DD.',
  [FinancialErrorCode.REQUIRED_FIELD]: 'Este campo é obrigatório.',
  [FinancialErrorCode.ACCOUNT_ALREADY_PAID]: 'Esta conta já foi paga.',
  [FinancialErrorCode.ACCOUNT_ALREADY_RECEIVED]: 'Esta conta já foi recebida.',
  [FinancialErrorCode.ACCOUNT_CANCELLED]: 'Esta conta foi cancelada.',
  [FinancialErrorCode.INSUFFICIENT_BALANCE]: 'Saldo insuficiente para esta operação.',
  [FinancialErrorCode.OVERDUE_ACCOUNT]: 'Esta conta está vencida.',
  [FinancialErrorCode.ACCOUNT_NOT_FOUND]: 'Conta não encontrada.',
  [FinancialErrorCode.CATEGORY_NOT_FOUND]: 'Categoria não encontrada.',
  [FinancialErrorCode.CUSTOMER_NOT_FOUND]: 'Cliente não encontrado.',
  [FinancialErrorCode.SUPPLIER_NOT_FOUND]: 'Fornecedor não encontrado.',
  [FinancialErrorCode.DUPLICATE_INVOICE]: 'Número da fatura já existe.',
  [FinancialErrorCode.CATEGORY_IN_USE]: 'Categoria está sendo utilizada e não pode ser removida.',
  [FinancialErrorCode.PAYMENT_GATEWAY_ERROR]: 'Erro no gateway de pagamento.',
  [FinancialErrorCode.BANK_API_ERROR]: 'Erro na API do banco.',
  [FinancialErrorCode.DATABASE_ERROR]: 'Erro interno do sistema.',
  [FinancialErrorCode.TIMEOUT_ERROR]: 'Tempo limite da requisição excedido.'
} as const;

/**
 * Factory para criar erros financeiros
 */
export class FinancialErrorFactory {
  /**
   * Cria um erro de validação
   */
  static createValidationError(code: FinancialErrorCode, field?: string, value?: any): ValidationError {
    const message = ERROR_MESSAGES[code] || 'Erro de validação';
    return new ValidationError(code, message, field, value);
  }

  /**
   * Cria um erro de regra de negócio
   */
  static createBusinessRuleError(code: FinancialErrorCode, details?: any): BusinessRuleError {
    const message = ERROR_MESSAGES[code] || 'Erro de regra de negócio';
    return new BusinessRuleError(code, message, details);
  }

  /**
   * Cria um erro de recurso não encontrado
   */
  static createNotFoundError(code: FinancialErrorCode, resourceId?: string): NotFoundError {
    const message = ERROR_MESSAGES[code] || 'Recurso não encontrado';
    return new NotFoundError(code, message, resourceId);
  }

  /**
   * Cria um erro de rede
   */
  static createNetworkError(message?: string, originalError?: Error): NetworkError {
    return new NetworkError(message || 'Erro de conexão', originalError);
  }

  /**
   * Cria um erro a partir de uma resposta HTTP
   */
  static fromHttpResponse(status: number, data: any): FinancialError {
    const timestamp = new Date().toISOString();
    
    switch (status) {
      case 400:
        return new ValidationError(
          FinancialErrorCode.REQUIRED_FIELD,
          data.message || 'Dados inválidos'
        );
      case 401:
        return new FinancialError({
          type: FinancialErrorType.AUTHENTICATION_ERROR,
          code: FinancialErrorCode.DATABASE_ERROR,
          message: 'Não autorizado',
          timestamp
        });
      case 403:
        return new FinancialError({
          type: FinancialErrorType.AUTHORIZATION_ERROR,
          code: FinancialErrorCode.DATABASE_ERROR,
          message: 'Acesso negado',
          timestamp
        });
      case 404:
        return new NotFoundError(
          FinancialErrorCode.ACCOUNT_NOT_FOUND,
          data.message || 'Recurso não encontrado'
        );
      case 409:
        return new FinancialError({
          type: FinancialErrorType.CONFLICT_ERROR,
          code: FinancialErrorCode.DUPLICATE_INVOICE,
          message: data.message || 'Conflito de dados',
          timestamp
        });
      case 422:
        return new BusinessRuleError(
          FinancialErrorCode.ACCOUNT_ALREADY_PAID,
          data.message || 'Regra de negócio violada'
        );
      case 500:
        return new FinancialError({
          type: FinancialErrorType.UNKNOWN_ERROR,
          code: FinancialErrorCode.DATABASE_ERROR,
          message: 'Erro interno do servidor',
          timestamp
        });
      default:
        return new FinancialError({
          type: FinancialErrorType.UNKNOWN_ERROR,
          code: FinancialErrorCode.DATABASE_ERROR,
          message: data.message || 'Erro desconhecido',
          timestamp
        });
    }
  }
}

/**
 * Utilitários para tratamento de erros
 */
export class FinancialErrorHandler {
  /**
   * Converte um erro para uma mensagem amigável ao usuário
   */
  static getUserFriendlyMessage(error: FinancialError): string {
    if (error.isValidationError()) {
      return `Erro de validação: ${error.message}`;
    }
    
    if (error.isBusinessRuleError()) {
      return error.message;
    }
    
    if (error.isNetworkError()) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  /**
   * Determina se o erro deve ser reportado para monitoramento
   */
  static shouldReport(error: FinancialError): boolean {
    // Não reportar erros de validação e regras de negócio
    return !error.isValidationError() && !error.isBusinessRuleError();
  }

  /**
   * Extrai informações de contexto do erro
   */
  static getErrorContext(error: FinancialError): Record<string, any> {
    return {
      type: error.type,
      code: error.code,
      field: error.field,
      value: error.value,
      timestamp: error.timestamp,
      requestId: error.requestId,
      userId: error.userId
    };
  }
}

/**
 * Hook para tratamento de erros em componentes React
 */
export interface UseErrorHandlerReturn {
  handleError: (error: unknown) => void;
  clearError: () => void;
  error: FinancialError | null;
  hasError: boolean;
}

/**
 * Tipo para callback de tratamento de erro
 */
export type ErrorCallback = (error: FinancialError) => void;

/**
 * Interface para configuração de tratamento de erros
 */
export interface ErrorHandlerConfig {
  onError?: ErrorCallback;
  showToast?: boolean;
  reportError?: boolean;
  fallbackMessage?: string;
}