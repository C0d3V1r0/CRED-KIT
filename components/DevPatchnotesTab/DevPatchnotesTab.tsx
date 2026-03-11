import { useLanguage } from '../../features/settings/model/hooks';
import { APP_CONFIG } from '../../config/appConfig';

type PatchnotesContent = {
  title: string;
  versionLabel: string;
  addedTitle: string;
  added: string[];
  improvedTitle: string;
  improved: string[];
  fixedTitle: string;
  fixed: string[];
  startTitle: string;
  startSteps: string[];
  expectedTitle: string;
  expected: string[];
};

const contentByLanguage: Record<'ru' | 'en', PatchnotesContent> = {
  ru: {
    title: 'Патчноут (dev)',
    versionLabel: `Сравнение: v1.0.1 [BETA] -> ${APP_CONFIG.versionLabel}`,
    addedTitle: 'Что появилось нового',
    added: [
      'Добавлена отдельная категория «Сценические навыки» с актерским мастерством и игрой на инструментах.',
      'Добавлены пропущенные образовательные навыки: знание языка, знание местности и наука.',
      'PDF-экспорт переведён на прямую генерацию файла без браузерного окна печати и блокировки popup.'
    ],
    improvedTitle: 'Что стало лучше',
    improved: [
      'Числовые поля в чарнике стали вести себя спокойнее: значения теперь можно нормально очищать и вводить заново без борьбы с нулями и единицами.',
      'Нейминг в чарнике и ролях стал последовательнее: Харизма, Скорость и Корпорат теперь выглядят как часть одной системы.',
      'Сетка характеристик и блоки основных действий подровнены, чтобы чарник выглядел чище и не разваливался по ритму.',
      'В хроме описания эффектов и конфликтов стали читаемыми для человека, а не похожими на системный вывод.',
      'Блок про расчёты в разделе «О проекте» приведён к текущей модели ручных ресурсов и актуальной логике проекта.'
    ],
    fixedTitle: 'Что исправлено',
    fixed: [
      'Исправлен ввод уровня, ранга способности, HP, человечности и брони: лишние стартовые цифры больше не мешают ручной правке.',
      'У навыка «Судоходство» убрана ошибочная стоимость x2.',
      'Для навыков «Подрывник», «Электроника / Безопасность» и «Парамедик» выставлена корректная стоимость x2.',
      'В русском UI убрано смешение русского и английского в названиях и описаниях ролевых способностей.',
      'Экспорт анкеты больше не падает из-за блокировки браузерного окна печати.'
    ],
    startTitle: 'Что тестировать в первую очередь',
    startSteps: [
      'Проверить ручной ввод в уровнях, ранге способности, HP, человечности и броне: очистка поля и повторный ввод должны работать без лишних цифр.',
      'Проверить названия статов и ролей в русском UI: Харизма, Скорость, Корпорат, Мастер.',
      'Прогнать ветки навыков «Образованность», «Сценические навыки» и «Техника», включая x2-модификаторы.',
      'Открыть несколько имплантов в хроме и убедиться, что эффекты и конфликты показываются читаемо.',
      'Проверить PDF-экспорт: анкета должна скачиваться сразу, без блокировки браузером.',
      'Повторить ключевые сценарии чарника на desktop и mobile.'
    ],
    expectedTitle: 'Ожидаемый результат',
    expected: [
      'Чарник не раздражает на базовых ручных действиях и не заставляет бороться с полями ввода.',
      'Навыки и роли выглядят последовательнее и ближе к ожидаемой терминологии игры.',
      'Хром и PDF-экспорт воспринимаются как рабочие пользовательские инструменты, а не как технические заготовки.',
      'Основные сценарии персонажа проходят стабильно и без визуально странных мелких косяков.'
    ]
  },
  en: {
    title: 'Patch Notes (dev)',
    versionLabel: `Compared: v1.0.1 [BETA] -> ${APP_CONFIG.versionLabel}`,
    addedTitle: 'What is new',
    added: [
      'Added a dedicated Performance skill category with Acting and Play Instrument.',
      'Added the missing education skills: Language, Local Expert, and Science.',
      'Moved PDF export to direct file generation without the browser print window and popup blocking.'
    ],
    improvedTitle: 'What was improved',
    improved: [
      'Numeric fields in the character sheet now behave more naturally when clearing and re-entering values.',
      'Naming is more consistent across the sheet and role data, especially for Russian UI labels and role names.',
      'The attribute grid and top action buttons were tightened up so the sheet feels cleaner and more balanced.',
      'Cyberware effect and incompatibility descriptions now read like user-facing text instead of system output.',
      'The calculations block in About now reflects the current manual resource model and live project logic.'
    ],
    fixedTitle: 'What was fixed',
    fixed: [
      'Input for level, role ability rank, HP, humanity, and armor no longer fights the user with leftover starter digits.',
      'Pilot Sea Vehicle no longer has an incorrect x2 cost.',
      'Demolitions, Electronics / Security Tech, and Paramedic now use the correct x2 cost.',
      'Russian UI no longer mixes Russian and English in role ability names and descriptions.',
      'Character sheet export no longer fails because of browser print popup blocking.'
    ],
    startTitle: 'What to test first',
    startSteps: [
      'Check manual input in level, role ability rank, HP, humanity, and armor: clearing and retyping should work cleanly.',
      'Verify Russian stat and role naming: Charisma, Speed, Corp, Maker.',
      'Run through Education, Performance, and Technique skills, including x2 modifiers.',
      'Open several cyberware items and verify that effects and incompatibilities are readable.',
      'Check PDF export: the sheet should download directly without browser blocking.',
      'Repeat the main character sheet flows on desktop and mobile.'
    ],
    expectedTitle: 'Expected outcome',
    expected: [
      'The sheet should no longer feel annoying during basic manual edits.',
      'Skills and roles should feel more coherent and closer to the expected game terminology.',
      'Cyberware and PDF export should behave like real user-facing tools instead of technical prototypes.',
      'Core character sheet flows should remain stable without small but obvious UI or logic hiccups.'
    ]
  }
};

export default function DevPatchnotesTab() {
  const { language } = useLanguage();
  const content = contentByLanguage[language];

  const renderList = (items: string[], ordered = false) => {
    if (ordered) {
      return (
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-cyber-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    }

    return (
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-cyber-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-cyber">
        <h2 className="text-lg font-bold text-cyber-text">{content.title}</h2>
        <p className="mt-2 text-sm text-cyber-accent">{content.versionLabel}</p>
      </div>

      <section className="card-cyber space-y-4">
        <h3 className="text-base font-semibold text-cyber-text">{content.addedTitle}</h3>
        {renderList(content.added)}
      </section>

      <section className="card-cyber space-y-4">
        <h3 className="text-base font-semibold text-cyber-text">{content.improvedTitle}</h3>
        {renderList(content.improved)}
      </section>

      <section className="card-cyber space-y-4">
        <h3 className="text-base font-semibold text-cyber-text">{content.fixedTitle}</h3>
        {renderList(content.fixed)}
      </section>

      <section className="card-cyber space-y-4">
        <h3 className="text-base font-semibold text-cyber-text">{content.startTitle}</h3>
        {renderList(content.startSteps, true)}
      </section>

      <section className="card-cyber space-y-4">
        <h3 className="text-base font-semibold text-cyber-text">{content.expectedTitle}</h3>
        {renderList(content.expected)}
      </section>
    </div>
  );
}
