import { useState } from 'react';
import { useToast } from '../common/Toast';
import { useLanguage } from '../../features/settings/model/hooks';
import { Icons } from '../../utils/icons';
import { APP_CONFIG } from '../../config/appConfig';

const BUG_REPORT_EMAIL = APP_CONFIG.bugReportEmail;
const BUG_REPORT_ENDPOINT = APP_CONFIG.bugReportEndpoint;
const REQUEST_TIMEOUT_MS = 12000;

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Category = 'ui' | 'logic' | 'performance' | 'data' | 'other';

interface BugReportFormState {
  title: string;
  category: Category;
  severity: Severity;
  steps: string;
  expected: string;
  actual: string;
  contact: string;
}

const INITIAL_FORM: BugReportFormState = {
  title: '',
  category: 'ui',
  severity: 'medium',
  steps: '',
  expected: '',
  actual: '',
  contact: ''
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getEnvironmentSummary(t: (key: string) => string) {
  if (typeof window === 'undefined') return 'Unknown environment';
  const language = window.navigator.language;
  const screen = `${window.screen.width}x${window.screen.height}`;
  return [
    `${t('bugReport.mail.environment.language')}: ${language}`,
    `${t('bugReport.mail.environment.screen')}: ${screen}`,
    `${t('bugReport.mail.environment.url')}: ${window.location.pathname}`
  ].join('\n');
}

function buildMailtoUrl(subject: string, body: string): string {
  const safeSubject = encodeURIComponent(subject.slice(0, 180));
  const safeBody = encodeURIComponent(body.slice(0, 1900));
  return `mailto:${BUG_REPORT_EMAIL}?subject=${safeSubject}&body=${safeBody}`;
}

interface BugReportTabProps {
  embedded?: boolean;
}

export function BugReportTab({ embedded = false }: BugReportTabProps) {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [form, setForm] = useState<BugReportFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const severityLabel: Record<Severity, string> = {
    low: t('bugReport.severity.low'),
    medium: t('bugReport.severity.medium'),
    high: t('bugReport.severity.high'),
    critical: t('bugReport.severity.critical')
  };

  const categoryLabel: Record<Category, string> = {
    ui: t('bugReport.category.ui'),
    logic: t('bugReport.category.logic'),
    performance: t('bugReport.category.performance'),
    data: t('bugReport.category.data'),
    other: t('bugReport.category.other')
  };

  const setField = <K extends keyof BugReportFormState>(field: K, value: BugReportFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const buildReportSubject = () => {
    const fallbackTitle = t('bugReport.mail.noTitle');
    return `${t('bugReport.mail.subjectPrefix')} ${form.title.trim() || fallbackTitle}`;
  };

  const buildReportBody = () => {
    const environmentSummary = getEnvironmentSummary(t);

    return [
      `${t('bugReport.mail.category')}: ${categoryLabel[form.category]}`,
      `${t('bugReport.mail.severity')}: ${severityLabel[form.severity]}`,
      '',
      `${t('bugReport.mail.title')}:`,
      form.title || '-',
      '',
      `${t('bugReport.mail.steps')}:`,
      form.steps || '-',
      '',
      `${t('bugReport.mail.expected')}:`,
      form.expected || '-',
      '',
      `${t('bugReport.mail.actual')}:`,
      form.actual || '-',
      '',
      `${t('bugReport.mail.contact')}:`,
      form.contact || '-',
      '',
      `${t('bugReport.mail.environment.title')}:`,
      environmentSummary
    ].join('\n');
  };

  const sendBugReport = async () => {
    if (!BUG_REPORT_ENDPOINT) {
      throw new Error('Bug report endpoint is not configured');
    }

    const subject = buildReportSubject();
    const message = buildReportBody();

    const payload = {
      _subject: subject,
      _captcha: 'true',
      _template: 'table',
      title: form.title || '-',
      category: categoryLabel[form.category],
      severity: severityLabel[form.severity],
      steps: form.steps || '-',
      expected: form.expected || '-',
      actual: form.actual || '-',
      contact: form.contact || '-',
      environment: getEnvironmentSummary(t),
      message
    };

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(BUG_REPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error('Failed to send bug report');
    }
  };

  const openMailClientFallback = () => {
    if (typeof window === 'undefined') return false;
    const url = buildMailtoUrl(buildReportSubject(), buildReportBody());
    window.location.href = url;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!form.title.trim() || !form.steps.trim() || !form.actual.trim()) {
      showToast(t('bugReport.toast.requiredFields'), 'warning');
      return;
    }

    if (form.contact.trim() && form.contact.includes('@') && !isValidEmail(form.contact.trim())) {
      showToast(t('bugReport.toast.invalidContact'), 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendBugReport();
      showToast(t('bugReport.toast.sentSuccess'), 'success');
      resetForm();
    } catch {
      const fallbackOpened = openMailClientFallback();
      if (fallbackOpened) {
        showToast(t('bugReport.toast.fallbackMailto'), 'warning');
      } else {
        showToast(t('bugReport.toast.sendFailed'), 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`animate-fade-in ${embedded ? 'space-y-4' : 'space-y-6'}`}>
      {!embedded && (
        <div className="card-cyber">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyber-orange/20 border border-cyber-orange/40 flex items-center justify-center text-cyber-orange">
              {Icons.warning}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-cyber-text">{t('bugReport.title')}</h2>
              <p className="ui-body-sm mt-1">{t('bugReport.subtitle')}</p>
              <div className="mt-3 rounded-lg border border-cyber-green/30 bg-cyber-green/10 px-3 py-2">
                <p className="ui-meta text-cyber-green">{t('bugReport.contributionHint')}</p>
                <p className="ui-meta mt-1 font-medium text-cyber-green">{t('bugReport.thanks')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={embedded ? 'space-y-4' : 'card-cyber space-y-4'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block ui-meta mb-2">{t('bugReport.field.title')} *</label>
            <input
              data-testid="bug-title"
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className="input w-full"
              placeholder={t('bugReport.placeholder.title')}
              maxLength={120}
            />
          </div>

          <div>
            <label htmlFor="bug-category" className="block ui-meta mb-2">{t('bugReport.field.category')}</label>
            <select
              id="bug-category"
              data-testid="bug-category"
              value={form.category}
              onChange={(e) => setField('category', e.target.value as Category)}
              aria-label={t('bugReport.field.category')}
              className="select w-full"
            >
              {(Object.keys(categoryLabel) as Category[]).map(category => (
                <option key={category} value={category}>{categoryLabel[category]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bug-severity" className="block ui-meta mb-2">{t('bugReport.field.severity')}</label>
            <select
              id="bug-severity"
              data-testid="bug-severity"
              value={form.severity}
              onChange={(e) => setField('severity', e.target.value as Severity)}
              aria-label={t('bugReport.field.severity')}
              className="select w-full"
            >
              {(Object.keys(severityLabel) as Severity[]).map(severity => (
                <option key={severity} value={severity}>{severityLabel[severity]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block ui-meta mb-2">{t('bugReport.field.steps')} *</label>
          <textarea
            data-testid="bug-steps"
            value={form.steps}
            onChange={(e) => setField('steps', e.target.value)}
            className="input w-full h-28 resize-y"
            placeholder={t('bugReport.placeholder.steps')}
            maxLength={3000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block ui-meta mb-2">{t('bugReport.field.expected')}</label>
            <textarea
              data-testid="bug-expected"
              value={form.expected}
              onChange={(e) => setField('expected', e.target.value)}
              className="input w-full h-24 resize-y"
              placeholder={t('bugReport.placeholder.expected')}
              maxLength={2000}
            />
          </div>
          <div>
            <label className="block ui-meta mb-2">{t('bugReport.field.actual')} *</label>
            <textarea
              data-testid="bug-actual"
              value={form.actual}
              onChange={(e) => setField('actual', e.target.value)}
              className="input w-full h-24 resize-y"
              placeholder={t('bugReport.placeholder.actual')}
              maxLength={2000}
            />
          </div>
        </div>

        <div>
          <label className="block ui-meta mb-2">{t('bugReport.field.contact')}</label>
          <input
            data-testid="bug-contact"
            type="text"
            value={form.contact}
            onChange={(e) => setField('contact', e.target.value)}
            className="input w-full"
            placeholder={t('bugReport.placeholder.contact')}
            maxLength={120}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" data-testid="bug-submit" className="btn px-5 py-2.5" disabled={isSubmitting}>
            {isSubmitting ? t('bugReport.submitSending') : language === 'ru' ? 'Отправить' : 'Send'}
          </button>
          <button type="button" data-testid="bug-reset" onClick={resetForm} className="btn-outline px-5 py-2.5" disabled={isSubmitting}>
            {t('bugReport.reset')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BugReportTab;
