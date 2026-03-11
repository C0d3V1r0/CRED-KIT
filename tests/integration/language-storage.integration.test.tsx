import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppProviders } from '@/core/providers/AppProviders';
import { useLanguage } from '@/features/settings/model/hooks';

function TestLanguageConsumer() {
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <p data-testid="lang-value">{language}</p>
      <button data-testid="set-en" onClick={() => setLanguage('en')}>set-en</button>
      <button data-testid="set-ru" onClick={() => setLanguage('ru')}>set-ru</button>
    </div>
  );
}

describe('LanguageProvider integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('читает стартовый язык из localStorage и сохраняет изменения', () => {
    window.localStorage.setItem('credkit-language', 'en');

    render(
      <AppProviders>
        <TestLanguageConsumer />
      </AppProviders>
    );

    expect(screen.getByTestId('lang-value')).toHaveTextContent('en');

    fireEvent.click(screen.getByTestId('set-ru'));
    expect(window.localStorage.getItem('credkit-language')).toBe('ru');
    expect(screen.getByTestId('lang-value')).toHaveTextContent('ru');
  });
});
