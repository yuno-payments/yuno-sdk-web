/**
 * SplitValidation — validates split payment constraints.
 *
 * Rules:
 *  - Sum of all allocation amounts must equal the session total.
 *  - Number of methods must not exceed max_methods.
 *  - Each allocation amount must be > 0.
 *  - At least one allocation is required.
 */

export interface SplitMethodAllocation {
  one_time_token: string;
  amount: number;
  payment_method_type: string;
}

export interface SplitConfig {
  enabled: boolean;
  max_methods: number;
  session_total: number;
  currency: string;
  allocation_mode: 'CUSTOMER_DEFINED' | 'MERCHANT_DEFINED';
  merchant_allocations?: SplitMethodAllocation[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate that a set of allocations satisfies the split config constraints.
 */
export function validateSplitAllocations(
  allocations: SplitMethodAllocation[],
  config: SplitConfig,
): ValidationResult {
  const errors: string[] = [];

  if (!config.enabled) {
    errors.push('Split payments are not enabled for this session.');
    return { valid: false, errors };
  }

  if (allocations.length === 0) {
    errors.push('At least one payment method allocation is required.');
    return { valid: false, errors };
  }

  if (allocations.length > config.max_methods) {
    errors.push(
      `Number of methods (${allocations.length}) exceeds maximum allowed (${config.max_methods}).`,
    );
  }

  for (let i = 0; i < allocations.length; i++) {
    const alloc = allocations[i];
    if (alloc.amount <= 0) {
      errors.push(`Allocation ${i} has an invalid amount: ${alloc.amount}. Must be > 0.`);
    }
    if (!alloc.one_time_token) {
      errors.push(`Allocation ${i} is missing a one_time_token.`);
    }
    if (!alloc.payment_method_type) {
      errors.push(`Allocation ${i} is missing a payment_method_type.`);
    }
  }

  const sum = allocations.reduce((acc, a) => acc + a.amount, 0);
  if (sum !== config.session_total) {
    errors.push(
      `Sum of allocations (${sum}) does not equal session total (${config.session_total}).`,
    );
  }

  return { valid: errors.length === 0, errors };
}
