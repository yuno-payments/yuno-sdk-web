/**
 * SplitMethodSelector — "Add another method" UI component logic.
 *
 * Manages the list of selected payment methods for a split checkout,
 * enforcing max_methods and providing callbacks for UI updates.
 */

export interface SelectedMethod {
  /** Unique identifier for this selection slot */
  id: string;
  /** Payment method type (e.g. 'CARD', 'PIX') */
  payment_method_type: string;
  /** Display name */
  display_name: string;
  /** One-time token once generated */
  one_time_token?: string;
  /** Allocated amount */
  amount: number;
}

export type OnMethodsChangeCallback = (methods: ReadonlyArray<SelectedMethod>) => void;

export interface SplitMethodSelectorConfig {
  /** Maximum number of payment methods allowed */
  max_methods: number;
  /** Callback when the methods list changes */
  onMethodsChange?: OnMethodsChangeCallback;
}

let nextSlotId = 0;
function generateSlotId(): string {
  nextSlotId += 1;
  return `slot_${nextSlotId}_${Date.now().toString(36)}`;
}

/** Reset the internal slot counter (for testing). */
export function resetSlotIdCounter(): void {
  nextSlotId = 0;
}

export class SplitMethodSelector {
  private methods: SelectedMethod[] = [];
  private config: SplitMethodSelectorConfig;

  constructor(config: SplitMethodSelectorConfig) {
    this.config = config;
  }

  /**
   * Whether another payment method can be added.
   */
  canAddMethod(): boolean {
    return this.methods.length < this.config.max_methods;
  }

  /**
   * Add a new payment method selection.
   * Returns the slot ID, or null if max_methods is reached.
   */
  addMethod(paymentMethodType: string, displayName: string): string | null {
    if (!this.canAddMethod()) {
      return null;
    }

    const id = generateSlotId();
    this.methods.push({
      id,
      payment_method_type: paymentMethodType,
      display_name: displayName,
      amount: 0,
    });
    this.notifyChange();
    return id;
  }

  /**
   * Remove a payment method by slot ID.
   */
  removeMethod(slotId: string): boolean {
    const index = this.methods.findIndex((m) => m.id === slotId);
    if (index === -1) {
      return false;
    }
    this.methods.splice(index, 1);
    this.notifyChange();
    return true;
  }

  /**
   * Update the amount for a specific method slot.
   */
  updateAmount(slotId: string, amount: number): boolean {
    const method = this.methods.find((m) => m.id === slotId);
    if (!method) {
      return false;
    }
    method.amount = amount;
    this.notifyChange();
    return true;
  }

  /**
   * Set the one-time token for a specific method slot.
   */
  setOneTimeToken(slotId: string, token: string): boolean {
    const method = this.methods.find((m) => m.id === slotId);
    if (!method) {
      return false;
    }
    method.one_time_token = token;
    this.notifyChange();
    return true;
  }

  /**
   * Get all selected methods (readonly copy).
   */
  getMethods(): ReadonlyArray<SelectedMethod> {
    return [...this.methods];
  }

  /**
   * Get the count of currently selected methods.
   */
  getMethodCount(): number {
    return this.methods.length;
  }

  /**
   * Clear all selected methods.
   */
  clear(): void {
    this.methods = [];
    this.notifyChange();
  }

  private notifyChange(): void {
    if (this.config.onMethodsChange) {
      this.config.onMethodsChange([...this.methods]);
    }
  }
}
