import { useEffect, useState } from 'react';
import { Icons } from '../../utils/icons';
import { useLanguage } from '../../features/settings/model/hooks';

const CHECKLIST_KEY = 'credkit-newbie-checklist-v1';
const stepIcons = [
  Icons.character,
  Icons.health,
  Icons.check,
  Icons.cyberware,
  Icons.weapons,
  Icons.save
] as const;
const stepIds = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const;
type StepId = typeof stepIds[number];
type ChecklistState = Record<StepId, boolean>;

const emptyChecklist = (): ChecklistState => ({
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
  step6: false
});

function parseChecklist(raw: string | null): ChecklistState {
  if (!raw) return emptyChecklist();

  try {
    const parsed = JSON.parse(raw) as Partial<ChecklistState>;
    return {
      step1: parsed.step1 === true,
      step2: parsed.step2 === true,
      step3: parsed.step3 === true,
      step4: parsed.step4 === true,
      step5: parsed.step5 === true,
      step6: parsed.step6 === true
    };
  } catch {
    return emptyChecklist();
  }
}

// Вкладка для новичков: короткий путь от нуля до первого рабочего персонажа
export function NewbieMapTab() {
  const { t } = useLanguage();
  const [checklist, setChecklist] = useState<ChecklistState>(() => emptyChecklist());

  const steps: Array<{ id: StepId; title: string; desc: string; checkLabel: string }> = [
    { id: 'step1', title: t('newbieMap.step1.title'), desc: t('newbieMap.step1.desc'), checkLabel: t('newbieMap.step1.check') },
    { id: 'step2', title: t('newbieMap.step2.title'), desc: t('newbieMap.step2.desc'), checkLabel: t('newbieMap.step2.check') },
    { id: 'step3', title: t('newbieMap.step3.title'), desc: t('newbieMap.step3.desc'), checkLabel: t('newbieMap.step3.check') },
    { id: 'step4', title: t('newbieMap.step4.title'), desc: t('newbieMap.step4.desc'), checkLabel: t('newbieMap.step4.check') },
    { id: 'step5', title: t('newbieMap.step5.title'), desc: t('newbieMap.step5.desc'), checkLabel: t('newbieMap.step5.check') },
    { id: 'step6', title: t('newbieMap.step6.title'), desc: t('newbieMap.step6.desc'), checkLabel: t('newbieMap.step6.check') }
  ];

  const tips = [
    t('newbieMap.tip1'),
    t('newbieMap.tip2'),
    t('newbieMap.tip3')
  ];

  const quickPlan = [
    { title: t('newbieMap.quick1.title'), desc: t('newbieMap.quick1.desc') },
    { title: t('newbieMap.quick2.title'), desc: t('newbieMap.quick2.desc') },
    { title: t('newbieMap.quick3.title'), desc: t('newbieMap.quick3.desc') }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setChecklist(parseChecklist(window.localStorage.getItem(CHECKLIST_KEY)));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
  }, [checklist]);

  const completedCount = stepIds.filter((id) => checklist[id]).length;
  const progressPercent = Math.round((completedCount / stepIds.length) * 100);

  const toggleStep = (id: StepId) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    setChecklist(emptyChecklist());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card-cyber">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan">
            {Icons.info}
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyber-text">{t('newbieMap.title')}</h2>
            <p className="ui-body-sm mt-1">{t('newbieMap.subtitle')}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-cyber-gray/30 bg-cyber-dark/50 p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-cyber-text">
              {t('newbieMap.progressLabel')} <span className="text-cyber-cyan font-semibold">{completedCount}/{stepIds.length}</span>
            </p>
            <button
              type="button"
              data-testid="newbie-reset-checklist"
              onClick={resetChecklist}
              className="px-3 py-1.5 text-xs rounded-lg border border-cyber-gray/40 bg-cyber-dark/60 text-cyber-muted hover:text-cyber-text"
            >
              {t('newbieMap.resetChecklist')}
            </button>
          </div>
          <div className="mt-3 h-2 rounded-full bg-cyber-gray/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-green transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {steps.map((step, index) => (
          <article key={step.id} className="card-cyber p-4" data-testid={`newbie-step-${step.id}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyber-accent/15 border border-cyber-accent/35 text-cyber-accent flex items-center justify-center shrink-0 font-bold text-xs">
                {index + 1}
              </div>
              <div className="w-5 h-5 text-cyber-cyan mt-1 shrink-0">
                {stepIcons[index]}
              </div>
              <div>
                <h3 className="ui-card-title">{step.title}</h3>
                <p className="ui-body-sm mt-1">{step.desc}</p>
                <label className="mt-3 inline-flex items-center gap-2 ui-meta cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checklist[step.id]}
                    onChange={() => toggleStep(step.id)}
                    data-testid={`newbie-step-check-${step.id}`}
                    className="w-4 h-4 rounded border border-cyber-cyan/60 bg-cyber-dark accent-[var(--cyber-cyan)]"
                  />
                  <span>{step.checkLabel}</span>
                </label>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="card-cyber">
        <h3 className="ui-card-title mb-3">{t('newbieMap.quickTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickPlan.map((plan) => (
            <article key={plan.title} className="rounded-xl border border-cyber-gray/30 bg-cyber-dark/60 p-3">
              <h4 className="ui-card-title">{plan.title}</h4>
              <p className="ui-meta mt-1">{plan.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card-cyber">
        <h3 className="ui-card-title mb-3">{t('newbieMap.tipTitle')}</h3>
        <ul className="space-y-2 ui-body-sm">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="text-cyber-green mt-0.5">{Icons.check}</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-cyber border-cyber-green/30">
        <h3 className="ui-card-title text-cyber-green">{t('newbieMap.doneTitle')}</h3>
        <p className="ui-body-sm mt-1">{t('newbieMap.doneDesc')}</p>
      </section>
    </div>
  );
}
