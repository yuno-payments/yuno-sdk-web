import { validateSplitAllocations, type SplitConfig, type SplitMethodAllocation } from '../SplitValidation';

describe('validateSplitAllocations', () => {
  const baseConfig: SplitConfig = {
    enabled: true,
    max_methods: 3,
    session_total: 10000,
    currency: 'USD',
    allocation_mode: 'CUSTOMER_DEFINED',
  };

  const validAllocations: SplitMethodAllocation[] = [
    { one_time_token: 'ott_1', amount: 6000, payment_method_type: 'CARD' },
    { one_time_token: 'ott_2', amount: 4000, payment_method_type: 'PIX' },
  ];

  it('should pass for valid allocations summing to session total', () => {
    const result = validateSplitAllocations(validAllocations, baseConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when split payments are disabled', () => {
    const config = { ...baseConfig, enabled: false };
    const result = validateSplitAllocations(validAllocations, config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Split payments are not enabled for this session.');
  });

  it('should fail when allocations array is empty', () => {
    const result = validateSplitAllocations([], baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one payment method allocation is required.');
  });

  it('should fail when method count exceeds max_methods', () => {
    const config = { ...baseConfig, max_methods: 1 };
    const result = validateSplitAllocations(validAllocations, config);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/exceeds maximum allowed/);
  });

  it('should fail when sum does not equal session total', () => {
    const allocations: SplitMethodAllocation[] = [
      { one_time_token: 'ott_1', amount: 5000, payment_method_type: 'CARD' },
      { one_time_token: 'ott_2', amount: 3000, payment_method_type: 'PIX' },
    ];
    const result = validateSplitAllocations(allocations, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/does not equal session total/);
  });

  it('should fail when an allocation has amount <= 0', () => {
    const allocations: SplitMethodAllocation[] = [
      { one_time_token: 'ott_1', amount: 10000, payment_method_type: 'CARD' },
      { one_time_token: 'ott_2', amount: 0, payment_method_type: 'PIX' },
    ];
    const result = validateSplitAllocations(allocations, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/invalid amount/);
  });

  it('should fail when an allocation is missing one_time_token', () => {
    const allocations: SplitMethodAllocation[] = [
      { one_time_token: '', amount: 6000, payment_method_type: 'CARD' },
      { one_time_token: 'ott_2', amount: 4000, payment_method_type: 'PIX' },
    ];
    const result = validateSplitAllocations(allocations, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/missing a one_time_token/);
  });

  it('should fail when an allocation is missing payment_method_type', () => {
    const allocations: SplitMethodAllocation[] = [
      { one_time_token: 'ott_1', amount: 6000, payment_method_type: '' },
      { one_time_token: 'ott_2', amount: 4000, payment_method_type: 'PIX' },
    ];
    const result = validateSplitAllocations(allocations, baseConfig);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/missing a payment_method_type/);
  });

  it('should collect multiple errors at once', () => {
    const allocations: SplitMethodAllocation[] = [
      { one_time_token: '', amount: -1, payment_method_type: '' },
    ];
    const result = validateSplitAllocations(allocations, baseConfig);
    expect(result.valid).toBe(false);
    // Should have errors for: amount <= 0, missing token, missing type, sum mismatch
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
