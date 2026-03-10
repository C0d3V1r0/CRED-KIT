import type { InstalledCyberware, Cyberware, CyberwareConflict, SlotLimitResult, CompatibilityResult } from '@/types';

// - проверка конфликта двух имплантов
export function hasConflict(implant1: Cyberware, implant2: Cyberware): boolean {
  if (implant1.incompatible?.includes(implant2.id)) return true;
  if (implant2.incompatible?.includes(implant1.id)) return true;
  return implant1.slot === implant2.slot;
}

// - все конфликты в списке
export function findConflicts(cyberware: InstalledCyberware[]): CyberwareConflict[] {
  const conflicts: CyberwareConflict[] = [];
  for (let i = 0; i < cyberware.length; i++) {
    const implant = cyberware[i];
    const implantConflicts = cyberware.filter((c, j) => i !== j && hasConflict(implant, c));
    if (implantConflicts.length > 0) {
      conflicts.push({ implant, conflicts: implantConflicts });
    }
  }
  return conflicts;
}

// - лимиты по зонам тела
export function checkSlotLimits(cyberware: InstalledCyberware[]): SlotLimitResult {
  const zoneCounts = { head: 0, torso: 0, arms: 0, legs: 0 };
  const BODY_ZONES: Record<string, string[]> = {
    head: ['head_eye', 'head_ear', 'head_brain', 'head_other'],
    torso: ['torso_organs', 'torso_skeleton', 'torso_skin'],
    arms: ['arm_l_hand', 'arm_l_forearm', 'arm_r_hand', 'arm_r_forearm'],
    legs: ['leg_l_stamp', 'leg_l_calf', 'leg_r_stamp', 'leg_r_calf']
  };
  const SLOT_LIMITS = { head: 6, torso: 6, arms: 4, legs: 4 };

  for (const implant of cyberware) {
    for (const [zone, slots] of Object.entries(BODY_ZONES)) {
      if (slots.includes(implant.slot)) {
        zoneCounts[zone as keyof typeof zoneCounts]++;
        break;
      }
    }
  }

  const warnings: string[] = [];
  for (const [zone, count] of Object.entries(zoneCounts)) {
    const limit = SLOT_LIMITS[zone as keyof typeof SLOT_LIMITS];
    if (count >= limit) warnings.push(`${zone}: ${count}/${limit}`);
  }

  return { valid: warnings.length === 0, warnings, zoneCounts };
}

// - совместимость импланта с текущими
export function checkImplantCompatibility(
  implant: Cyberware,
  currentCyberware: InstalledCyberware[]
): CompatibilityResult {
  const conflicts: string[] = [];
  const SLOT_LIMITS = { head: 6, torso: 6, arms: 4, legs: 4 };

  for (const existing of currentCyberware) {
    if (hasConflict(implant, existing)) {
      conflicts.push(`${implant.name} vs ${existing.name}`);
    }
  }

  const zone = getZoneForSlot(implant.slot);
  const zoneImplants = getImplantsByZone(currentCyberware, zone);
  if (zoneImplants.length >= SLOT_LIMITS[zone as keyof typeof SLOT_LIMITS]) {
    conflicts.push(`Зона ${zone} заполнена`);
  }

  return { compatible: conflicts.length === 0, conflicts };
}

// - определяем зону по слоту
function getZoneForSlot(slot: string): string {
  const zones: Record<string, string> = {
    head_eye: 'head', head_ear: 'head', head_brain: 'head', head_other: 'head',
    torso_organs: 'torso', torso_skeleton: 'torso', torso_skin: 'torso',
    arm_l_hand: 'arms', arm_l_forearm: 'arms', arm_r_hand: 'arms', arm_r_forearm: 'arms',
    leg_l_stamp: 'legs', leg_l_calf: 'legs', leg_r_stamp: 'legs', leg_r_calf: 'legs'
  };
  return zones[slot] || 'unknown';
}

// - импланты в конкретной зоне
function getImplantsByZone(cyberware: InstalledCyberware[], zone: string): InstalledCyberware[] {
  const zoneSlots: Record<string, string[]> = {
    head: ['head_eye', 'head_ear', 'head_brain', 'head_other'],
    torso: ['torso_organs', 'torso_skeleton', 'torso_skin'],
    arms: ['arm_l_hand', 'arm_l_forearm', 'arm_r_hand', 'arm_r_forearm'],
    legs: ['leg_l_stamp', 'leg_l_calf', 'leg_r_stamp', 'leg_r_calf']
  };
  return cyberware.filter(implant => zoneSlots[zone]?.includes(implant.slot));
}
