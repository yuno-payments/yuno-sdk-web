/**
 * AmountAllocator — per-method amount input logic.
 *
 * For CUSTOMER_DEFINED mode: manages customer-entered amounts per method,
 * tracks remaining balance, and validates the total.
 *
 * For MERCHANT_DEFINED mode: returns pre-filled allocations from the
 * split config.
 */

export interface AllocationEntry {
  slot_id: string;
  payment_method_type: string;
  amount: number;
}

export interface AmountAllocatorConfig {
  session_total: number;
  allocation_mode: 'CUSTOMER_DEFINED' | 'MERCHANT_DEFINED';
  /** Pre-defined allocations for MERCHANT_DEFINED mode */
  merchant_allocations?: AllocationEntry[];
}

export type OnAllocationChangeCallback = (allocations: ReadonlyArray<AllocationEntry>, remaining: number) => void;

export class AmountAllocator {
  private config: AmountAllocatorConfig;
  private allocations: Map<string, AllocationEntry> = new Map();
  private onChangeCallback?: OnAllocationChangeCallback;

  constructor(config: AmountAllocatorConfig, onChange?: OnAllocationChangeCallback) {
    this.config = config;
    this.onChangeCallback = onChange;

    if (config.allocation_mode === 'MERCHANT_DEFINED' && config.merchant_allocations) {
      for (const alloc of config.merchant_allocations) {
        this.allocations.set(alloc.slot_id, { ...alloc });
      }
    }
  }

  /**
   * Set the amount for a given slot. Only effective in CUSTOMER_DEFINED mode.
   * Returns false if in MERCHANT_DEFINED mode.
   */
  setAmount(slotId: string, paymentMethodType: string, amount: number): boolean {
    if (this.config.allocation_mode === 'MERCHANT_DEFINED') {
      return false;
    }

    this.allocations.set(slotId, {
      slot_id: slotId,
      payment_method_type: paymentMethodType,
      amount,
    });
    this.notifyChange();
    return true;
  }

  /**
   * Remove an allocation slot.
   */
  removeSlot(slotId: string): boolean {
    const deleted = this.allocations.delete(slotId);
    if (deleted) {
      this.notifyChange();
    }
    return deleted;
  }

  /**
   * Get the remaining balance (session total - sum of allocations).
   */
  getRemainingBalance(): number {
    const sum = this.getSum();
    return this.config.session_total - sum;
  }

  /**
   * Get the sum of all current allocations.
   */
  getSum(): number {
    let sum = 0;
    for (const alloc of this.allocations.values()) {
      sum += alloc.amount;
    }
    return sum;
  }

  /**
   * Check whether the allocations are fully balanced (remaining = 0).
   */
  isBalanced(): boolean {
    return this.getRemainingBalance() === 0;
  }

  /**
   * Get all current allocations as an array.
   */
  getAllocations(): AllocationEntry[] {
    return Array.from(this.allocations.values());
  }

  /**
   * Auto-fill the last slot with the remaining balance.
   * Useful for CUSTOMER_DEFINED mode: the last method gets whatever is left.
   */
  autoFillLastSlot(slotId: string, paymentMethodType: string): boolean {
    if (this.config.allocation_mode === 'MERCHANT_DEFINED') {
      return false;
    }

    const remaining = this.getRemainingBalance();
    if (remaining <= 0) {
      return false;
    }

    this.allocations.set(slotId, {
      slot_id: slotId,
      payment_method_type: paymentMethodType,
      amount: remaining,
    });
    this.notifyChange();
    return true;
  }

  /**
   * Reset all allocations.
   */
  reset(): void {
    this.allocations.clear();
    if (this.config.allocation_mode === 'MERCHANT_DEFINED' && this.config.merchant_allocations) {
      for (const alloc of this.config.merchant_allocations) {
        this.allocations.set(alloc.slot_id, { ...alloc });
      }
    }
    this.notifyChange();
  }

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.getAllocations(), this.getRemainingBalance());
    }
  }
}
