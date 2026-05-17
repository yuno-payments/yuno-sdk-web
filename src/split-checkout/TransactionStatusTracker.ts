/**
 * TransactionStatusTracker — real-time per-transaction status display
 * for split payments.
 *
 * Tracks AUTHORIZED, PENDING_ASYNC (with QR code), CAPTURED, etc.
 * Polls for status updates at a configurable interval.
 */

export type SplitTransactionStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PENDING_ASYNC'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface TransactionStatusEntry {
  one_time_token: string;
  payment_method_type: string;
  amount: number;
  status: SplitTransactionStatus;
  qr_code_data?: string;
  updated_at: string;
}

export type OnStatusChangeCallback = (
  transactions: ReadonlyArray<TransactionStatusEntry>,
  overallStatus: SplitTransactionStatus,
) => void;

export type StatusFetcher = (
  checkoutSession: string,
  tokens: string[],
) => Promise<TransactionStatusEntry[]>;

export interface TransactionStatusTrackerConfig {
  /** Checkout session identifier */
  checkout_session: string;
  /** Poll interval in milliseconds */
  poll_interval_ms: number;
  /** Function to fetch current statuses from the server */
  fetchStatuses: StatusFetcher;
  /** Callback when any status changes */
  onStatusChange?: OnStatusChangeCallback;
}

/** Terminal statuses that don't need further polling. */
const TERMINAL_STATUSES: Set<SplitTransactionStatus> = new Set([
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]);

export class TransactionStatusTracker {
  private config: TransactionStatusTrackerConfig;
  private transactions: Map<string, TransactionStatusEntry> = new Map();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;

  constructor(config: TransactionStatusTrackerConfig) {
    this.config = config;
  }

  /**
   * Register transactions to track.
   */
  addTransactions(entries: TransactionStatusEntry[]): void {
    for (const entry of entries) {
      this.transactions.set(entry.one_time_token, { ...entry });
    }
  }

  /**
   * Get all tracked transactions.
   */
  getTransactions(): TransactionStatusEntry[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get the overall status across all transactions.
   */
  getOverallStatus(): SplitTransactionStatus {
    const statuses = Array.from(this.transactions.values()).map((t) => t.status);

    if (statuses.length === 0) return 'PENDING';
    if (statuses.every((s) => s === 'CAPTURED')) return 'CAPTURED';
    if (statuses.some((s) => s === 'FAILED')) return 'FAILED';
    if (statuses.some((s) => s === 'CANCELLED')) return 'CANCELLED';
    if (statuses.some((s) => s === 'PENDING_ASYNC')) return 'PENDING_ASYNC';
    if (statuses.every((s) => s === 'AUTHORIZED')) return 'AUTHORIZED';
    return 'PENDING';
  }

  /**
   * Start polling for status updates.
   */
  startPolling(): void {
    if (this.pollTimer !== null) {
      return; // already polling
    }
    this.pollTimer = setInterval(() => {
      this.poll();
    }, this.config.poll_interval_ms);
  }

  /**
   * Stop polling for status updates.
   */
  stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Manually trigger a single poll cycle.
   */
  async poll(): Promise<void> {
    if (this.isPolling) return;

    const nonTerminalTokens = Array.from(this.transactions.values())
      .filter((t) => !TERMINAL_STATUSES.has(t.status))
      .map((t) => t.one_time_token);

    if (nonTerminalTokens.length === 0) {
      this.stopPolling();
      return;
    }

    this.isPolling = true;
    try {
      const updatedEntries = await this.config.fetchStatuses(
        this.config.checkout_session,
        nonTerminalTokens,
      );

      let changed = false;
      for (const entry of updatedEntries) {
        const existing = this.transactions.get(entry.one_time_token);
        if (existing && existing.status !== entry.status) {
          this.transactions.set(entry.one_time_token, { ...entry });
          changed = true;
        }
      }

      if (changed && this.config.onStatusChange) {
        this.config.onStatusChange(this.getTransactions(), this.getOverallStatus());
      }

      // Auto-stop when all are terminal
      const allTerminal = Array.from(this.transactions.values()).every((t) =>
        TERMINAL_STATUSES.has(t.status),
      );
      if (allTerminal) {
        this.stopPolling();
      }
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Check if currently polling.
   */
  isActive(): boolean {
    return this.pollTimer !== null;
  }

  /**
   * Clear all tracked transactions and stop polling.
   */
  destroy(): void {
    this.stopPolling();
    this.transactions.clear();
  }
}
