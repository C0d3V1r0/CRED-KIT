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
      'Добавлен обновлённый контур «Что нового», который отражает актуальные изменения версии.',
      'Добавлен rule-reference для NET Actions вместо старого хаусрульного калькулятора времени.',
      'Добавлена раздельная модель брони для головы и корпуса в ресурсах персонажа и derived stats.'
    ],
    improvedTitle: 'Что стало лучше',
    improved: [
      'Кардинально пересмотрен UX/UI: интерфейс стал чище, спокойнее, логичнее по иерархии и удобнее для длинной сессии.',
      'Категории и состав навыков приведены к более цельной и последовательной структуре без старого разнобоя по неймингу.',
      'Math-слой стал точнее: Interface, Humanity, HL и имплант-модификаторы теперь согласованы между UI, derived stats и тестами.',
      'Языковой флоу стал стабильнее: route-language и локальное состояние больше не спорят между собой.',
      'Путь сборки и тестов после миграции на Next выровнен: component/integration/a11y контуры снова проходят на актуальной архитектуре.'
    ],
    fixedTitle: 'Что исправлено',
    fixed: [
      'Ролевая способность больше не считается как обычный навык и отделена от базовых характеристик.',
      'Убран верхний лимит 10 у навыков и характеристик для уже развивающегося персонажа.',
      'Исправлена формула скорости: теперь MOVE даёт корректные 5 единиц скорости за 1 пункт характеристики.',
      'Здоровье, человечность и броня переведены в ручные редактируемые ресурсы, чтобы их можно было вести по сессии без борьбы с формулами.',
      'Навыки переразложены по более понятным категориям, а для боевых искусств и приёмов добавлены отдельные пользовательские слоты.'
    ],
    startTitle: 'Что тестировать в первую очередь',
    startSteps: [
      'Прогнать навыки целиком: категории, состав списка, пагинацию и кастомные боевые слоты.',
      'Проверить ресурсы персонажа: HP, Humanity, Armor Head, Armor Body.',
      'Проверить RU/EN переключение с первого клика и поведение route-language.',
      'Проверить PDF-экспорт и отображение новых броневых треков.',
      'Проверить Netrunning -> вкладку «Время»: там теперь справочник по NET Actions, а не калькулятор хаусрулов.',
      'Повторить ключевые сценарии на desktop и mobile.'
    ],
    expectedTitle: 'Ожидаемый результат',
    expected: [
      'Toolkit ближе к правилам Cyberpunk RED и не спорит сам с собой по математике.',
      'Каталог навыков и ресурсы персонажа совпадают с текущим rule-contract проекта.',
      'RU/EN, импорт, тестовый контур и производные расчёты работают предсказуемо.',
      'Desktop и mobile остаются стабильными после последних архитектурных и rule-accuracy правок.'
    ]
  },
  en: {
    title: 'Patch Notes (dev)',
    versionLabel: `Compared: v1.0.1 [BETA] -> ${APP_CONFIG.versionLabel}`,
    addedTitle: 'What is new',
    added: [
      'Added an updated What is New flow that now reflects the actual current version changes.',
      'Added a NET Actions rule reference instead of the old house-rule timing calculator.',
      'Added split armor tracking for head and body inside character resources and derived stats.'
    ],
    improvedTitle: 'What was improved',
    improved: [
      'UX/UI was heavily reworked: the interface is cleaner, calmer, more readable, and more consistent over long sessions.',
      'Skill categories and the skill list now follow a more coherent and consistent structure, without the old naming drift.',
      'The math layer is more accurate: Interface, Humanity, HL, and implant modifiers are now aligned across UI, derived stats, and tests.',
      'The language flow is more stable: route-language and local state no longer fight each other.',
      'Build and test flows after the Next migration are aligned again: component, integration, and a11y checks work on the current architecture.'
    ],
    fixedTitle: 'What was fixed',
    fixed: [
      'Role ability is no longer calculated like a regular skill and now stands apart from base attributes.',
      'The hard cap of 10 was removed from skills and attributes for characters that continue to grow after creation.',
      'The speed formula was corrected: MOVE now gives the proper 5 speed per 1 point of the attribute.',
      'Health, Humanity, and armor were moved into manual editable resource tracks so they can be managed session by session without fighting formulas.',
      'Skills were reorganized into clearer categories, and custom slots were added for martial arts and combat maneuvers.'
    ],
    startTitle: 'What to test first',
    startSteps: [
      'Run through the full skills flow: categories, list composition, pagination, and custom combat slots.',
      'Check character resources: HP, Humanity, Armor Head, Armor Body.',
      'Verify RU/EN switching on the first click and route-language behavior.',
      'Check PDF export and the new armor track rendering.',
      'Open Netrunning -> Time: it is now a NET Actions reference, not a house-rule calculator.',
      'Repeat the key flows on desktop and mobile.'
    ],
    expectedTitle: 'Expected outcome',
    expected: [
      'The toolkit is closer to Cyberpunk RED rules and no longer contradicts itself in core math.',
      'The skill catalog and character resources match the current project rule contract.',
      'RU/EN, import, the test contour, and derived calculations behave predictably.',
      'Desktop and mobile remain stable after the latest architecture and rule-accuracy pass.'
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
