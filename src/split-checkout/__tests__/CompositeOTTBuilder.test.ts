import { CompositeOTTBuilder } from '../CompositeOTTBuilder';
import type { SplitConfig } from '../SplitValidation';

describe('CompositeOTTBuilder', () => {
  const config: SplitConfig = {
    enabled: true,
    max_methods: 3,
    session_total: 10000,
    currency: 'COP',
    allocation_mode: 'CUSTOMER_DEFINED',
  };

  it('should build a composite OTT when allocations are valid', () => {
    const builder = new CompositeOTTBuilder(config);
    builder
      .addAllocation({ one_time_token: 'ott_a', amount: 7000, payment_method_type: 'CARD' })
      .addAllocation({ one_time_token: 'ott_b', amount: 3000, payment_method_type: 'NEQUI' });

    const result = builder.build();
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.token!.version).toBe(2);
    expect(result.token!.composite_token).toMatch(/^cott_v2_/);
    expect(result.token!.allocations).toHaveLength(2);
    expect(result.token!.total_amount).toBe(10000);
    expect(result.token!.currency).toBe('COP');
    expect(result.token!.created_at).toBeTruthy();
  });

  it('should fail when allocations do not sum to session total', () => {
    const builder = new CompositeOTTBuilder(config);
    builder.addAllocation({ one_time_token: 'ott_a', amount: 5000, payment_method_type: 'CARD' });

    const result = builder.build();
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should fail when method count exceeds max_methods', () => {
    const restrictedConfig: SplitConfig = { ...config, max_methods: 1 };
    const builder = new CompositeOTTBuilder(restrictedConfig);
    builder
      .addAllocation({ one_time_token: 'ott_a', amount: 7000, payment_method_type: 'CARD' })
      .addAllocation({ one_time_token: 'ott_b', amount: 3000, payment_method_type: 'PIX' });

    const result = builder.build();
    expect(result.success).toBe(false);
    expect(result.errors![0]).toMatch(/exceeds maximum/);
  });

  it('should allow removing an allocation by index', () => {
    const builder = new CompositeOTTBuilder(config);
    builder
      .addAllocation({ one_time_token: 'ott_a', amount: 5000, payment_method_type: 'CARD' })
      .addAllocation({ one_time_token: 'ott_b', amount: 5000, payment_method_type: 'PIX' });

    builder.removeAllocation(0);
    expect(builder.getAllocations()).toHaveLength(1);
    expect(builder.getAllocations()[0].one_time_token).toBe('ott_b');
  });

  it('should allow replacing all allocations', () => {
    const builder = new CompositeOTTBuilder(config);
    builder.addAllocation({ one_time_token: 'ott_a', amount: 5000, payment_method_type: 'CARD' });

    builder.setAllocations([
      { one_time_token: 'ott_x', amount: 10000, payment_method_type: 'PIX' },
    ]);

    expect(builder.getAllocations()).toHaveLength(1);
    expect(builder.getAllocations()[0].one_time_token).toBe('ott_x');
  });

  it('should validate without building', () => {
    const builder = new CompositeOTTBuilder(config);
    builder.addAllocation({ one_time_token: 'ott_a', amount: 10000, payment_method_type: 'CARD' });

    const validation = builder.validate();
    expect(validation.valid).toBe(true);
  });

  it('should reset all allocations', () => {
    const builder = new CompositeOTTBuilder(config);
    builder.addAllocation({ one_time_token: 'ott_a', amount: 5000, payment_method_type: 'CARD' });
    builder.reset();
    expect(builder.getAllocations()).toHaveLength(0);
  });
});
