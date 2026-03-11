import { describe, expect, it } from 'vitest';
import {
  hasConflict,
  findConflicts,
  checkSlotLimits,
  checkImplantCompatibility
} from '@/logic/cyberware/humanityCalculator';
import type { InstalledCyberware } from '@/types';

function makeImplant(overrides: Partial<InstalledCyberware> = {}): InstalledCyberware {
  return {
    id: 'implant_base',
    name: 'Implant Base',
    description: '',
    type: 'custom',
    cost: 100,
    hl: 0,
    slot: 'head_other',
    installedAt: Date.now(),
    ...overrides
  };
}

describe('humanityCalculator', () => {
  it('hasConflict: определяет конфликт по incompatible и по слоту', () => {
    const a = makeImplant({ id: 'a', slot: 'head_eye', incompatible: ['b'] });
    const b = makeImplant({ id: 'b', slot: 'head_eye' });
    const c = makeImplant({ id: 'c', slot: 'arm_l_hand' });

    expect(hasConflict(a, b)).toBe(true);
    expect(hasConflict(b, c)).toBe(false);
  });

  it('findConflicts: возвращает пары конфликтующих имплантов', () => {
    const implants: InstalledCyberware[] = [
      makeImplant({ id: 'a', name: 'A', slot: 'head_eye' }),
      makeImplant({ id: 'b', name: 'B', slot: 'head_eye' }),
      makeImplant({ id: 'c', name: 'C', slot: 'arm_l_hand' })
    ];

    const conflicts = findConflicts(implants);
    expect(conflicts.length).toBe(2);
    expect(conflicts.some(entry => entry.implant.id === 'a')).toBe(true);
    expect(conflicts.some(entry => entry.implant.id === 'b')).toBe(true);
  });

  it('checkSlotLimits: считает зоны и предупреждает при достижении лимита', () => {
    const implants: InstalledCyberware[] = [
      makeImplant({ id: 'h1', slot: 'head_eye' }),
      makeImplant({ id: 'h2', slot: 'head_ear' }),
      makeImplant({ id: 'h3', slot: 'head_brain' }),
      makeImplant({ id: 'h4', slot: 'head_other' }),
      makeImplant({ id: 'h5', slot: 'head_eye' }),
      makeImplant({ id: 'h6', slot: 'head_ear' })
    ];

    const result = checkSlotLimits(implants);
    expect(result.zoneCounts.head).toBe(6);
    expect(result.valid).toBe(false);
    expect(result.warnings.some(warning => warning.startsWith('head: 6/6'))).toBe(true);
  });

  it('checkImplantCompatibility: возвращает совместимость и конфликты по лимиту/слоту', () => {
    const current: InstalledCyberware[] = [
      makeImplant({ id: 'arm1', name: 'Arm 1', slot: 'arm_l_hand' }),
      makeImplant({ id: 'arm2', name: 'Arm 2', slot: 'arm_l_forearm' }),
      makeImplant({ id: 'arm3', name: 'Arm 3', slot: 'arm_r_hand' }),
      makeImplant({ id: 'arm4', name: 'Arm 4', slot: 'arm_r_forearm' })
    ];
    const candidate = makeImplant({ id: 'arm5', name: 'Arm 5', slot: 'arm_l_hand' });

    const result = checkImplantCompatibility(candidate, current);
    expect(result.compatible).toBe(false);
    expect(result.conflicts.some(conflict => conflict.includes('Arm 5 vs Arm 1'))).toBe(true);
    expect(result.conflicts.some(conflict => conflict.includes('Зона arms заполнена'))).toBe(true);
  });
});
