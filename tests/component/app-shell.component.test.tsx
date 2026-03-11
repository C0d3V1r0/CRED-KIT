import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import App from '@/toolkit/App';
import { renderWithProviders } from '../utils/renderWithProviders';

describe('App shell component', () => {
  it('рендерит ключевую навигацию', async () => {
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    renderWithProviders(<App />);

    expect(await screen.findByTestId('nav-character')).toBeInTheDocument();
    expect(screen.getByTestId('nav-cyberware')).toBeInTheDocument();
    expect(screen.getByTestId('nav-netrunner')).toBeInTheDocument();
  });

  it('переключает язык через кнопки RU/EN', async () => {
    window.localStorage.setItem('credkit-language', 'ru');
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    renderWithProviders(<App />);

    expect(await screen.findByTestId('nav-character')).toHaveTextContent('Персонаж');

    const enBtn = await screen.findByTestId('lang-en');
    fireEvent.click(enBtn);

    expect(screen.getByTestId('nav-character')).toHaveTextContent('Character');
  });

  it('открывает мобильное меню и переключает вкладку', async () => {
    window.localStorage.setItem('credkit-language', 'ru');
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    renderWithProviders(<App />);

    const menuToggle = await screen.findByTestId('mobile-menu-toggle');
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuToggle);
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByTestId('mobile-nav-about'));

    expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    expect(await screen.findByText(/Твой Cyberpunk RED/i)).toBeInTheDocument();
  });

  it('обновляет css-переменную высоты хедера для мобильного меню', async () => {
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    renderWithProviders(<App />);

    await screen.findByTestId('mobile-menu-toggle');

    const headerHeightVar = document.documentElement.style.getPropertyValue('--app-mobile-header-height').trim();
    expect(headerHeightVar).toMatch(/^\d+px$/);
    expect(Number.parseInt(headerHeightVar, 10)).toBeGreaterThanOrEqual(64);
  });

  it('показывает приветственный алерт при первом входе и ведет в карту новичка', async () => {
    window.localStorage.setItem('credkit-language', 'ru');
    window.localStorage.removeItem('credkit-welcome-alert-seen-v1');
    window.localStorage.removeItem('credkit-whats-new-seen-version');
    renderWithProviders(<App />);

    expect(await screen.findByTestId('welcome-alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Привет\. Я Майя/i })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('welcome-open-map'));

    expect(await screen.findByText(/Пошаговый маршрут/i)).toBeInTheDocument();
    expect(screen.queryByTestId('whats-new-alert')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('credkit-welcome-alert-seen-v1')).toBe('1');
  });

  it('карта новичка сохраняет прогресс чеклиста', async () => {
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    renderWithProviders(<App />);

    fireEvent.click(await screen.findByTestId('nav-newbieMap'));

    const firstStepCheckbox = await screen.findByTestId('newbie-step-check-step1');
    expect(firstStepCheckbox).not.toBeChecked();
    fireEvent.click(firstStepCheckbox);
    expect(firstStepCheckbox).toBeChecked();

    const raw = window.localStorage.getItem('credkit-newbie-checklist-v1');
    expect(raw).toBeTruthy();
    expect(raw).toContain('"step1":true');
  });

  it('после приветствия не открывает окно обновлений автоматически', async () => {
    window.localStorage.setItem('credkit-language', 'ru');
    window.localStorage.removeItem('credkit-welcome-alert-seen-v1');
    window.localStorage.removeItem('credkit-whats-new-seen-version');

    renderWithProviders(<App />);

    expect(await screen.findByTestId('welcome-alert')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('welcome-later'));

    expect(screen.queryByTestId('whats-new-alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('whats-new-unread-dot')).toBeInTheDocument();
  });

  it('показывает модалку "Новое" и помечает обновление прочитанным', async () => {
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    window.localStorage.removeItem('credkit-whats-new-seen-version');
    renderWithProviders(<App />);

    const openButton = await screen.findByTestId('whats-new-open');
    expect(screen.getByTestId('whats-new-unread-dot')).toBeInTheDocument();

    fireEvent.click(openButton);
    expect(await screen.findByTestId('whats-new-alert')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('whats-new-mark-read'));

    expect(window.localStorage.getItem('credkit-whats-new-seen-version')).toBe('v1.0.2 [BETA]');
  });

  it('в окне "Новое" доступна только кнопка подтверждения "Круто"', async () => {
    window.localStorage.setItem('credkit-language', 'ru');
    window.localStorage.setItem('credkit-welcome-alert-seen-v1', '1');
    window.localStorage.removeItem('credkit-whats-new-seen-version');
    renderWithProviders(<App />);

    fireEvent.click(await screen.findByTestId('whats-new-open'));
    expect(await screen.findByTestId('whats-new-alert')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Круто' })).toBeInTheDocument();
    expect(screen.queryByTestId('whats-new-close')).not.toBeInTheDocument();
  });
});
