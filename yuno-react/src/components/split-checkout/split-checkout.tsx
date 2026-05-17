/**
 * SplitCheckout — React demo component for Split/Combo Payments.
 *
 * Demonstrates:
 *  - Adding/removing multiple payment methods
 *  - Customer-defined amount allocation
 *  - Composite OTT building
 *  - Transaction status tracking with polling simulation
 */

import { useState, useCallback } from 'react';

interface MethodSlot {
  id: string;
  type: string;
  displayName: string;
  amount: number;
}

interface TransactionStatus {
  token: string;
  type: string;
  amount: number;
  status: 'PENDING' | 'AUTHORIZED' | 'PENDING_ASYNC' | 'CAPTURED' | 'FAILED';
  qrCodeData?: string;
}

const AVAILABLE_METHODS = [
  { type: 'CARD', name: 'Credit/Debit Card' },
  { type: 'PIX', name: 'PIX' },
  { type: 'NEQUI', name: 'Nequi' },
  { type: 'PSE', name: 'PSE' },
];

const MAX_METHODS = 3;
const SESSION_TOTAL = 2000; // in minor units

export const SplitCheckout = () => {
  const [methods, setMethods] = useState<MethodSlot[]>([]);
  const [statuses, setStatuses] = useState<TransactionStatus[]>([]);
  const [methodPickerIdx, setMethodPickerIdx] = useState(0);

  const sum = methods.reduce((s, m) => s + m.amount, 0);
  const remaining = SESSION_TOTAL - sum;
  const canAdd = methods.length < MAX_METHODS;

  const addMethod = useCallback(() => {
    if (!canAdd) return;
    const method = AVAILABLE_METHODS[methodPickerIdx % AVAILABLE_METHODS.length];
    setMethodPickerIdx((i) => i + 1);
    setMethods((prev) => [
      ...prev,
      { id: `slot_${Date.now()}`, type: method.type, displayName: method.name, amount: 0 },
    ]);
  }, [canAdd, methodPickerIdx]);

  const removeMethod = useCallback((id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateAmount = useCallback((id: string, amount: number) => {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, amount } : m)));
  }, []);

  const handlePay = useCallback(() => {
    if (sum !== SESSION_TOTAL) {
      alert(`Amounts must sum to ${SESSION_TOTAL}. Current sum: ${sum}`);
      return;
    }
    if (methods.length === 0) {
      alert('Add at least one payment method.');
      return;
    }

    // Build composite OTT (simulated)
    const compositeToken = {
      version: 2 as const,
      composite_token: `cott_v2_${Date.now().toString(36)}`,
      allocations: methods.map((m) => ({
        one_time_token: `simulated_ott_${m.type}_${m.id}`,
        amount: m.amount,
        payment_method_type: m.type,
      })),
      total_amount: SESSION_TOTAL,
      currency: 'COP',
      created_at: new Date().toISOString(),
    };

    console.log('[SplitCheckout] Composite OTT:', compositeToken);

    // Set initial statuses
    const initialStatuses: TransactionStatus[] = compositeToken.allocations.map((a) => ({
      token: a.one_time_token,
      type: a.payment_method_type,
      amount: a.amount,
      status: a.payment_method_type === 'PIX' ? 'PENDING_ASYNC' : 'AUTHORIZED',
      qrCodeData: a.payment_method_type === 'PIX' ? 'data:image/png;base64,demo...' : undefined,
    }));
    setStatuses(initialStatuses);

    // Simulate capture after 2s
    setTimeout(() => {
      setStatuses((prev) => prev.map((tx) => ({ ...tx, status: 'CAPTURED' })));
    }, 2000);
  }, [methods, sum]);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <h1>Split / Combo Checkout (React)</h1>
      <p>Pay with multiple payment methods in a single transaction.</p>

      {methods.map((m, idx) => (
        <div
          key={m.id}
          style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}
        >
          <strong>Method {idx + 1}: {m.displayName}</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <input
              type="number"
              placeholder="Amount"
              value={m.amount || ''}
              onChange={(e) => updateAmount(m.id, parseInt(e.target.value, 10) || 0)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <button
            onClick={() => removeMethod(m.id)}
            style={{ marginTop: '0.5rem', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>
      ))}

      <button onClick={addMethod} disabled={!canAdd} style={{ background: '#6c5ce7', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: canAdd ? 'pointer' : 'not-allowed', opacity: canAdd ? 1 : 0.5 }}>
        + Add another payment method
      </button>

      <p style={{ fontSize: '0.875rem', color: '#888' }}>
        Remaining: ${(remaining / 100).toFixed(2)}
      </p>

      {statuses.length > 0 && (
        <>
          <hr />
          <h2>Transaction Status</h2>
          {statuses.map((tx) => (
            <div key={tx.token} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', marginBottom: '0.5rem' }}>
              <strong>{tx.type}</strong> — ${(tx.amount / 100).toFixed(2)}{' '}
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: tx.status === 'CAPTURED' ? '#d9edf7' : tx.status === 'FAILED' ? '#f2dede' : '#fcf8e3' }}>
                {tx.status}
              </span>
              {tx.qrCodeData && tx.status === 'PENDING_ASYNC' && (
                <div style={{ marginTop: '0.5rem' }}><em>[QR Code placeholder]</em></div>
              )}
            </div>
          ))}
        </>
      )}

      <button onClick={handlePay} style={{ background: '#00b894', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 4, cursor: 'pointer', fontSize: '1rem', width: '100%', marginTop: '1rem' }}>
        Pay Now
      </button>
    </div>
  );
};
