import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { AppProviders } from '@/core/providers/AppProviders';
import {
  useCharacterCoreActions,
  useCharacterPersistenceActions,
  useCharacterState,
  useCharacterStatus,
  useCustomContentActions,
  useCustomContentState,
  useCyberwareActions
} from '@/entities/character/model/hooks';
import { baseCharacterFixture } from '../fixtures/character.fixture';
import {
  initDB,
  loadCharacterFromDB,
  saveCharacterToDB,
  exportAllDataFromDB,
  importDataToDB,
  clearCustomImplantsFromDB,
  clearCustomWeaponsFromDB,
  clearCustomArmorFromDB,
  clearCustomProgramsFromDB
} from '@/services/indexedDB';

function CharacterDbConsumer() {
  const character = useCharacterState();
  const { updateBasicInfo } = useCharacterCoreActions();
  const { isLoading } = useCharacterStatus();

  if (isLoading) {
    return <div data-testid="char-loading">loading</div>;
  }

  return (
    <div>
      <p data-testid="char-name">{character.name}</p>
      <button data-testid="char-update-name" onClick={() => updateBasicInfo({ name: 'Autosaved V' })}>
        update
      </button>
    </div>
  );
}

function CharacterResetConsumer() {
  const customContent = useCustomContentState();
  const { addCustomCyberware } = useCyberwareActions();
  const { addCustomWeapon, addCustomArmor, addCustomProgram } = useCustomContentActions();
  const { resetCharacter } = useCharacterPersistenceActions();
  const { isLoading } = useCharacterStatus();

  if (isLoading) {
    return <div data-testid="char-loading">loading</div>;
  }

  return (
    <div>
      <p data-testid="custom-counts">
        {customContent.cyberware.length}:{customContent.weapons.length}:{customContent.armor.length}:{customContent.programs.length}
      </p>
      <button
        data-testid="seed-custom-content"
        onClick={() => {
          addCustomCyberware({
            id: 'custom-cyber-1',
            name: 'Test Custom Cyber',
            description: 'Test',
            type: 'custom',
            cost: 100,
            hl: 2,
            slot: 'head_brain',
            effects: { INT: '+1' }
          });
          addCustomWeapon({
            id: 'custom-weapon-1',
            name: 'Test Weapon',
            description: 'Test',
            type: 'pistol',
            damage: '2d6',
            rate_of_fire: 1,
            concealability: 'easy',
            cost: 100,
            weight: 1,
            availability: 'common'
          });
          addCustomArmor({
            id: 'custom-armor-1',
            name: 'Test Armor',
            description: 'Test',
            type: 'vest',
            sp: 11,
            locations: ['torso'],
            cost: 100,
            weight: 1,
            concealability: 'medium',
            availability: 'common'
          });
          addCustomProgram({
            id: 'custom-program-1',
            name: 'Test Program',
            description: 'Test',
            type: 'program',
            cost: 1
          });
        }}
      >
        seed
      </button>
      <button data-testid="reset-character" onClick={() => resetCharacter()}>
        reset
      </button>
    </div>
  );
}

function CharacterImportExportConsumer() {
  const character = useCharacterState();
  const { exportCharacter, importCharacter, exportAllData, importAllData } = useCharacterPersistenceActions();
  const { error, isLoading } = useCharacterStatus();
  const [exported, setExported] = useState('');
  const [allDataExported, setAllDataExported] = useState('');

  if (isLoading) {
    return <div data-testid="char-loading">loading</div>;
  }

  return (
    <div>
      <p data-testid="char-name">{character.name}</p>
      <p data-testid="char-role">{character.role}</p>
      <p data-testid="char-money">{character.money}</p>
      <p data-testid="import-error">{error ?? ''}</p>
      <pre data-testid="char-export-json">{exported}</pre>
      <pre data-testid="all-data-export-json">{allDataExported}</pre>
      <button data-testid="char-export" onClick={() => setExported(exportCharacter())}>
        export
      </button>
      <button data-testid="all-data-export" onClick={async () => setAllDataExported(await exportAllData())}>
        export-all
      </button>
      <button
        data-testid="char-import-legacy"
        onClick={() => importCharacter(JSON.stringify({
          name: ' Imported V ',
          role: 'Ghost',
          money: '999999999999'
        }))}
      >
        import-legacy
      </button>
      <button
        data-testid="all-data-import"
        onClick={async () => {
          await importAllData(JSON.stringify({
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            data: {
              character: {
                ...baseCharacterFixture,
                id: 'current',
                name: 'Imported All Data V',
                role: 'Tech',
                money: 777
              },
              games: [],
              implants: [],
              programs: [],
              weapons: [],
              armor: [],
              settings: []
            }
          }));
        }}
      >
        import-all
      </button>
      <button data-testid="char-import-invalid" onClick={() => importCharacter('{ broken json }')}>
        import-invalid
      </button>
    </div>
  );
}

describe('Character hooks + IndexedDB integration', () => {
  beforeEach(async () => {
    await initDB();
    await clearCustomImplantsFromDB();
    await clearCustomWeaponsFromDB();
    await clearCustomArmorFromDB();
    await clearCustomProgramsFromDB();
    await saveCharacterToDB({
      ...baseCharacterFixture,
      id: 'current',
      name: 'Loaded From DB',
      role: 'Solo',
      stats: { INT: 7, REF: 6, DEX: 5, TECH: 4, WILL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 },
      money: 1500
    });
  });

  it('загружает персонажа из IndexedDB и автосохраняет изменения', async () => {
    render(
      <AppProviders>
        <CharacterDbConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Loaded From DB');
    });

    fireEvent.click(screen.getByTestId('char-update-name'));

    await waitFor(async () => {
      const saved = await loadCharacterFromDB();
      expect(saved?.name).toBe('Autosaved V');
    }, { timeout: 3000 });
  });

  it('санитизирует повреждённые данные из IndexedDB и не ломает рендер', async () => {
    await importDataToDB({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        character: {
          id: 'current',
          name: { broken: true },
          role: { broken: true },
          stats: { INT: 'bad', REF: 6, DEX: 5, TECH: 4, WILL: 5, LUCK: 5, MOVE: 5, BODY: 5, EMP: 5 },
          cyberware: [],
          money: 'invalid'
        },
        games: [],
        implants: [],
        programs: [],
        weapons: [],
        armor: [],
        settings: []
      }
    });

    render(
      <AppProviders>
        <CharacterDbConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Безымянный');
    });
  });

  it('сбрасывает весь пользовательский кастомный контент при новом персонаже', async () => {
    render(
      <AppProviders>
        <CharacterResetConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-counts')).toHaveTextContent('0:0:0:0');
    });

    fireEvent.click(screen.getByTestId('seed-custom-content'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-counts')).toHaveTextContent('1:1:1:1');
    });

    fireEvent.click(screen.getByTestId('reset-character'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-counts')).toHaveTextContent('0:0:0:0');
    });
  });

  it('экспортирует данные с schemaVersion и импортирует версионированный payload', async () => {
    const exported = await exportAllDataFromDB();
    expect(exported.schemaVersion).toBe(1);
    expect(typeof exported.exportedAt).toBe('string');
    expect(exported.data.character).not.toBeNull();

    await importDataToDB({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        ...exported.data,
        character: {
          ...exported.data.character,
          name: 'Schema Import V'
        }
      }
    });

    const imported = await loadCharacterFromDB();
    expect(imported?.name).toBe('Schema Import V');
  });

  it('экспортирует текущего персонажа через API контекста', async () => {
    render(
      <AppProviders>
        <CharacterImportExportConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Loaded From DB');
    });

    fireEvent.click(screen.getByTestId('char-export'));

    const exportedJson = screen.getByTestId('char-export-json').textContent ?? '';
    expect(exportedJson).toContain('"name": "Loaded From DB"');
    expect(exportedJson).toContain('"role": "Solo"');
  });

  it('импортирует legacy-данные через API контекста и санитизирует их', async () => {
    render(
      <AppProviders>
        <CharacterImportExportConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Loaded From DB');
    });

    fireEvent.click(screen.getByTestId('char-import-legacy'));

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Imported V');
    });
    expect(screen.getByTestId('char-role')).toHaveTextContent('Nomad');
    expect(screen.getByTestId('char-money')).toHaveTextContent('10000000');
    expect(screen.getByTestId('import-error')).toHaveTextContent('');
  });

  it('импортирует полный snapshot через API контекста и сразу гидрирует состояние', async () => {
    render(
      <AppProviders>
        <CharacterImportExportConsumer />
      </AppProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Loaded From DB');
    });

    fireEvent.click(screen.getByTestId('all-data-import'));

    await waitFor(() => {
      expect(screen.getByTestId('char-name')).toHaveTextContent('Imported All Data V');
    });
    expect(screen.getByTestId('char-role')).toHaveTextContent('Tech');
    expect(screen.getByTestId('char-money')).toHaveTextContent('777');
    expect(screen.getByTestId('import-error')).toHaveTextContent('');
  });

  it('даёт понятную ошибку при битом JSON в importCharacter и не ломает текущее состояние', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
      <AppProviders>
        <CharacterImportExportConsumer />
      </AppProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('char-name')).toHaveTextContent('Loaded From DB');
      });

      fireEvent.click(screen.getByTestId('char-import-invalid'));

      await waitFor(() => {
        expect(screen.getByTestId('import-error')).toHaveTextContent('Ошибка импорта персонажа');
      });
      expect(screen.getByTestId('char-name')).toHaveTextContent('Loaded From DB');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
