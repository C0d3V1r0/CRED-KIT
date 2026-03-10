import type { Armor, Gear, Weapon } from '@/types';

export type GearTypeId = 'weapon' | 'armor' | 'gear';

export interface GearDraft {
  name: string;
  description: string;
  type: GearTypeId;
  subtype: string;
  cost: number;
  weight: number;
  damage: string;
  sp: number;
  locations: string[];
  concealability: string;
  availability: string;
  effects: string;
  rate_of_fire: number;
}

export function createDefaultGearDraft(type: GearTypeId = 'weapon'): GearDraft {
  return {
    name: '',
    description: '',
    type,
    subtype: getDefaultSubtype(type),
    cost: 100,
    weight: 1,
    damage: '1d6',
    sp: 0,
    locations: ['torso'],
    concealability: 'medium',
    availability: 'common',
    effects: '',
    rate_of_fire: 1
  };
}

export function getDefaultSubtype(type: GearTypeId): string {
  if (type === 'weapon') return 'pistol';
  if (type === 'armor') return 'vest';
  return 'medical';
}

export function changeDraftType(draft: GearDraft, type: GearTypeId): GearDraft {
  return {
    ...draft,
    type,
    subtype: getDefaultSubtype(type)
  };
}

export type BuiltGearItem =
  | { kind: 'weapon'; catalog: Weapon & { isCustom?: boolean } }
  | { kind: 'armor'; catalog: Armor & { isCustom?: boolean } }
  | { kind: 'gear'; inventory: Gear & { isCustom?: boolean } };

export function buildCustomGearItem(customId: string, selectedType: GearTypeId, draft: GearDraft): BuiltGearItem {
  if (selectedType === 'weapon') {
    return {
      kind: 'weapon',
      catalog: {
        id: customId,
        name: draft.name,
        description: draft.description,
        type: draft.subtype as Weapon['type'],
        damage: draft.damage,
        rate_of_fire: draft.rate_of_fire,
        concealability: draft.concealability as Weapon['concealability'],
        cost: draft.cost,
        weight: draft.weight,
        availability: draft.availability as Weapon['availability'],
        isCustom: true
      }
    };
  }

  if (selectedType === 'armor') {
    return {
      kind: 'armor',
      catalog: {
        id: customId,
        name: draft.name,
        description: draft.description,
        type: draft.subtype as Armor['type'],
        sp: draft.sp,
        locations: draft.locations as Armor['locations'],
        concealability: draft.concealability as Armor['concealability'],
        cost: draft.cost,
        weight: draft.weight,
        availability: draft.availability as Armor['availability'],
        isCustom: true
      }
    };
  }

  return {
    kind: 'gear',
    inventory: {
      id: customId,
      name: draft.name,
      description: draft.description,
      type: 'gadget',
      effect: draft.effects,
      cost: draft.cost,
      weight: draft.weight,
      availability: draft.availability as Gear['availability'],
      isCustom: true
    }
  };
}
