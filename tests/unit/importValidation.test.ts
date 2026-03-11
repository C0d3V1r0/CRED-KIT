import { describe, expect, it } from 'vitest';
import { baseCharacterFixture } from '../fixtures/character.fixture';
import { parseImportJson, sanitizeCharacterImport } from '@/utils/importValidation';

describe('importValidation', () => {
  it('parseImportJson: отдаёт понятную ошибку для битого JSON', () => {
    expect(() => parseImportJson('{ bad json }', 1024)).toThrow('Некорректный JSON');
  });

  it('parseImportJson: блокирует слишком большой JSON', () => {
    const hugePayload = `{"blob":"${'x'.repeat(2048)}"}`;
    expect(() => parseImportJson(hugePayload, 128)).toThrow('Слишком большой файл импорта');
  });

  it('sanitizeCharacterImport: не сохраняет пустые ключи навыков', () => {
    const sanitized = sanitizeCharacterImport({
      ...baseCharacterFixture,
      skills: {
        Athletics: 6,
        '   ': 7
      }
    }, baseCharacterFixture);

    expect(sanitized.skills).toEqual({
      Athletics: 6
    });
  });

  it('sanitizeCharacterImport: нормализует повреждённые legacy-поля к безопасному состоянию', () => {
    const sanitized = sanitizeCharacterImport({
      ...baseCharacterFixture,
      level: '99',
      roleAbilityRank: '8',
      role: 'BadRole',
      currentHP: 'invalid',
      money: '999999999999',
      health: {
        current: '73',
        max: '88'
      },
      humanity: {
        current: '120',
        max: '130'
      },
      armorState: {
        head: {
          current: '4',
          max: '7'
        },
        body: {
          current: '9',
          max: '11'
        }
      },
      skills: {
        Athletics: 14
      },
      stats: {
        ...baseCharacterFixture.stats,
        INT: '9000',
        EMP: '-100'
      }
    }, baseCharacterFixture);

    expect(sanitized.role).toBe(baseCharacterFixture.role);
    expect(sanitized.currentHP).toBe(baseCharacterFixture.health.current);
    expect(sanitized.money).toBe(10_000_000);
    expect(sanitized.level).toBe(99);
    expect(sanitized.roleAbilityRank).toBe(8);
    expect(sanitized.health).toEqual({ current: 73, max: 88 });
    expect(sanitized.humanity).toEqual({ current: 120, max: 130 });
    expect(sanitized.armorState).toEqual({
      head: { current: 4, max: 7 },
      body: { current: 9, max: 11 }
    });
    expect(sanitized.skills?.Athletics).toBe(14);
    expect(sanitized.stats.INT).toBe(9000);
    expect(sanitized.stats.EMP).toBe(2);
  });

  it('sanitizeCharacterImport: переносит legacy currentHP в новый ресурс здоровья, если health отсутствует', () => {
    const sanitized = sanitizeCharacterImport({
      ...baseCharacterFixture,
      currentHP: 17,
      health: undefined
    }, baseCharacterFixture);

    expect(sanitized.health.current).toBe(17);
    expect(sanitized.health.max).toBe(baseCharacterFixture.health.max);
  });

  it('sanitizeCharacterImport: legacy single-track armor переносит в head/body', () => {
    const sanitized = sanitizeCharacterImport({
      ...baseCharacterFixture,
      armorState: { current: 4, max: 7 }
    }, baseCharacterFixture);

    expect(sanitized.armorState).toEqual({
      head: { current: 4, max: 7 },
      body: { current: 4, max: 7 }
    });
  });
});
