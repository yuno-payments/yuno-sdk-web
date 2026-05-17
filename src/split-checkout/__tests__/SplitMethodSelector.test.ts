import { SplitMethodSelector, resetSlotIdCounter } from '../SplitMethodSelector';

describe('SplitMethodSelector', () => {
  beforeEach(() => {
    resetSlotIdCounter();
  });

  it('should allow adding methods up to max_methods', () => {
    const selector = new SplitMethodSelector({ max_methods: 2 });

    const id1 = selector.addMethod('CARD', 'Visa *1234');
    const id2 = selector.addMethod('PIX', 'PIX');

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(selector.getMethodCount()).toBe(2);
    expect(selector.canAddMethod()).toBe(false);
  });

  it('should return null when max_methods is reached', () => {
    const selector = new SplitMethodSelector({ max_methods: 1 });
    selector.addMethod('CARD', 'Visa *1234');

    const result = selector.addMethod('PIX', 'PIX');
    expect(result).toBeNull();
    expect(selector.getMethodCount()).toBe(1);
  });

  it('should remove a method by slot ID', () => {
    const selector = new SplitMethodSelector({ max_methods: 3 });
    const id1 = selector.addMethod('CARD', 'Visa *1234')!;
    selector.addMethod('PIX', 'PIX');

    const removed = selector.removeMethod(id1);
    expect(removed).toBe(true);
    expect(selector.getMethodCount()).toBe(1);
    expect(selector.canAddMethod()).toBe(true);
  });

  it('should return false when removing a non-existent slot', () => {
    const selector = new SplitMethodSelector({ max_methods: 2 });
    expect(selector.removeMethod('non_existent')).toBe(false);
  });

  it('should update amount for a slot', () => {
    const selector = new SplitMethodSelector({ max_methods: 2 });
    const id = selector.addMethod('CARD', 'Visa *1234')!;

    expect(selector.updateAmount(id, 5000)).toBe(true);
    expect(selector.getMethods()[0].amount).toBe(5000);
  });

  it('should set one-time token for a slot', () => {
    const selector = new SplitMethodSelector({ max_methods: 2 });
    const id = selector.addMethod('CARD', 'Visa *1234')!;

    expect(selector.setOneTimeToken(id, 'ott_abc')).toBe(true);
    expect(selector.getMethods()[0].one_time_token).toBe('ott_abc');
  });

  it('should call onMethodsChange callback when methods change', () => {
    const onChange = jest.fn();
    const selector = new SplitMethodSelector({ max_methods: 2, onMethodsChange: onChange });

    selector.addMethod('CARD', 'Visa *1234');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ payment_method_type: 'CARD' })]),
    );
  });

  it('should clear all methods', () => {
    const selector = new SplitMethodSelector({ max_methods: 3 });
    selector.addMethod('CARD', 'Visa');
    selector.addMethod('PIX', 'PIX');

    selector.clear();
    expect(selector.getMethodCount()).toBe(0);
    expect(selector.canAddMethod()).toBe(true);
  });
});
