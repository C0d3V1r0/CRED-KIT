# CRED KIT Design System v2

## Цель
Дать единый визуальный контракт для всех модулей CRED KIT: читаемость, стабильность интерфейса и быстрые изменения без ручного "шаманства" в каждом компоненте.

## 1) Токены

### Базовые токены
- `--cyber-*` — брендовые цвета и эффекты.
- `--space-*` — шкала отступов.
- `--radius-*` — радиусы.
- `--transition-*` — длительности анимаций.

### Семантический слой (v2)
- `--surface-primary`, `--surface-secondary`, `--surface-elevated`
- `--text-primary`, `--text-secondary`, `--text-inverse`
- `--border-subtle`, `--border-strong`
- `--state-danger`, `--state-warning`, `--state-success`, `--state-info`
- `--motion-ease-standard`, `--motion-ease-snappy`

Правило: новые стили в фичах должны опираться на семантический слой, а не на "сырые" цвета.

## 2) Базовые примитивы

### Кнопки
- `.btn` — primary CTA
- `.btn-outline` — secondary action
- `.btn-ghost` — text/tertiary action
- `.btn-danger` — destructive action

### Поля ввода
- `.input` — single-line input
- `.input-text` — textarea
- `.select` — select
- состояния: `.input-error`, `.input-success`

### Карточки
- `.card-cyber` — основной контейнер модуля
- `.card`, `.card-hover` — вспомогательные контейнеры

### Навигация оболочки
- `.app-nav-btn`, `.module-tab-btn`, `.app-burger-btn`

## 3) Правила применения

1. Не дублировать utility-классы Tailwind в `app/globals.css`.
2. Не задавать новые "жесткие" цвета в компонентах, если есть токен.
3. Hover/active/focus у интерактивов должны быть определены всегда.
4. Для фокуса использовать общую логику видимого `focus-visible`.
5. Новые вариации примитивов добавлять в `styles/system/*`, а не локально в JSX.

## 4) Что уже очищено

- Из `app/globals.css` удален крупный дублирующий блок `Utility overrides`.
- Оставлены только прикладные и доменно-специфичные классы.

## 5) Следующий шаг (v2.1)

1. Перенести остаточные legacy-классы из `index.css` в `components.css`/`effects.css`.
2. Ввести единые `size`-модификаторы для кнопок/инпутов (`sm/md/lg`).
3. Сделать минимальный visual-regression smoke для ключевых экранов.
