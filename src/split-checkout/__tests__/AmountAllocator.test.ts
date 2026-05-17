import { AmountAllocator, type AmountAllocatorConfig, type AllocationEntry } from '../AmountAllocator';

describe('AmountAllocator', () => {
  describe('CUSTOMER_DEFINED mode', () => {
    const config: AmountAllocatorConfig = {
      session_total: 10000,
      allocation_mode: 'CUSTOMER_DEFINED',
    };

    it('should allow setting amounts per slot', () => {
      const allocator = new AmountAllocator(config);

      expect(allocator.setAmount('slot_1', 'CARD', 6000)).toBe(true);
      expect(allocator.setAmount('slot_2', 'PIX', 4000)).toBe(true);

      expect(allocator.getSum()).toBe(10000);
      expect(allocator.getRemainingBalance()).toBe(0);
      expect(allocator.isBalanced()).toBe(true);
    });

    it('should track remaining balance correctly', () => {
      const allocator = new AmountAllocator(config);
      allocator.setAmount('slot_1', 'CARD', 3000);

      expect(allocator.getRemainingBalance()).toBe(7000);
      expect(allocator.isBalanced()).toBe(false);
    });

    it('should auto-fill last slot with remaining balance', () => {
      const allocator = new AmountAllocator(config);
      allocator.setAmount('slot_1', 'CARD', 6000);

      expect(allocator.autoFillLastSlot('slot_2', 'PIX')).toBe(true);
      expect(allocator.getSum()).toBe(10000);
      expect(allocator.isBalanced()).toBe(true);
    });

    it('should not auto-fill if remaining is zero', () => {
      const allocator = new AmountAllocator(config);
      allocator.setAmount('slot_1', 'CARD', 10000);

      expect(allocator.autoFillLastSlot('slot_2', 'PIX')).toBe(false);
    });

    it('should remove a slot', () => {
      const allocator = new AmountAllocator(config);
      allocator.setAmount('slot_1', 'CARD', 6000);
      allocator.setAmount('slot_2', 'PIX', 4000);

      expect(allocator.removeSlot('slot_1')).toBe(true);
      expect(allocator.getSum()).toBe(4000);
      expect(allocator.getAllocations()).toHaveLength(1);
    });

    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const allocator = new AmountAllocator(config, onChange);
      allocator.setAmount('slot_1', 'CARD', 5000);

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ slot_id: 'slot_1', amount: 5000 })]),
        5000, // remaining
      );
    });

    it('should reset allocations', () => {
      const allocator = new AmountAllocator(config);
      allocator.setAmount('slot_1', 'CARD', 5000);
      allocator.reset();

      expect(allocator.getAllocations()).toHaveLength(0);
      expect(allocator.getRemainingBalance()).toBe(10000);
    });
  });

  describe('MERCHANT_DEFINED mode', () => {
    const merchantAllocations: AllocationEntry[] = [
      { slot_id: 'slot_1', payment_method_type: 'CARD', amount: 7000 },
      { slot_id: 'slot_2', payment_method_type: 'PIX', amount: 3000 },
    ];

    const config: AmountAllocatorConfig = {
      session_total: 10000,
      allocation_mode: 'MERCHANT_DEFINED',
      merchant_allocations: merchantAllocations,
    };

    it('should pre-fill allocations from config', () => {
      const allocator = new AmountAllocator(config);

      expect(allocator.getAllocations()).toHaveLength(2);
      expect(allocator.getSum()).toBe(10000);
      expect(allocator.isBalanced()).toBe(true);
    });

    it('should not allow setting amounts in MERCHANT_DEFINED mode', () => {
      const allocator = new AmountAllocator(config);
      expect(allocator.setAmount('slot_1', 'CARD', 9999)).toBe(false);
      // amount should remain unchanged
      const cardAlloc = allocator.getAllocations().find((a) => a.slot_id === 'slot_1');
      expect(cardAlloc!.amount).toBe(7000);
    });

    it('should not allow auto-fill in MERCHANT_DEFINED mode', () => {
      const allocator = new AmountAllocator(config);
      expect(allocator.autoFillLastSlot('slot_3', 'NEQUI')).toBe(false);
    });

    it('should restore merchant allocations on reset', () => {
      const allocator = new AmountAllocator(config);
      allocator.removeSlot('slot_1');
      expect(allocator.getAllocations()).toHaveLength(1);

      allocator.reset();
      expect(allocator.getAllocations()).toHaveLength(2);
    });
  });
});
