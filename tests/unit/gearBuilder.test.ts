import { describe, expect, it } from 'vitest';
import {
  buildCustomGearItem,
  changeDraftType,
  createDefaultGearDraft,
  getDefaultSubtype
} from '@/features/gear-constructor/model/gearBuilder';

describe('gearBuilder', () => {
  it('createDefaultGearDraft создаёт базовый draft для weapon', () => {
    const draft = createDefaultGearDraft();
    expect(draft.type).toBe('weapon');
    expect(draft.subtype).toBe('pistol');
    expect(draft.damage).toBe('1d6');
  });

  it('getDefaultSubtype возвращает subtype для каждого типа', () => {
    expect(getDefaultSubtype('weapon')).toBe('pistol');
    expect(getDefaultSubtype('armor')).toBe('vest');
    expect(getDefaultSubtype('gear')).toBe('medical');
  });

  it('changeDraftType меняет тип и сбрасывает subtype под него', () => {
    const next = changeDraftType(createDefaultGearDraft(), 'armor');
    expect(next.type).toBe('armor');
    expect(next.subtype).toBe('vest');
  });

  it('buildCustomGearItem собирает кастомное оружие', () => {
    const draft = {
      ...createDefaultGearDraft('weapon'),
      name: 'Heavy Pistol',
      subtype: 'pistol',
      damage: '3d6',
      rate_of_fire: 2
    };
    const built = buildCustomGearItem('custom_1', 'weapon', draft);
    expect(built.kind).toBe('weapon');
    if (built.kind !== 'weapon') {
      throw new Error('Expected weapon');
    }
    expect(built.catalog.damage).toBe('3d6');
    expect(built.catalog.isCustom).toBe(true);
  });

  it('buildCustomGearItem собирает кастомную броню', () => {
    const draft = {
      ...createDefaultGearDraft('armor'),
      name: 'Vest',
      subtype: 'vest',
      sp: 11,
      locations: ['torso']
    };
    const built = buildCustomGearItem('custom_2', 'armor', draft);
    expect(built.kind).toBe('armor');
    if (built.kind !== 'armor') {
      throw new Error('Expected armor');
    }
    expect(built.catalog.sp).toBe(11);
    expect(built.catalog.locations).toEqual(['torso']);
  });

  it('buildCustomGearItem собирает обычный gear item', () => {
    const draft = {
      ...createDefaultGearDraft('gear'),
      name: 'Toolkit',
      effects: 'repair +1'
    };
    const built = buildCustomGearItem('custom_3', 'gear', draft);
    expect(built.kind).toBe('gear');
    if (built.kind !== 'gear') {
      throw new Error('Expected gear');
    }
    expect(built.inventory.effect).toBe('repair +1');
    expect(built.inventory.type).toBe('gadget');
  });
});
