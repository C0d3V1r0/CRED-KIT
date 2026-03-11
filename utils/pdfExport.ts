import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import skillsData from '@/data/skills.json';
import type { Character, DerivedStats, StatKey } from '@/types';
import type { Language } from '@/i18n/translations';
import { formatRole } from './dice';

const STAT_ORDER: StatKey[] = ['INT', 'REF', 'DEX', 'TECH', 'WILL', 'COOL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
const PAGE_SIZE: [number, number] = [595.28, 841.89];
const PAGE_MARGIN = 34;
const HEADER_HEIGHT = 72;
const SECTION_GAP = 16;
const CARD_PADDING = 12;
const DEFAULT_LINE_HEIGHT = 15;

const SKILLS = skillsData.skills as Record<string, { label: string }>;

interface Labels {
  fileName: string;
  title: string;
  subtitle: string;
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
  armorHead: string;
  armorBody: string;
  speed: string;
  humanity: string;
  interfaceLevel: string;
  totalHl: string;
  skillLevel: string;
  weapons: string;
  armor: string;
  gear: string;
  noData: string;
  customCombatSkill: string;
}

const LABELS: Record<Language, Labels> = {
  ru: {
    fileName: 'cred-kit-character-sheet.pdf',
    title: 'Анкета персонажа',
    subtitle: 'CRED KIT',
    sectionBasic: 'Основная информация',
    sectionDerived: 'Ключевые показатели',
    sectionRoleAbility: 'Ролевая способность',
    sectionStats: 'Характеристики',
    sectionSkills: 'Навыки',
    sectionCyberware: 'Установленный хром',
    sectionEquipment: 'Снаряжение',
    name: 'Имя',
    role: 'Роль',
    level: 'Уровень',
    roleAbility: 'Способность',
    roleAbilityRank: 'Ранг',
    money: 'Эдди',
    hp: 'HP',
    armorHead: 'Броня головы',
    armorBody: 'Броня корпуса',
    speed: 'Скорость',
    humanity: 'Человечность',
    interfaceLevel: 'Интерфейс',
    totalHl: 'Потеря человечности',
    skillLevel: 'ур.',
    weapons: 'Оружие',
    armor: 'Броня',
    gear: 'Предметы',
    noData: 'Нет данных',
    customCombatSkill: 'Пользовательский боевой навык'
  },
  en: {
    fileName: 'cred-kit-character-sheet.pdf',
    title: 'Character Sheet',
    subtitle: 'CRED KIT',
    sectionBasic: 'Basic Information',
    sectionDerived: 'Core Metrics',
    sectionRoleAbility: 'Role Ability',
    sectionStats: 'Attributes',
    sectionSkills: 'Skills',
    sectionCyberware: 'Installed Cyberware',
    sectionEquipment: 'Equipment',
    name: 'Name',
    role: 'Role',
    level: 'Level',
    roleAbility: 'Ability',
    roleAbilityRank: 'Rank',
    money: 'Eddies',
    hp: 'HP',
    armorHead: 'Head Armor',
    armorBody: 'Body Armor',
    speed: 'Speed',
    humanity: 'Humanity',
    interfaceLevel: 'Interface',
    totalHl: 'Humanity Loss',
    skillLevel: 'lvl',
    weapons: 'Weapons',
    armor: 'Armor',
    gear: 'Items',
    noData: 'No data',
    customCombatSkill: 'Custom combat skill'
  }
};

const ROLE_ABILITY_LABELS: Record<Character['role'], { ru: string; en: string }> = {
  Nomad: { ru: 'Мото', en: 'Moto' },
  Solo: { ru: 'Боевое чутьё', en: 'Combat Awareness' },
  Netrunner: { ru: 'Интерфейс', en: 'Interface' },
  Tech: { ru: 'Мастер', en: 'Maker' },
  Medtech: { ru: 'Медицина', en: 'Medicine' },
  Exec: { ru: 'Командная работа', en: 'Teamwork' },
  Lawman: { ru: 'Подкрепление', en: 'Backup' },
  Fixer: { ru: 'Operator', en: 'Operator' },
  Media: { ru: 'Достоверность', en: 'Credibility' },
  Rocker: { ru: 'Харизматическое влияние', en: 'Charismatic Impact' }
};

interface PdfState {
  pdfDoc: PDFDocument;
  page: PDFPage;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  labels: Labels;
  language: Language;
  pageNumber: number;
  y: number;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const parsed = Number.parseInt(value, 16);
  return rgb(((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255);
}

const COLORS = {
  bg: hexToRgb('#f5f1e8'),
  panel: hexToRgb('#ffffff'),
  panelSoft: hexToRgb('#f1ece2'),
  line: hexToRgb('#d8d0c4'),
  text: hexToRgb('#182133'),
  muted: hexToRgb('#6c7486'),
  accent: hexToRgb('#d05239'),
  cyan: hexToRgb('#14638f'),
  green: hexToRgb('#1e8d64'),
  orange: hexToRgb('#b86b2c')
};

function addPage(state: PdfState) {
  state.page = state.pdfDoc.addPage(PAGE_SIZE);
  state.pageNumber += 1;
  state.y = PAGE_SIZE[1] - PAGE_MARGIN;

  state.page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_SIZE[0],
    height: PAGE_SIZE[1],
    color: COLORS.bg
  });
}

function drawHeader(state: PdfState, language: Language) {
  const { page, fontBold, fontRegular, labels } = state;
  const isFirstPage = state.pageNumber === 1;
  const headerTop = PAGE_SIZE[1] - PAGE_MARGIN;
  if (isFirstPage) {
    const headerY = headerTop - HEADER_HEIGHT;

    page.drawRectangle({
      x: PAGE_MARGIN,
      y: headerY,
      width: PAGE_SIZE[0] - PAGE_MARGIN * 2,
      height: HEADER_HEIGHT,
      color: COLORS.panelSoft,
      borderColor: COLORS.line,
      borderWidth: 1
    });

    page.drawRectangle({
      x: PAGE_MARGIN,
      y: PAGE_SIZE[1] - PAGE_MARGIN - 3,
      width: PAGE_SIZE[0] - PAGE_MARGIN * 2,
      height: 3,
      color: COLORS.accent
    });

    page.drawText(labels.subtitle, {
      x: PAGE_MARGIN + 18,
      y: headerY + 46,
      font: fontBold,
      size: 9,
      color: COLORS.accent
    });

    page.drawText(labels.title, {
      x: PAGE_MARGIN + 18,
      y: headerY + 20,
      font: fontBold,
      size: 24,
      color: COLORS.text
    });

    state.y = headerY - 16;
    return;
  }

  page.drawRectangle({
    x: PAGE_MARGIN,
    y: PAGE_SIZE[1] - PAGE_MARGIN - 1.5,
    width: PAGE_SIZE[0] - PAGE_MARGIN * 2,
    height: 1.5,
    color: COLORS.line
  });

  page.drawText(`${state.pageNumber}`, {
    x: PAGE_SIZE[0] - PAGE_MARGIN - 8,
    y: PAGE_SIZE[1] - PAGE_MARGIN - 16,
    font: fontRegular,
    size: 9,
    color: COLORS.text
  });

  state.y = PAGE_SIZE[1] - PAGE_MARGIN - 26;
}

function ensureSpace(state: PdfState, height: number) {
  if (state.y - height < PAGE_MARGIN) {
    addPage(state);
    drawHeader(state, state.language);
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let current = words[0];
    for (let index = 1; index < words.length; index += 1) {
      const next = `${current} ${words[index]}`;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        lines.push(current);
        current = words[index];
      }
    }
    lines.push(current);
  }

  return lines;
}

function drawSectionTitle(state: PdfState, title: string, nextBlockHeight = 0) {
  ensureSpace(state, 28 + nextBlockHeight);
  state.page.drawText(title, {
    x: PAGE_MARGIN,
    y: state.y,
    font: state.fontBold,
    size: 14,
    color: COLORS.cyan
  });
  state.y -= 20;
}

function drawPanel(state: PdfState, x: number, y: number, width: number, height: number) {
  state.page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: COLORS.panel,
    borderColor: COLORS.line,
    borderWidth: 1
  });
}

function drawLabelValueCard(state: PdfState, x: number, y: number, width: number, label: string, value: string, accent = COLORS.text) {
  const height = 52;
  drawPanel(state, x, y, width, height);
  state.page.drawText(label, {
    x: x + CARD_PADDING,
    y: y - 16,
    font: state.fontRegular,
    size: 9,
    color: COLORS.muted
  });
  state.page.drawText(value, {
    x: x + CARD_PADDING,
    y: y - 34,
    font: state.fontBold,
    size: 14,
    color: accent
  });
  return height;
}

function drawHeroSummary(state: PdfState, character: Character, derivedStats: DerivedStats, language: Language) {
  const width = PAGE_SIZE[0] - PAGE_MARGIN * 2;
  const height = 128;
  const roleLabel = formatRole(character.role, language);
  const roleAbility = language === 'ru' ? ROLE_ABILITY_LABELS[character.role].ru : ROLE_ABILITY_LABELS[character.role].en;
  const heroY = state.y;

  state.page.drawRectangle({
    x: PAGE_MARGIN,
    y: heroY - height,
    width,
    height,
    color: COLORS.panelSoft,
    borderColor: COLORS.line,
    borderWidth: 1
  });

  state.page.drawRectangle({
    x: PAGE_MARGIN,
    y: heroY - 4,
    width,
    height: 4,
    color: COLORS.accent
  });

  state.page.drawText(language === 'ru' ? 'Профиль персонажа' : 'Character profile', {
    x: PAGE_MARGIN + 16,
    y: heroY - 19,
    font: state.fontBold,
    size: 9,
    color: COLORS.accent
  });

  state.page.drawText(character.name || '—', {
    x: PAGE_MARGIN + 16,
    y: heroY - 49,
    font: state.fontBold,
    size: 25,
    color: COLORS.text
  });

  state.page.drawText(roleLabel, {
    x: PAGE_MARGIN + 16,
    y: heroY - 69,
    font: state.fontRegular,
    size: 11,
    color: COLORS.cyan
  });

  state.page.drawText(roleAbility, {
    x: PAGE_MARGIN + 16,
    y: heroY - 84,
    font: state.fontRegular,
    size: 9,
    color: COLORS.muted
  });

  const metricWidth = (width - 32 - 24) / 4;
  const metricHeight = 36;
  const metricGap = 8;
  const startX = PAGE_MARGIN + 16;
  const startY = heroY - 96;
  const metrics = [
    { label: state.labels.level, value: String(character.level), color: COLORS.accent },
    { label: state.labels.roleAbilityRank, value: String(character.roleAbilityRank), color: COLORS.orange },
    { label: state.labels.hp, value: `${derivedStats.hp}`, color: COLORS.green },
    { label: state.labels.humanity, value: `${derivedStats.humanity}`, color: COLORS.cyan }
  ];

  metrics.forEach((metric, index) => {
    const x = startX + index * (metricWidth + metricGap);
    const y = startY;
    state.page.drawRectangle({
      x,
      y: y - metricHeight,
      width: metricWidth,
      height: metricHeight,
      color: COLORS.panel,
      borderColor: COLORS.line,
      borderWidth: 1
    });
    state.page.drawText(metric.label, {
      x: x + 10,
      y: y - 12,
      font: state.fontRegular,
      size: 8,
      color: COLORS.muted
    });
    state.page.drawText(metric.value, {
      x: x + 10,
      y: y - 27,
      font: state.fontBold,
      size: 14,
      color: metric.color
    });
  });

  state.y -= height + 16;
}

function drawRoleAbilityPanel(state: PdfState, character: Character, language: Language) {
  const width = PAGE_SIZE[0] - PAGE_MARGIN * 2;
  const height = 68;
  const abilityLabel = language === 'ru' ? ROLE_ABILITY_LABELS[character.role].ru : ROLE_ABILITY_LABELS[character.role].en;

  ensureSpace(state, height + 8);
  drawPanel(state, PAGE_MARGIN, state.y, width, height);

  state.page.drawText(state.labels.roleAbility, {
    x: PAGE_MARGIN + CARD_PADDING,
    y: state.y - 16,
    font: state.fontRegular,
    size: 9,
    color: COLORS.muted
  });

  state.page.drawText(abilityLabel, {
    x: PAGE_MARGIN + CARD_PADDING,
    y: state.y - 38,
    font: state.fontBold,
    size: 18,
    color: COLORS.orange
  });

  const rankValue = String(character.roleAbilityRank);
  const rankWidth = state.fontBold.widthOfTextAtSize(rankValue, 20);
  const rankLabelWidth = state.fontRegular.widthOfTextAtSize(state.labels.roleAbilityRank, 9);
  const rightX = PAGE_MARGIN + width - CARD_PADDING;

  state.page.drawText(state.labels.roleAbilityRank, {
    x: rightX - rankLabelWidth,
    y: state.y - 16,
    font: state.fontRegular,
    size: 9,
    color: COLORS.muted
  });

  state.page.drawText(rankValue, {
    x: rightX - rankWidth,
    y: state.y - 38,
    font: state.fontBold,
    size: 20,
    color: COLORS.orange
  });

  state.y -= height + SECTION_GAP;
}

function drawStatsGrid(state: PdfState, character: Character, language: Language) {
  const columns = 5;
  const gap = 8;
  const width = PAGE_SIZE[0] - PAGE_MARGIN * 2;
  const cardWidth = (width - gap * (columns - 1)) / columns;
  const cardHeight = 46;
  const rows = Math.ceil(STAT_ORDER.length / columns);
  const height = rows * cardHeight + (rows - 1) * gap;

  ensureSpace(state, height + 8);

  STAT_ORDER.forEach((stat, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = PAGE_MARGIN + column * (cardWidth + gap);
    const y = state.y - row * (cardHeight + gap);
    const labelMap: Record<StatKey, string> = language === 'ru'
      ? {
          INT: 'INT',
          REF: 'REF',
          DEX: 'DEX',
          TECH: 'TECH',
          WILL: 'WILL',
          COOL: 'ХАР',
          LUCK: 'LUCK',
          MOVE: 'SPD',
          BODY: 'BODY',
          EMP: 'EMP'
        }
      : {
          INT: 'INT',
          REF: 'REF',
          DEX: 'DEX',
          TECH: 'TECH',
          WILL: 'WILL',
          COOL: 'CHA',
          LUCK: 'LUCK',
          MOVE: 'SPD',
          BODY: 'BODY',
          EMP: 'EMP'
        };

    drawPanel(state, x, y, cardWidth, cardHeight);
    state.page.drawText(labelMap[stat], {
      x: x + 10,
      y: y - 15,
      font: state.fontBold,
      size: 9,
      color: COLORS.muted
    });
    state.page.drawText(String(character.stats[stat] ?? 0), {
      x: x + 10,
      y: y - 33,
      font: state.fontBold,
      size: 16,
      color: COLORS.text
    });
  });

  state.y -= height + SECTION_GAP;
}

function drawTwoColumnListSection(state: PdfState, items: string[], emptyLabel: string) {
  const width = PAGE_SIZE[0] - PAGE_MARGIN * 2;
  const gap = 10;
  const columnWidth = (width - gap) / 2;
  const sourceItems = items.length > 0 ? items : [emptyLabel];
  const midpoint = Math.ceil(sourceItems.length / 2);
  const columns = [sourceItems.slice(0, midpoint), sourceItems.slice(midpoint)];

  const columnHeights = columns.map((columnItems) => {
    if (columnItems.length === 0) {
      return CARD_PADDING * 2 + DEFAULT_LINE_HEIGHT;
    }

    const lineCount = columnItems.reduce((total, item) => {
      const wrapped = wrapText(item, state.fontRegular, 9, columnWidth - CARD_PADDING * 2 - 10);
      return total + Math.max(1, wrapped.length);
    }, 0);

    return CARD_PADDING * 2 + lineCount * 13;
  });

  const height = Math.max(...columnHeights, CARD_PADDING * 2 + DEFAULT_LINE_HEIGHT);
  ensureSpace(state, height + 8);

  columns.forEach((columnItems, index) => {
    const x = PAGE_MARGIN + index * (columnWidth + gap);
    drawPanel(state, x, state.y, columnWidth, height);

    let lineY = state.y - 16;
    if (columnItems.length === 0) {
      state.page.drawText(emptyLabel, {
        x: x + CARD_PADDING,
        y: lineY,
        font: state.fontRegular,
        size: 9,
        color: COLORS.muted
      });
      return;
    }

    columnItems.forEach((item) => {
      wrapText(item, state.fontRegular, 9, columnWidth - CARD_PADDING * 2 - 10).forEach((line, lineIndex) => {
        const prefix = lineIndex === 0 ? '• ' : '  ';
        state.page.drawText(`${prefix}${line}`, {
          x: x + CARD_PADDING,
          y: lineY,
          font: state.fontRegular,
          size: 9,
          color: items.length === 0 ? COLORS.muted : COLORS.text
        });
        lineY -= 13;
      });
    });
  });

  state.y -= height + SECTION_GAP;
}

function drawEquipmentColumns(state: PdfState, labels: Labels, character: Character) {
  const width = PAGE_SIZE[0] - PAGE_MARGIN * 2;
  const gap = 10;
  const columnWidth = (width - gap * 2) / 3;
  const groups = [
    { title: labels.weapons, items: (character.weapons || []).map((item) => item.name) },
    { title: labels.armor, items: (character.armor || []).map((item) => item.name) },
    { title: labels.gear, items: (character.gear || []).map((item) => item.name) }
  ];

  const heights = groups.map((group) => {
    const lines = group.items.length > 0 ? group.items.flatMap((item) => wrapText(item, state.fontRegular, 9, columnWidth - CARD_PADDING * 2 - 10)) : [labels.noData];
    return 34 + lines.length * 13 + CARD_PADDING;
  });
  const height = Math.max(...heights);

  ensureSpace(state, height + 8);

  groups.forEach((group, index) => {
    const x = PAGE_MARGIN + index * (columnWidth + gap);
    drawPanel(state, x, state.y, columnWidth, height);

    state.page.drawText(group.title, {
      x: x + CARD_PADDING,
      y: state.y - 16,
      font: state.fontBold,
      size: 10,
      color: COLORS.orange
    });

    let lineY = state.y - 34;
    if (group.items.length === 0) {
      state.page.drawText(labels.noData, {
        x: x + CARD_PADDING,
        y: lineY,
        font: state.fontRegular,
        size: 9,
        color: COLORS.muted
      });
      return;
    }

    group.items.forEach((item) => {
      wrapText(item, state.fontRegular, 9, columnWidth - CARD_PADDING * 2 - 10).forEach((line, lineIndex) => {
        const prefix = lineIndex === 0 ? '• ' : '  ';
        state.page.drawText(`${prefix}${line}`, {
          x: x + CARD_PADDING,
          y: lineY,
          font: state.fontRegular,
          size: 9,
          color: COLORS.text
        });
        lineY -= 13;
      });
    });
  });

  state.y -= height + SECTION_GAP;
}

async function loadFontBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function triggerPdfDownload(bytes: Uint8Array, fileName: string) {
  const safeBytes = new Uint8Array(bytes);
  const blob = new Blob([safeBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const exportCharacterToPdf = async (
  character: Character,
  derivedStats: DerivedStats,
  language: Language
): Promise<void> => {
  const labels = LABELS[language];
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [fontRegularBytes, fontBoldBytes] = await Promise.all([
    loadFontBytes('/fonts/arial-unicode.ttf'),
    loadFontBytes('/fonts/arial-bold.ttf')
  ]);

  const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);
  const state: PdfState = {
    pdfDoc,
    page: pdfDoc.addPage(PAGE_SIZE),
    fontRegular,
    fontBold,
    labels,
    language,
    pageNumber: 0,
    y: 0
  };

  state.pdfDoc.removePage(0);
  addPage(state);
  drawHeader(state, language);
  drawHeroSummary(state, character, derivedStats, language);

  const cardGap = 10;
  const cardWidth = (PAGE_SIZE[0] - PAGE_MARGIN * 2 - cardGap) / 2;
  drawSectionTitle(state, labels.sectionBasic, 136);
  ensureSpace(state, 114);
  drawLabelValueCard(state, PAGE_MARGIN, state.y, cardWidth, labels.name, character.name || '—');
  drawLabelValueCard(state, PAGE_MARGIN + cardWidth + cardGap, state.y, cardWidth, labels.role, formatRole(character.role, language), COLORS.accent);
  state.y -= 62;
  drawLabelValueCard(state, PAGE_MARGIN, state.y, cardWidth, labels.level, String(character.level));
  drawLabelValueCard(state, PAGE_MARGIN + cardWidth + cardGap, state.y, cardWidth, labels.money, `${character.money.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')} eb`, COLORS.green);
  state.y -= 68;

  drawSectionTitle(state, labels.sectionDerived, 198);
  ensureSpace(state, 114);
  drawLabelValueCard(state, PAGE_MARGIN, state.y, cardWidth, labels.hp, `${derivedStats.hp} / ${derivedStats.maxHP}`, COLORS.green);
  drawLabelValueCard(state, PAGE_MARGIN + cardWidth + cardGap, state.y, cardWidth, labels.humanity, `${derivedStats.humanity} / ${derivedStats.maxHumanity}`, derivedStats.humanity < 40 ? COLORS.accent : COLORS.green);
  state.y -= 62;
  drawLabelValueCard(state, PAGE_MARGIN, state.y, cardWidth, labels.armorHead, `${derivedStats.armorHead} / ${derivedStats.maxArmorHead}`, COLORS.orange);
  drawLabelValueCard(state, PAGE_MARGIN + cardWidth + cardGap, state.y, cardWidth, labels.armorBody, `${derivedStats.armorBody} / ${derivedStats.maxArmorBody}`, COLORS.orange);
  state.y -= 62;
  drawLabelValueCard(state, PAGE_MARGIN, state.y, cardWidth, labels.speed, String(derivedStats.speed), COLORS.cyan);
  drawLabelValueCard(state, PAGE_MARGIN + cardWidth + cardGap, state.y, cardWidth, labels.interfaceLevel, String(derivedStats.interface), COLORS.cyan);
  state.y -= 62;
  drawLabelValueCard(state, PAGE_MARGIN, state.y, PAGE_SIZE[0] - PAGE_MARGIN * 2, labels.totalHl, String(derivedStats.totalHL), COLORS.accent);
  state.y -= 68;

  drawSectionTitle(state, labels.sectionRoleAbility, 88);
  drawRoleAbilityPanel(state, character, language);

  drawSectionTitle(state, labels.sectionStats, 132);
  drawStatsGrid(state, character, language);

  const skillItems = Object.entries(character.skills || {})
    .filter(([, level]) => Number(level) > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([skillKey, level]) => `${SKILLS[skillKey]?.label || skillKey} (${labels.skillLevel} ${level})`);
  const customCombatSkills = (character.customCombatSkills || [])
    .filter((skill) => skill.name.trim() || skill.level > 0 || skill.description.trim())
    .map((skill) => {
      const name = skill.name.trim() || labels.customCombatSkill;
      const description = skill.description.trim() ? ` — ${skill.description.trim()}` : '';
      return `${name} (${labels.skillLevel} ${skill.level})${description}`;
    });
  const skillLines = [...skillItems, ...customCombatSkills];
  const estimatedSkillHeight = Math.max(72, Math.ceil(skillLines.length / 2) * 13 + CARD_PADDING * 2);
  drawSectionTitle(state, labels.sectionSkills, Math.min(estimatedSkillHeight, 220));
  drawTwoColumnListSection(state, skillLines, labels.noData);

  const cyberwareItems = (character.cyberware || []).map((implant) => `${implant.name} • HL ${implant.hl} • ${implant.cost} eb`);
  const estimatedCyberwareHeight = Math.max(72, Math.ceil(cyberwareItems.length / 2) * 13 + CARD_PADDING * 2);
  drawSectionTitle(state, labels.sectionCyberware, Math.min(estimatedCyberwareHeight, 180));
  drawTwoColumnListSection(state, cyberwareItems, labels.noData);

  drawSectionTitle(state, labels.sectionEquipment, 120);
  drawEquipmentColumns(state, labels, character);

  const bytes = await pdfDoc.save();
  triggerPdfDownload(bytes, labels.fileName);
};
