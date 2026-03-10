'use client';

import dynamic from 'next/dynamic';
import type { Language } from '../i18n/translations';

const App = dynamic(() => import('../toolkit/App'), {
  ssr: false,
});

interface AppClientProps {
  language: Language;
}

export function AppClient({ language }: AppClientProps) {
  return <App initialLanguage={language} />;
}
