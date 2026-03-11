import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';
import { sendTelemetry } from '@/utils/telemetry';

vi.mock('@/utils/telemetry', () => ({
  sendTelemetry: vi.fn()
}));

function CrashOnRender() {
  throw new Error('Render exploded');
}

describe('AppErrorBoundary component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('перехватывает ошибку рендера и показывает fallback UI', () => {
    render(
      <AppErrorBoundary>
        <CrashOnRender />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Ошибка рендера интерфейса')).toBeInTheDocument();
    expect(screen.getByText('Render exploded')).toBeInTheDocument();
    expect(sendTelemetry).toHaveBeenCalledTimes(1);
  });
});
