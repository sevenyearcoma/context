export interface ScientificConcept {
  id: string;
  category: 'social_anxiety' | 'act_therapy' | 'stoicism' | 'systems_theory' | 'cognitive_bias' | 'neurobiology' | 'impostor_phenomenon' | 'error_processing' | 'anxiety' | 'adhd' | 'self_compassion' | 'shame' | 'motivation' | 'attachment';
  conceptName: string;
  definition: string;
  empiricalEvidence: {
    paperTitle: string;
    authorsAndYear: string;
    methodology: string;
    keyFinding: string;
  };
  applicationToAnxiety: string;
}

export const SCIENTIFIC_DATABASE: ScientificConcept[] = [
  {
    id: 'spotlight_effect',
    category: 'social_anxiety',
    conceptName: 'Эффект прожектора (Spotlight Effect)',
    definition: 'Когнитивное искажение, при котором человек переоценивает степень, в которой его действия и внешний вид замечаются другими.',
    empiricalEvidence: {
      paperTitle: 'The Spotlight Effect in Social Judgment',
      authorsAndYear: 'Gilovich, Medvec, & Savitsky (2000)',
      methodology: 'Студентов заставили надеть вызывающую стыд футболку с Барри Манилоу и войти в комнату с незнакомцами.',
      keyFinding: 'Студентам казалось, что 50% людей заметят их позорную футболку. В реальности ее заметили лишь 23%. Разница между ощущением чужого внимания и фактом составила более 2 раз.'
    },
    applicationToAnxiety: 'Напоминает, что люди из-за собственного эгоцентризма сфокусированы на себе. Ошибки, нелепые ситуации остаются незамеченными для большинства. Вы не так важны для окружающих, как кажется эго.'
  },
  {
    id: 'implementation_intentions',
    category: 'systems_theory',
    conceptName: 'Намерения реализации (Процесс против Мотивации)',
    definition: 'Формирование четкого плана действий в формате "Если ситуация Y возникнет, я инициирую реакцию Z" намного эффективнее простой мотивации.',
    empiricalEvidence: {
      paperTitle: 'Implementation Intentions: Strong Effects of Simple Plans',
      authorsAndYear: 'Peter Gollwitzer (1999)',
      methodology: 'Мета-анализ различных экспериментов, где испытуемые ставили цели (похудеть, написать отчет) с мотивацией и с автоматизированным процессом "если-то".',
      keyFinding: 'Переход от цели "Я хочу быть продуктивным" к алгоритму запускает автоматическое поведение, обходя истощение воли. Процессы (системы) сработали несравнимо лучше, чем попытки "собраться с силами".'
    },
    applicationToAnxiety: 'Обычному дезорганизованному человеку не нужно становиться "сверхчеловеком" на мотивации; ему достаточно внедрить работающий алгоритм действий. Ошибка — это сбой процесса, а не дефект личности.'
  },
  {
    id: 'inhibitory_learning',
    category: 'neurobiology',
    conceptName: 'Тормозное обучение (Экспозиция к дискомфорту)',
    definition: 'Механизм, при котором мозг учится толерантности к страху через столкновение с триггером, формируя новые "безопасные" нейронные пути поверх старых.',
    empiricalEvidence: {
      paperTitle: 'Optimizing inhibitory learning during exposure therapy',
      authorsAndYear: 'Craske et al. (2008)',
      methodology: 'Клинические испытания поведения при тревожных расстройствах: пациенты шли в дискомфорт не чтобы "тревога ушла", а чтобы нарушить ожидания (expectancy violation).',
      keyFinding: 'Тревога и страх провала перед действием не требуют устранения. Важен сам факт выполнения действия при наличии страха (tolerating discomfort) для переобучения амигдалы.'
    },
    applicationToAnxiety: 'Дискомфорт и страх неудачи — это ожидаемая цена входа, а не сигнал "остановись". Разрешение себе быть неидеальным и совершать действия в дискомфорте разблокирует синдром самозванца.'
  },
  {
    id: 'cognitive_defusion_act',
    category: 'act_therapy',
    conceptName: 'Когнитивное расцепление (Cognitive Defusion)',
    definition: 'Процесс отделения восприятия себя от содержания обсессивно-тревожных мыслей.',
    empiricalEvidence: {
      paperTitle: 'Acceptance and Commitment Therapy: Model, processes and outcomes',
      authorsAndYear: 'Hayes et al. (2006)',
      methodology: 'Сотни клинических РКИ, сравнивающих попытки контроля и подавления негативных мыслей с их принятием (mindful defusion).',
      keyFinding: 'Попытки избавиться от тревожных мыслей или опровергнуть их парадоксально усиливают частоту их появления. "Наблюдение" мыслей, не веря в их достоверность, снижает их влияние на паралич воли.'
    },
    applicationToAnxiety: 'Мысль "у меня ничего не получится" — это просто нейронный шум. Нет необходимости бороться с ней. Достаточно отделить свое "я" от процесса мышления и продолжать делать запланированное.'
  },
  {
    id: 'fundamental_attribution_error',
    category: 'cognitive_bias',
    conceptName: 'Фундаментальная ошибка атрибуции',
    definition: 'Искажение, при котором люди объясняют чужие ситуации или свои неудачи "плохим характером", игнорируя силу контекста и среды.',
    empiricalEvidence: {
      paperTitle: 'The Attribution of Attitudes',
      authorsAndYear: 'Jones & Harris (1967)',
      methodology: 'Участники читали эссе в поддержку Кастро. Им прямо сказали, что авторам навязали эту тему насильно. Участники все равно верили, что автор действительно поддерживает Кастро.',
      keyFinding: 'Люди биологически запрограммированы игнорировать влияние СИТУАЦИИ и переоценивать влияние ЛИЧНОСТИ. Мы считаем, что мы неудачники по своей сути, игнорируя то, что наша текущая среда деморализует.'
    },
    applicationToAnxiety: 'Человек застревает в бездействии, потому что винит свою "лень", забывая про истощенную среду. Понимание силы контекста снимает личную вину и переводит проблему в инженерную плоскость.'
  },
  {
    id: 'ip_attribution_bias',
    category: 'impostor_phenomenon',
    conceptName: 'Атрибутивный сдвиг у самозванцев',
    definition: 'Люди с синдромом самозванца приписывают успех внешним факторам, а неудачи — внутренним причинам.',
    empiricalEvidence: {
      paperTitle: 'An experimental study of the non-self-serving attributional bias within the impostor phenomenon',
      authorsAndYear: 'Ibrahim et al. (2023)',
      methodology: 'Участникам давали фиктивный тест интеллекта и случайный фидбек (позитивный/негативный), затем измеряли атрибуции причин.',
      keyFinding: 'Самозванцы при успехе выбирали внешние причины, при провале — внутренние стабильные причины.'
    },
    applicationToAnxiety: 'Любой успех автоматически записывается как результат навыка, иначе мозг всегда будет выбирать тревожную интерпретацию.'
  },
  {
    id: 'ip_fear_of_exposure',
    category: 'impostor_phenomenon',
    conceptName: 'Страх разоблачения',
    definition: 'Постоянное ожидание, что окружающие обнаружат твою некомпетентность несмотря на объективные достижения.',
    empiricalEvidence: {
      paperTitle: 'Impostor Phenomenon Measurement Scales: A Systematic Review',
      authorsAndYear: 'Mak et al. (2019)',
      methodology: 'Систематический обзор шкал и исследований синдрома самозванца.',
      keyFinding: 'Люди стабильно недооценивают способности и боятся оценки, несмотря на объективный успех.'
    },
    applicationToAnxiety: 'Используй страх как индикатор роста: если нет ощущения "меня сейчас разоблачат", значит ты не в зоне развития.'
  },
  {
    id: 'adhd_ip_link',
    category: 'adhd',
    conceptName: 'Связь СДВГ и самозванца',
    definition: 'Симптомы СДВГ усиливают синдром самозванца через снижение самооценки и маскирование.',
    empiricalEvidence: {
      paperTitle: 'Attention-Deficit/Hyperactivity Disorder, Imposter Phenomenon, and Identity Distress',
      authorsAndYear: 'Recent study (2026)',
      methodology: 'Исследование с медиаторами (самооценка, маскирование, соцсети).',
      keyFinding: 'Сильная связь: тяжесть СДВГ → рост синдрома самозванца через самооценку.'
    },
    applicationToAnxiety: 'Оптимизируй среду под СДВГ (микрозадачи, дедлайны), тогда тревога снизится как побочный эффект.'
  },
  {
    id: 'ip_performance_paradox',
    category: 'impostor_phenomenon',
    conceptName: 'Парадокс высокой эффективности',
    definition: 'Люди с синдромом самозванца часто показывают высокую продуктивность несмотря на внутренние сомнения.',
    empiricalEvidence: {
      paperTitle: 'Impostor Phenomenon Among Software Engineers',
      authorsAndYear: 'Guenes et al. (2023)',
      methodology: 'Опрос 624 специалистов с использованием валидированных шкал.',
      keyFinding: 'Около 52.7% инженеров испытывают IP, при этом сохраняют высокую продуктивность.'
    },
    applicationToAnxiety: 'Тревога может быть топливом, важно не подавлять её полностью, а ограничивать верхний порог через отдых.'
  },
  {
    id: 'error_negativity_bias',
    category: 'error_processing',
    conceptName: 'Негативное доминирование ошибок',
    definition: 'Ошибки психологически весят больше, чем успехи.',
    empiricalEvidence: {
      paperTitle: 'Classic negativity bias studies',
      authorsAndYear: 'Baumeister et al. (2001)',
      methodology: 'Метаанализ исследований влияния негативных и позитивных событий.',
      keyFinding: 'Негативные события оказывают более сильное влияние на психику, чем позитивные (асимметрия).'
    },
    applicationToAnxiety: 'Просто увеличь количество действий. Объем действий компенсирует биологическое искажение негатива.'
  },
  {
    id: 'error_learning_signal',
    category: 'error_processing',
    conceptName: 'Ошибка как обучающий сигнал',
    definition: 'Ошибки активируют механизмы обучения сильнее, чем успехи.',
    empiricalEvidence: {
      paperTitle: 'Error-related negativity studies',
      authorsAndYear: 'Gehring et al. (1993)',
      methodology: 'EEG измерения реакции мозга на совершенные ошибки.',
      keyFinding: 'Ошибка вызывает специфический нейронный сигнал (ERN), напрямую связанный с обучением.'
    },
    applicationToAnxiety: 'Ошибка = точка данных. Без ошибки нет обновления внутренней модели реальности.'
  },
  {
    id: 'anxiety_avoidance_loop',
    category: 'anxiety',
    conceptName: 'Петля избегания',
    definition: 'Избегание снижает тревогу краткосрочно, но усиливает её в долгосрочной перспективе.',
    empiricalEvidence: {
      paperTitle: 'Avoidance learning and anxiety',
      authorsAndYear: 'Mowrer (1947)',
      methodology: 'Классические эксперименты по обусловливанию избегающего поведения.',
      keyFinding: 'Избегание закрепляется через временное снижение тревоги (отрицательное подкрепление).'
    },
    applicationToAnxiety: 'Не анализируй тревогу — ломай избегание. Делай минимальное действие вопреки ей.'
  },
  {
    id: 'cognitive_load_adhd',
    category: 'adhd',
    conceptName: 'Перегрузка рабочей памяти при СДВГ',
    definition: 'При СДВГ ограниченная рабочая память приводит к ошибкам и последующей тревоге.',
    empiricalEvidence: {
      paperTitle: 'Working memory deficits in ADHD',
      authorsAndYear: 'Martinussen et al. (2005)',
      methodology: 'Метаанализ когнитивных тестов у людей с СДВГ.',
      keyFinding: 'Снижение рабочей памяти статистически значимо коррелирует с ADHD-симптомами.'
    },
    applicationToAnxiety: 'Выгружай всё во внешние системы (списки, доски), иначе тревога — это просто перегруз RAM.'
  },
  {
    id: 'uncertainty_intolerance',
    category: 'anxiety',
    conceptName: 'Непереносимость неопределенности',
    definition: 'Тревога усиливается, когда человек не может предсказать результат своих действий.',
    empiricalEvidence: {
      paperTitle: 'Intolerance of uncertainty model',
      authorsAndYear: 'Dugas et al. (1998)',
      methodology: 'Клинические исследования генерализованной тревоги.',
      keyFinding: 'Высокая непереносимость неопределенности напрямую связана с тревожными расстройствами.'
    },
    applicationToAnxiety: 'Принимай неопределенность как часть процесса. Действуй без обладания полной информацией.'
  },
  // ─── Self-Compassion ──────────────────────────────────────────────────────────
  {
    id: 'self_compassion_neff',
    category: 'self_compassion',
    conceptName: 'Самосострадание (Self-Compassion)',
    definition: 'Отношение к себе с той же добротой и пониманием, с которыми бы отнёсся к близкому другу в трудной ситуации. Три компонента: доброта к себе (vs осуждение), общая человечность (vs изоляция), осознанность (vs отождествление с болью).',
    empiricalEvidence: {
      paperTitle: 'Self-compassion: An alternative conceptualization of a healthy attitude toward oneself',
      authorsAndYear: 'Neff (2003)',
      methodology: 'Разработка и валидация шкалы самосострадания (SCS) на студенческих и клинических выборках. Более 5000 цитирований.',
      keyFinding: 'Самосострадание предсказывает эмоциональное благополучие лучше, чем самооценка, при этом не требует позитивной самооценки. Самокритика усиливает тревогу и депрессию; самосострадание — снижает их.'
    },
    applicationToAnxiety: 'Не нужно чувствовать себя хорошим, чтобы обращаться с собой хорошо. Самосострадание — это не слабость и не жалость к себе. Это то, как ты относился бы к другу в такой же ситуации. Это навык, а не черта характера.'
  },
  // ─── Shame & Common Humanity ─────────────────────────────────────────────────
  {
    id: 'shame_vs_guilt',
    category: 'shame',
    conceptName: 'Стыд против вины (Shame vs. Guilt)',
    definition: 'Стыд — "я плохой" (оценка себя как личности). Вина — "я сделал что-то плохое" (оценка поступка). Принципиально разные эмоции с противоположными психологическими эффектами.',
    empiricalEvidence: {
      paperTitle: 'Shame and Guilt',
      authorsAndYear: 'Tangney & Dearing (2002)',
      methodology: 'Серия лонгитюдных и корреляционных исследований с клиническими и общими выборками. Использование шкалы TOSCA.',
      keyFinding: 'Стыд предсказывает депрессию, тревогу, зависимости и агрессию. Вина — репаративное поведение. Стыд процветает в изоляции и ослабевает при опыте общей человечности: "я не один такой".'
    },
    applicationToAnxiety: 'Ощущение "со мной что-то не так" — это стыд, а не объективный факт о тебе. Стыд — это не сигнал о реальном дефекте. Это выученная реакция, которая формируется задолго до того, как у нас появляется способность её оспорить. Ты не сломан — ты человек.'
  },
  // ─── Intrinsic Motivation ────────────────────────────────────────────────────
  {
    id: 'self_determination_theory',
    category: 'motivation',
    conceptName: 'Теория самодетерминации (SDT)',
    definition: 'Внутренняя мотивация (подлинный интерес, ценности) производит более устойчивую эффективность и благополучие, чем внешняя (страх неудачи, одобрение окружающих).',
    empiricalEvidence: {
      paperTitle: 'The "What" and "Why" of Goal Pursuits: Human Needs and the Self-Determination of Behavior',
      authorsAndYear: 'Deci & Ryan (2000)',
      methodology: 'Метаанализ более 100 экспериментальных исследований. Тысячи цитирований.',
      keyFinding: 'Люди, действующие из внутренней мотивации, дольше продолжают задачи, более креативны, быстрее восстанавливаются после неудач и сообщают о большем благополучии. Внешнее вознаграждение за изначально интересные задачи снижает внутреннюю мотивацию.'
    },
    applicationToAnxiety: 'Когда ты делаешь что-то из страха провала или ради одобрения — ты работаешь против своей природы. Вопрос не "как заставить себя" а "что ты уже хочешь делать?" Это и есть та энергия, которую не нужно генерировать — она уже есть.'
  },
  // ─── Flow ────────────────────────────────────────────────────────────────────
  {
    id: 'flow_csikszentmihalyi',
    category: 'motivation',
    conceptName: 'Состояние потока (Flow)',
    definition: 'Состояние полного поглощения деятельностью, при котором пропадает самосознание и время. Возникает когда сложность задачи соответствует уровню навыка и человек не наблюдает за собой со стороны.',
    empiricalEvidence: {
      paperTitle: 'Flow: The Psychology of Optimal Experience',
      authorsAndYear: 'Csikszentmihalyi (1990)',
      methodology: 'ESM (Experience Sampling Method) — тысячи людей носили пейджеры и в случайные моменты отвечали на вопросы о текущем опыте. Многолетние кросс-культурные исследования.',
      keyFinding: 'Пиковая эффективность и субъективное благополучие возникают одновременно в состоянии потока. Самосознание — главный его враг. Люди без тревожного самомониторинга входят в поток значительно легче.'
    },
    applicationToAnxiety: 'Аутентично уверенные люди выглядят "без усилий" потому что не наблюдают за собой во время действия. Тревожное самонаблюдение ("а правильно ли я делаю?") — это не защита от ошибок, это главное препятствие для хорошей работы.'
  },
  // ─── Secure Attachment ───────────────────────────────────────────────────────
  {
    id: 'secure_attachment_base',
    category: 'attachment',
    conceptName: 'Безопасная база (Secure Base)',
    definition: 'Интернализированное ощущение фундаментальной приемлемости себя, сформированное через достаточно хороший ранний опыт принятия. Это, а не навыки или достижения, является источником подлинной уверенности.',
    empiricalEvidence: {
      paperTitle: 'Attachment in Adulthood: Structure, Dynamics, and Change',
      authorsAndYear: 'Mikulincer & Shaver (2007)',
      methodology: 'Систематический обзор и метаанализ сотен исследований привязанности во взрослом возрасте.',
      keyFinding: 'Безопасная привязанность предсказывает: устойчивость к стрессу, способность регулировать эмоции, уверенность в межличностных отношениях, меньший страх неудачи. Безопасная база может формироваться в любом возрасте через коррективные отношения и опыт.'
    },
    applicationToAnxiety: 'Ощущение "я в порядке вне зависимости от результата" — это не убеждение, которое нужно выработать. Это опыт, который нужно накопить. Каждый раз когда ты обращаешься с собой с добротой в трудный момент — ты строишь эту базу изнутри.'
  },
  {
    id: 'self_efficacy_ip',
    category: 'impostor_phenomenon',
    conceptName: 'Самоэффективность и самозванец',
    definition: 'Низкая вера в собственные способности (self-efficacy) усиливает синдром самозванца.',
    empiricalEvidence: {
      paperTitle: 'The imposter phenomenon and its relationship with self-efficacy',
      authorsAndYear: 'Pákozdy et al. (2024)',
      methodology: 'Корреляционное исследование среди студентов.',
      keyFinding: 'Выявлена сильная негативная корреляция между самоэффективностью и чувствами самозванца.'
    },
    applicationToAnxiety: 'Повышай уверенность через маленькие доказательства (выполненные задачи), а не через аффирмации.'
  }
];

// ─── Adapter for Trustworthiness Ranking ─────────────────────────────────────

import type { ScoredPaper } from './trustworthiness';

/**
 * Convert a curated ScientificConcept into a ScoredPaper for unified ranking.
 * Curated entries always get trustworthiness = 1.0 (manually verified gold standard).
 */
export function conceptToScoredPaper(concept: ScientificConcept): ScoredPaper {
  return {
    id: `curated_${concept.id}`,
    title: concept.empiricalEvidence.paperTitle,
    authors: concept.empiricalEvidence.authorsAndYear,
    year: extractYear(concept.empiricalEvidence.authorsAndYear),
    abstract: concept.definition,
    methodology: concept.empiricalEvidence.methodology,
    keyFinding: concept.empiricalEvidence.keyFinding,
    applicationToAnxiety: concept.applicationToAnxiety,
    conceptName: concept.conceptName,

    citationCount: 0, // Not used for curated
    influentialCitationCount: 0,
    venue: '',
    source: 'curated',

    trustworthiness: 1.0,
    cosineSimilarity: 0,
    combinedScore: 0,
  };
}

function extractYear(authorsAndYear: string): number {
  const match = authorsAndYear.match(/\((\d{4})\)/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

/**
 * Get all curated concepts as ScoredPaper[], ready for unified ranking.
 */
export function getCuratedPapers(): ScoredPaper[] {
  return SCIENTIFIC_DATABASE.map(conceptToScoredPaper);
}
