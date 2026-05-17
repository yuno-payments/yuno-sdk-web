/**
 * Split Checkout — composite payment support for Yuno SDK Web.
 *
 * Allows customers to pay with multiple payment methods in a single
 * checkout session (split / combo payments).
 */

export { CompositeOTTBuilder } from './CompositeOTTBuilder';
export type { CompositeOTT, BuildResult } from './CompositeOTTBuilder';

export { validateSplitAllocations } from './SplitValidation';
export type { SplitConfig, SplitMethodAllocation, ValidationResult } from './SplitValidation';

export { SplitMethodSelector, resetSlotIdCounter } from './SplitMethodSelector';
export type { SelectedMethod, SplitMethodSelectorConfig, OnMethodsChangeCallback } from './SplitMethodSelector';

export { AmountAllocator } from './AmountAllocator';
export type { AllocationEntry, AmountAllocatorConfig, OnAllocationChangeCallback } from './AmountAllocator';

export { TransactionStatusTracker } from './TransactionStatusTracker';
export type {
  SplitTransactionStatus,
  TransactionStatusEntry,
  TransactionStatusTrackerConfig,
  StatusFetcher,
  OnStatusChangeCallback,
} from './TransactionStatusTracker';
