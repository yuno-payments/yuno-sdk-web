import { TransactionStatusTracker, type TransactionStatusEntry } from '../TransactionStatusTracker';

// Use fake timers for polling tests
jest.useFakeTimers();

describe('TransactionStatusTracker', () => {
  const mockEntries: TransactionStatusEntry[] = [
    {
      one_time_token: 'ott_1',
      payment_method_type: 'CARD',
      amount: 6000,
      status: 'AUTHORIZED',
      updated_at: '2026-03-27T00:00:00Z',
    },
    {
      one_time_token: 'ott_2',
      payment_method_type: 'PIX',
      amount: 4000,
      status: 'PENDING_ASYNC',
      qr_code_data: 'data:image/png;base64,abc123',
      updated_at: '2026-03-27T00:00:00Z',
    },
  ];

  it('should track registered transactions', () => {
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses: jest.fn(),
    });

    tracker.addTransactions(mockEntries);
    expect(tracker.getTransactions()).toHaveLength(2);
  });

  it('should compute overall status correctly', () => {
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses: jest.fn(),
    });

    // Mix of AUTHORIZED and PENDING_ASYNC -> PENDING_ASYNC
    tracker.addTransactions(mockEntries);
    expect(tracker.getOverallStatus()).toBe('PENDING_ASYNC');
  });

  it('should return CAPTURED when all transactions are CAPTURED', () => {
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses: jest.fn(),
    });

    tracker.addTransactions([
      { ...mockEntries[0], status: 'CAPTURED' },
      { ...mockEntries[1], status: 'CAPTURED' },
    ]);

    expect(tracker.getOverallStatus()).toBe('CAPTURED');
  });

  it('should return FAILED if any transaction FAILED', () => {
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses: jest.fn(),
    });

    tracker.addTransactions([
      { ...mockEntries[0], status: 'CAPTURED' },
      { ...mockEntries[1], status: 'FAILED' },
    ]);

    expect(tracker.getOverallStatus()).toBe('FAILED');
  });

  it('should poll and update statuses', async () => {
    const onStatusChange = jest.fn();
    const fetchStatuses = jest.fn().mockResolvedValue([
      { ...mockEntries[0], status: 'CAPTURED', updated_at: '2026-03-27T00:01:00Z' },
      { ...mockEntries[1], status: 'CAPTURED', updated_at: '2026-03-27T00:01:00Z' },
    ]);

    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses,
      onStatusChange,
    });

    tracker.addTransactions(mockEntries);
    tracker.startPolling();

    expect(tracker.isActive()).toBe(true);

    // Advance timer to trigger poll
    jest.advanceTimersByTime(3000);
    // Let the async poll resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchStatuses).toHaveBeenCalledWith('sess_1', ['ott_1', 'ott_2']);
    expect(onStatusChange).toHaveBeenCalledTimes(1);

    // Should auto-stop since all are terminal
    expect(tracker.isActive()).toBe(false);
  });

  it('should not poll for transactions in terminal states', async () => {
    const fetchStatuses = jest.fn().mockResolvedValue([]);
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses,
    });

    tracker.addTransactions([
      { ...mockEntries[0], status: 'CAPTURED' },
      { ...mockEntries[1], status: 'FAILED' },
    ]);

    await tracker.poll();
    // fetchStatuses should not be called because all are terminal
    expect(fetchStatuses).not.toHaveBeenCalled();
  });

  it('should stop polling when stopPolling is called', () => {
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses: jest.fn(),
    });

    tracker.startPolling();
    expect(tracker.isActive()).toBe(true);

    tracker.stopPolling();
    expect(tracker.isActive()).toBe(false);
  });

  it('should clear everything on destroy', () => {
    const tracker = new TransactionStatusTracker({
      checkout_session: 'sess_1',
      poll_interval_ms: 3000,
      fetchStatuses: jest.fn(),
    });

    tracker.addTransactions(mockEntries);
    tracker.startPolling();
    tracker.destroy();

    expect(tracker.isActive()).toBe(false);
    expect(tracker.getTransactions()).toHaveLength(0);
  });
});
