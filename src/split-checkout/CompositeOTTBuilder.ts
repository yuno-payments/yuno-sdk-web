/**
 * CompositeOTTBuilder — packages N individual OTTs + amounts into a
 * composite OTT v2 token.
 *
 * Validates that sum of amounts equals the session total and the method
 * count does not exceed max_methods before building the token.
 */

import { validateSplitAllocations, type SplitConfig, type SplitMethodAllocation, type ValidationResult } from './SplitValidation';

export interface CompositeOTT {
  version: 2;
  composite_token: string;
  allocations: SplitMethodAllocation[];
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface BuildResult {
  success: boolean;
  token?: CompositeOTT;
  errors?: string[];
}

/**
 * Generate a unique composite token identifier.
 * Uses a combination of timestamp and random hex to produce a
 * collision-resistant ID suitable for client-side token packaging.
 */
function generateCompositeTokenId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `cott_v2_${timestamp}_${random}`;
}

export class CompositeOTTBuilder {
  private allocations: SplitMethodAllocation[] = [];
  private config: SplitConfig;

  constructor(config: SplitConfig) {
    this.config = config;
  }

  /**
   * Add a payment method allocation.
   */
  addAllocation(allocation: SplitMethodAllocation): this {
    this.allocations.push(allocation);
    return this;
  }

  /**
   * Remove an allocation by index.
   */
  removeAllocation(index: number): this {
    if (index >= 0 && index < this.allocations.length) {
      this.allocations.splice(index, 1);
    }
    return this;
  }

  /**
   * Replace all allocations.
   */
  setAllocations(allocations: SplitMethodAllocation[]): this {
    this.allocations = [...allocations];
    return this;
  }

  /**
   * Get current allocations (readonly copy).
   */
  getAllocations(): ReadonlyArray<SplitMethodAllocation> {
    return [...this.allocations];
  }

  /**
   * Validate the current allocations against the split config.
   */
  validate(): ValidationResult {
    return validateSplitAllocations(this.allocations, this.config);
  }

  /**
   * Build the composite OTT v2 token.
   * Returns errors if validation fails.
   */
  build(): BuildResult {
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const totalAmount = this.allocations.reduce((sum, a) => sum + a.amount, 0);

    const token: CompositeOTT = {
      version: 2,
      composite_token: generateCompositeTokenId(),
      allocations: [...this.allocations],
      total_amount: totalAmount,
      currency: this.config.currency,
      created_at: new Date().toISOString(),
    };

    return { success: true, token };
  }

  /**
   * Reset the builder, clearing all allocations.
   */
  reset(): this {
    this.allocations = [];
    return this;
  }
}
