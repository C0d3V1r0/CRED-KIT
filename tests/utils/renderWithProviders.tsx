import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AppProviders } from '@/core/providers/AppProviders';
import { ToastProvider } from '@/components/common/Toast';

// Общий рендер с провайдерами приложения
export function renderWithProviders(ui: ReactElement) {
  return render(
    <AppProviders>
      <ToastProvider>{ui}</ToastProvider>
    </AppProviders>
  );
}
