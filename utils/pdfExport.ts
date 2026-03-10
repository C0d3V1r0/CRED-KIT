import type { Character, DerivedStats, StatKey } from '@/types';
import type { Language } from '@/i18n/translations';

const STAT_ORDER: StatKey[] = ['INT', 'REF', 'DEX', 'TECH', 'WILL', 'COOL', 'LUCK', 'MOVE', 'BODY', 'EMP'];

const escapeHtml = (value: unknown): string => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

interface Labels {
  title: string;
  generatedAt: string;
  sectionBasic: string;
  sectionDerived: string;
  sectionRoleAbility: string;
  sectionStats: string;
  sectionSkills: string;
  sectionCyberware: string;
  sectionEquipment: string;
  name: string;
  role: string;
  level: string;
  roleAbility: string;
  roleAbilityRank: string;
  money: string;
  hp: string;
  armorState: string;
  armorHead: string;
  armorBody: string;
  speed: string;
  humanity: string;
  interfaceLevel: string;
  totalHl: string;
  count: string;
  empty: string;
  skillLevel: string;
  weapon: string;
  armor: string;
  gear: string;
}

const LABELS: Record<Language, Labels> = {
  ru: {
    title: 'Анкета персонажа',
    generatedAt: 'Сформировано',
    sectionBasic: 'Основная информация',
    sectionDerived: 'Производные показатели',
    sectionRoleAbility: 'Ролевая механика',
    sectionStats: 'Характеристики',
    sectionSkills: 'Навыки',
    sectionCyberware: 'Установленный хром',
    sectionEquipment: 'Снаряжение',
    name: 'Имя',
    role: 'Роль',
    level: 'Уровень',
    roleAbility: 'Ролевая способность',
    roleAbilityRank: 'Ранг способности',
    money: 'Деньги',
    hp: 'HP',
    armorState: 'Броня',
    armorHead: 'Голова',
    armorBody: 'Корпус',
    speed: 'Скорость',
    humanity: 'Человечность',
    interfaceLevel: 'Интерфейс',
    totalHl: 'Потеря человечности',
    count: 'шт.',
    empty: 'Нет данных',
    skillLevel: 'уровень',
    weapon: 'Оружие',
    armor: 'Броня',
    gear: 'Предметы'
  },
  en: {
    title: 'Character Sheet',
    generatedAt: 'Generated',
    sectionBasic: 'Basic Info',
    sectionDerived: 'Derived Stats',
    sectionRoleAbility: 'Role Mechanics',
    sectionStats: 'Attributes',
    sectionSkills: 'Skills',
    sectionCyberware: 'Installed Cyberware',
    sectionEquipment: 'Equipment',
    name: 'Name',
    role: 'Role',
    level: 'Level',
    roleAbility: 'Role ability',
    roleAbilityRank: 'Ability rank',
    money: 'Money',
    hp: 'HP',
    armorState: 'Armor',
    armorHead: 'Head',
    armorBody: 'Body',
    speed: 'Speed',
    humanity: 'Humanity',
    interfaceLevel: 'Interface',
    totalHl: 'Humanity Loss',
    count: 'pcs',
    empty: 'No data',
    skillLevel: 'level',
    weapon: 'Weapons',
    armor: 'Armor',
    gear: 'Items'
  }
};

const ROLE_ABILITY_LABELS: Record<Character['role'], { ru: string; en: string }> = {
  Nomad: { ru: 'Moto', en: 'Moto' },
  Solo: { ru: 'Боевое чутьё', en: 'Combat Awareness' },
  Netrunner: { ru: 'Интерфейс', en: 'Interface' },
  Tech: { ru: 'Maker', en: 'Maker' },
  Medtech: { ru: 'Медицина', en: 'Medicine' },
  Exec: { ru: 'Командная работа', en: 'Teamwork' },
  Lawman: { ru: 'Подкрепление', en: 'Backup' },
  Fixer: { ru: 'Operator', en: 'Operator' },
  Media: { ru: 'Достоверность', en: 'Credibility' },
  Rocker: { ru: 'Харизматическое влияние', en: 'Charismatic Impact' }
};

const formatDateTime = (language: Language): string => {
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());
};

const renderList = (items: string[], emptyLabel: string): string => {
  if (items.length === 0) {
    return `<p class="empty">${escapeHtml(emptyLabel)}</p>`;
  }

  return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
};

export const buildCharacterPrintHtml = (
  character: Character,
  derivedStats: DerivedStats,
  language: Language
): string => {
  const labels = LABELS[language];
  const money = `${Number(character.money || 0).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')} eb`;
  const name = escapeHtml(character.name || '-');
  const role = escapeHtml(character.role || '-');
  const roleAbility = ROLE_ABILITY_LABELS[character.role];

  const statsHtml = STAT_ORDER.map((stat) => {
    const value = character.stats[stat] ?? 0;
    return `<div class="chip"><span>${stat}</span><strong>${escapeHtml(value)}</strong></div>`;
  }).join('');

  const skills = Object.entries(character.skills || {})
    .filter(([, level]) => Number(level) > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, level]) => `${escapeHtml(skill)} <span class="muted">(${escapeHtml(labels.skillLevel)} ${escapeHtml(level)})</span>`);
  const customCombatSkills = (character.customCombatSkills || [])
    .filter((skill) => skill.name.trim() || skill.level > 0 || skill.description.trim())
    .map((skill) => {
      const parts = [
        escapeHtml(skill.name || (language === 'ru' ? 'Пользовательский приём' : 'Custom combat skill')),
        `<span class="muted">(${escapeHtml(labels.skillLevel)} ${escapeHtml(skill.level)})</span>`
      ];

      if (skill.description.trim()) {
        parts.push(`<span class="muted"> — ${escapeHtml(skill.description)}</span>`);
      }

      return parts.join('');
    });

  const cyberware = (character.cyberware || [])
    .map((implant) => `${escapeHtml(implant.name)} <span class="muted">(HL: ${escapeHtml(implant.hl)} | ${escapeHtml(implant.cost)} eb)</span>`);

  const weapons = (character.weapons || []).map((weapon) => escapeHtml(weapon.name));
  const armor = (character.armor || []).map((item) => escapeHtml(item.name));
  const gear = (character.gear || []).map((item) => escapeHtml(item.name));

  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(labels.title)}</title>
  <style>
    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #131722;
      --muted: #5f6777;
      --line: #d9deea;
      --accent: #0969da;
      --ok: #1a7f37;
      --danger: #bc4c00;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.35;
      padding: 24px;
    }
    .sheet {
      max-width: 980px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
    }
    .header {
      padding: 22px;
      background: linear-gradient(135deg, #0b1222, #141f38);
      color: #fff;
    }
    .header h1 {
      margin: 0 0 6px;
      font-size: 28px;
    }
    .meta {
      color: #c9d6f4;
      font-size: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 18px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 14px;
      background: #fff;
      break-inside: avoid;
    }
    .full { grid-column: 1 / -1; }
    h2 {
      margin: 0 0 10px;
      font-size: 15px;
      color: var(--accent);
    }
    .row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed var(--line);
      padding: 6px 0;
      gap: 8px;
    }
    .row:last-child { border-bottom: 0; }
    .muted { color: var(--muted); }
    .chips {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .chip {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 6px 8px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      background: #fbfcff;
    }
    ul {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 4px;
    }
    .empty {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      font-style: italic;
    }
    .equip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 10px;
      color: var(--muted);
      background: #fff;
    }
    .accent { color: var(--accent); }
    .ok { color: var(--ok); }
    .danger { color: var(--danger); }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { border: 0; border-radius: 0; }
      .grid { gap: 10px; }
      @page { size: A4; margin: 12mm; }
    }
    @media (max-width: 760px) {
      .grid { grid-template-columns: 1fr; }
      .chips, .equip { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <header class="header">
      <h1>${escapeHtml(labels.title)}</h1>
      <div class="meta">${escapeHtml(labels.generatedAt)}: ${escapeHtml(formatDateTime(language))}</div>
    </header>

    <section class="grid">
      <article class="card">
        <h2>${escapeHtml(labels.sectionBasic)}</h2>
        <div class="row"><span class="muted">${escapeHtml(labels.name)}</span><strong>${name}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.role)}</span><strong>${role}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.level)}</span><strong>${escapeHtml(character.level)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.money)}</span><strong>${escapeHtml(money)}</strong></div>
      </article>

      <article class="card">
        <h2>${escapeHtml(labels.sectionDerived)}</h2>
        <div class="row"><span class="muted">${escapeHtml(labels.hp)}</span><strong class="ok">${escapeHtml(derivedStats.hp)} / ${escapeHtml(derivedStats.maxHP)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.armorState)}</span><strong>${escapeHtml(labels.armorBody)} ${escapeHtml(derivedStats.armorBody)} / ${escapeHtml(derivedStats.maxArmorBody)} • ${escapeHtml(labels.armorHead)} ${escapeHtml(derivedStats.armorHead)} / ${escapeHtml(derivedStats.maxArmorHead)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.speed)}</span><strong>${escapeHtml(derivedStats.speed)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.humanity)}</span><strong class="${derivedStats.humanity < 40 ? 'danger' : 'ok'}">${escapeHtml(derivedStats.humanity)} / ${escapeHtml(derivedStats.maxHumanity)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.interfaceLevel)}</span><strong>${escapeHtml(derivedStats.interface)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.totalHl)}</span><strong>${escapeHtml(derivedStats.totalHL)}</strong></div>
      </article>

      <article class="card">
        <h2>${escapeHtml(labels.sectionRoleAbility)}</h2>
        <div class="row"><span class="muted">${escapeHtml(labels.roleAbility)}</span><strong>${escapeHtml(language === 'ru' ? roleAbility.ru : roleAbility.en)}</strong></div>
        <div class="row"><span class="muted">${escapeHtml(labels.roleAbilityRank)}</span><strong>${escapeHtml(character.roleAbilityRank)}</strong></div>
      </article>

      <article class="card full">
        <h2>${escapeHtml(labels.sectionStats)}</h2>
        <div class="chips">${statsHtml}</div>
      </article>

      <article class="card">
        <h2>${escapeHtml(labels.sectionSkills)}</h2>
        ${renderList([...skills, ...customCombatSkills], labels.empty)}
      </article>

      <article class="card">
        <h2>${escapeHtml(labels.sectionCyberware)}</h2>
        <p class="badge"><span>${escapeHtml(character.cyberware?.length ?? 0)}</span><span>${escapeHtml(labels.count)}</span></p>
        ${renderList(cyberware, labels.empty)}
      </article>

      <article class="card full">
        <h2>${escapeHtml(labels.sectionEquipment)}</h2>
        <div class="equip">
          <div>
            <p class="badge accent">${escapeHtml(labels.weapon)}: ${escapeHtml(weapons.length)}</p>
            ${renderList(weapons, labels.empty)}
          </div>
          <div>
            <p class="badge accent">${escapeHtml(labels.armor)}: ${escapeHtml(armor.length)}</p>
            ${renderList(armor, labels.empty)}
          </div>
          <div>
            <p class="badge accent">${escapeHtml(labels.gear)}: ${escapeHtml(gear.length)}</p>
            ${renderList(gear, labels.empty)}
          </div>
        </div>
      </article>
    </section>
  </main>
</body>
</html>`;
};

export const exportCharacterToPdf = (
  character: Character,
  derivedStats: DerivedStats,
  language: Language
): void => {
  const html = buildCharacterPrintHtml(character, derivedStats, language);
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=800');

  if (!printWindow) {
    throw new Error(language === 'ru' ? 'Окно печати заблокировано браузером' : 'Print window was blocked by the browser');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 180);
};
