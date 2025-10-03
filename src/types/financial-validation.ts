/**
 * Validações para entidades financeiras
 * Fornece funções de validação robustas para DTOs e formulários
 */

import { 
  CreateAccountPayableDto, 
  CreateAccountReceivableDto, 
  CreateCashFlowEntryDto,
  UpdateAccountDto,
  PaymentMethod,
  TransactionType,
  RecurrenceType
} from './financial';

// Tipos para resultados de validação
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Constantes de validação
export const VALIDATION_RULES = {
  DESCRIPTION: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255
  },
  AMOUNT: {
    MIN_VALUE: 0.01,
    MAX_VALUE: 999999999.99
  },
  INVOICE_NUMBER: {
    MAX_LENGTH: 50
  },
  NOTES: {
    MAX_LENGTH: 1000
  },
  INSTALLMENTS: {
    MIN_VALUE: 1,
    MAX_VALUE: 360
  }
} as const;

// Mensagens de erro padronizadas
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_FORMAT: 'Formato inválido',
  MIN_LENGTH: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `Deve ter no máximo ${max} caracteres`,
  MIN_VALUE: (min: number) => `Valor deve ser maior que ${min}`,
  MAX_VALUE: (max: number) => `Valor deve ser menor que ${max}`,
  INVALID_DATE: 'Data inválida',
  FUTURE_DATE_REQUIRED: 'Data deve ser futura',
  PAST_DATE_REQUIRED: 'Data deve ser passada ou atual',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_CURRENCY: 'Valor monetário inválido'
} as const;

/**
 * Valida se uma string não está vazia
 */
export const isRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Valida comprimento mínimo de string
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Valida comprimento máximo de string
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Valida se um valor numérico está dentro do range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida formato de data ISO
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('-');
};

/**
 * Valida se a data é futura
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Valida se a data é passada ou atual
 */
export const isPastOrCurrentDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
};

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida valor monetário
 */
export const isValidCurrency = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * Valida enum values
 */
export const isValidEnum = <T>(value: string, enumObject: Record<string, T>): boolean => {
  return Object.values(enumObject).includes(value as T);
};

/**
 * Validador para CreateAccountPayableDto
 */
export const validateCreateAccountPayable = (data: CreateAccountPayableDto): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validação de descrição
  if (!isRequired(data.description)) {
    errors.push({
      field: 'description',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
  } else if (!hasMinLength(data.description, VALIDATION_RULES.DESCRIPTION.MIN_LENGTH)) {
    errors.push({
      field: 'description',
      message: VALIDATION_MESSAGES.MIN_LENGTH(VALIDATION_RULES.DESCRIPTION.MIN_LENGTH),
      code: 'MIN_LENGTH'
    });
  } else if (!hasMaxLength(data.description, VALIDATION_RULES.DESCRIPTION.MAX_LENGTH)) {
    errors.push({
      field: 'description',
      message: VALIDATION_MESSAGES.MAX_LENGTH(VALIDATION_RULES.DESCRIPTION.MAX_LENGTH),
      code: 'MAX_LENGTH'
    });
  }

  // Validação de valor
  if (!isValidCurrency(data.amount)) {
    errors.push({
      field: 'amount',
      message: VALIDATION_MESSAGES.INVALID_CURRENCY,
      code: 'INVALID_CURRENCY'
    });
  } else if (!isInRange(data.amount, VALIDATION_RULES.AMOUNT.MIN_VALUE, VALIDATION_RULES.AMOUNT.MAX_VALUE)) {
    errors.push({
      field: 'amount',
      message: `Valor deve estar entre ${VALIDATION_RULES.AMOUNT.MIN_VALUE} e ${VALIDATION_RULES.AMOUNT.MAX_VALUE}`,
      code: 'OUT_OF_RANGE'
    });
  }

  // Validação de data de vencimento
  if (!isRequired(data.dueDate)) {
    errors.push({
      field: 'dueDate',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
  } else if (!isValidDate(data.dueDate)) {
    errors.push({
      field: 'dueDate',
      message: VALIDATION_MESSAGES.INVALID_DATE,
      code: 'INVALID_DATE'
    });
  }

  // Validação de categoria
  if (!isRequired(data.category)) {
    errors.push({
      field: 'category',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
  }

  // Validação de método de pagamento (opcional)
  if (data.paymentMethod && !isValidEnum(data.paymentMethod, PaymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: 'Método de pagamento inválido',
      code: 'INVALID_ENUM'
    });
  }

  // Validação de recorrência (opcional)
  if (data.recurrence && !isValidEnum(data.recurrence, RecurrenceType)) {
    errors.push({
      field: 'recurrence',
      message: 'Tipo de recorrência inválido',
      code: 'INVALID_ENUM'
    });
  }

  // Validação de parcelas (opcional)
  if (data.installments && !isInRange(data.installments, VALIDATION_RULES.INSTALLMENTS.MIN_VALUE, VALIDATION_RULES.INSTALLMENTS.MAX_VALUE)) {
    errors.push({
      field: 'installments',
      message: `Número de parcelas deve estar entre ${VALIDATION_RULES.INSTALLMENTS.MIN_VALUE} e ${VALIDATION_RULES.INSTALLMENTS.MAX_VALUE}`,
      code: 'OUT_OF_RANGE'
    });
  }

  // Validação de notas (opcional)
  if (data.notes && !hasMaxLength(data.notes, VALIDATION_RULES.NOTES.MAX_LENGTH)) {
    errors.push({
      field: 'notes',
      message: VALIDATION_MESSAGES.MAX_LENGTH(VALIDATION_RULES.NOTES.MAX_LENGTH),
      code: 'MAX_LENGTH'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validador para CreateAccountReceivableDto
 */
export const validateCreateAccountReceivable = (data: CreateAccountReceivableDto): ValidationResult => {
  // Reutiliza a validação de contas a pagar (mesma estrutura)
  return validateCreateAccountPayable(data as CreateAccountPayableDto);
};

/**
 * Validador para CreateCashFlowEntryDto
 */
export const validateCreateCashFlowEntry = (data: CreateCashFlowEntryDto): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validação de data
  if (!isRequired(data.date)) {
    errors.push({
      field: 'date',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
  } else if (!isValidDate(data.date)) {
    errors.push({
      field: 'date',
      message: VALIDATION_MESSAGES.INVALID_DATE,
      code: 'INVALID_DATE'
    });
  }

  // Validação de descrição
  if (!isRequired(data.description)) {
    errors.push({
      field: 'description',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
  } else if (!hasMinLength(data.description, VALIDATION_RULES.DESCRIPTION.MIN_LENGTH)) {
    errors.push({
      field: 'description',
      message: VALIDATION_MESSAGES.MIN_LENGTH(VALIDATION_RULES.DESCRIPTION.MIN_LENGTH),
      code: 'MIN_LENGTH'
    });
  }

  // Validação de tipo
  if (!isValidEnum(data.type, TransactionType)) {
    errors.push({
      field: 'type',
      message: 'Tipo de transação inválido',
      code: 'INVALID_ENUM'
    });
  }

  // Validação de valor
  if (!isValidCurrency(data.amount)) {
    errors.push({
      field: 'amount',
      message: VALIDATION_MESSAGES.INVALID_CURRENCY,
      code: 'INVALID_CURRENCY'
    });
  } else if (!isInRange(data.amount, VALIDATION_RULES.AMOUNT.MIN_VALUE, VALIDATION_RULES.AMOUNT.MAX_VALUE)) {
    errors.push({
      field: 'amount',
      message: `Valor deve estar entre ${VALIDATION_RULES.AMOUNT.MIN_VALUE} e ${VALIDATION_RULES.AMOUNT.MAX_VALUE}`,
      code: 'OUT_OF_RANGE'
    });
  }

  // Validação de categoria
  if (!isRequired(data.category)) {
    errors.push({
      field: 'category',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
  }

  // Validação de método de pagamento
  if (!isValidEnum(data.paymentMethod, PaymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: 'Método de pagamento inválido',
      code: 'INVALID_ENUM'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validador para UpdateAccountDto
 */
export const validateUpdateAccount = (data: UpdateAccountDto): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validações opcionais (apenas se os campos estiverem presentes)
  if (data.description !== undefined) {
    if (!isRequired(data.description)) {
      errors.push({
        field: 'description',
        message: VALIDATION_MESSAGES.REQUIRED,
        code: 'REQUIRED'
      });
    } else if (!hasMinLength(data.description, VALIDATION_RULES.DESCRIPTION.MIN_LENGTH)) {
      errors.push({
        field: 'description',
        message: VALIDATION_MESSAGES.MIN_LENGTH(VALIDATION_RULES.DESCRIPTION.MIN_LENGTH),
        code: 'MIN_LENGTH'
      });
    }
  }

  if (data.amount !== undefined) {
    if (!isValidCurrency(data.amount)) {
      errors.push({
        field: 'amount',
        message: VALIDATION_MESSAGES.INVALID_CURRENCY,
        code: 'INVALID_CURRENCY'
      });
    } else if (!isInRange(data.amount, VALIDATION_RULES.AMOUNT.MIN_VALUE, VALIDATION_RULES.AMOUNT.MAX_VALUE)) {
      errors.push({
        field: 'amount',
        message: `Valor deve estar entre ${VALIDATION_RULES.AMOUNT.MIN_VALUE} e ${VALIDATION_RULES.AMOUNT.MAX_VALUE}`,
        code: 'OUT_OF_RANGE'
      });
    }
  }

  if (data.dueDate !== undefined) {
    if (!isValidDate(data.dueDate)) {
      errors.push({
        field: 'dueDate',
        message: VALIDATION_MESSAGES.INVALID_DATE,
        code: 'INVALID_DATE'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Função utilitária para formatar erros de validação
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.field}: ${error.message}`).join(', ');
};

/**
 * Função utilitária para obter erros por campo
 */
export const getFieldErrors = (errors: ValidationError[], field: string): ValidationError[] => {
  return errors.filter(error => error.field === field);
};

/**
 * Função utilitária para verificar se um campo específico tem erros
 */
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(error => error.field === field);
};