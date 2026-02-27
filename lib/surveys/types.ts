/**
 * أنواع الاستبيانات
 * ========================================
 * نظام استبيانات مرن يدعم أنواع أسئلة متعددة
 * مع تخزين JSON Schema في Supabase
 */

export type QuestionType =
  | 'rating'       // تقييم نجوم (1-5)
  | 'text'         // إجابة نصية قصيرة
  | 'textarea'     // إجابة نصية طويلة
  | 'select'       // اختيار واحد
  | 'multiselect'  // اختيارات متعددة
  | 'boolean'      // نعم/لا
  | 'nps';         // Net Promoter Score (0-10)

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];         // للـ select و multiselect
  placeholder?: string;       // للـ text و textarea
  maxLength?: number;         // للنصوص
  min?: number;               // للـ rating و nps
  max?: number;               // للـ rating و nps
}

export interface SurveyDefinition {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  is_active: boolean;
  created_at: string;
  /** عدد الردود */
  response_count?: number;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  attendee_id?: string;
  attendee_name?: string;
  answers: Record<string, string | number | boolean | string[]>;
  submitted_at: string;
}

export interface SurveyStats {
  totalResponses: number;
  averageRating: number;       // متوسط كل أسئلة التقييم
  npsScore: number;            // صافي نقاط الترويج
  completionRate: number;      // نسبة الإكمال
  questionStats: Record<string, QuestionStat>;
}

export interface QuestionStat {
  questionId: string;
  questionTitle: string;
  type: QuestionType;
  responseCount: number;
  /** للـ rating: المتوسط */
  average?: number;
  /** للـ select/multiselect: عدد كل خيار */
  optionCounts?: Record<string, number>;
  /** للـ boolean: نسبة الإيجاب */
  positivePercent?: number;
  /** للـ nps: التوزيع */
  npsBreakdown?: { promoters: number; passives: number; detractors: number };
}

// ========================================
// قوالب استبيانات جاهزة
// ========================================

export const SURVEY_TEMPLATES: Record<string, Omit<SurveyDefinition, 'id' | 'event_id' | 'created_at' | 'is_active'>> = {
  event_feedback: {
    title: 'استبيان تقييم الفعالية',
    description: 'نرجو تقييم تجربتك في الفعالية لمساعدتنا على التحسين',
    questions: [
      {
        id: 'overall_rating',
        type: 'rating',
        title: 'كيف تقيّم تجربتك العامة في الفعالية؟',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'organization',
        type: 'rating',
        title: 'كيف تقيّم مستوى التنظيم؟',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'venue',
        type: 'rating',
        title: 'كيف تقيّم المكان والموقع؟',
        required: false,
        min: 1,
        max: 5,
      },
      {
        id: 'best_part',
        type: 'select',
        title: 'ما أكثر شيء أعجبك في الفعالية؟',
        required: false,
        options: ['التنظيم', 'المحتوى', 'المتحدثين', 'المكان', 'التواصل', 'الضيافة', 'أخرى'],
      },
      {
        id: 'nps',
        type: 'nps',
        title: 'ما مدى احتمالية أن توصي بفعالياتنا لصديق أو زميل؟',
        required: true,
        min: 0,
        max: 10,
      },
      {
        id: 'suggestions',
        type: 'textarea',
        title: 'هل لديك أي اقتراحات أو ملاحظات إضافية؟',
        required: false,
        placeholder: 'اكتب ملاحظاتك هنا...',
        maxLength: 500,
      },
    ],
  },

  quick_rating: {
    title: 'تقييم سريع',
    description: 'قيّم تجربتك في ثوانٍ معدودة',
    questions: [
      {
        id: 'rating',
        type: 'rating',
        title: 'كيف تقيّم الفعالية؟',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'would_attend_again',
        type: 'boolean',
        title: 'هل ستحضر فعاليات مشابهة مستقبلاً؟',
        required: true,
      },
      {
        id: 'comment',
        type: 'text',
        title: 'تعليق سريع (اختياري)',
        required: false,
        placeholder: 'كلمة أو جملة...',
        maxLength: 200,
      },
    ],
  },

  workshop_feedback: {
    title: 'تقييم الورشة',
    description: 'ساعدنا في تحسين ورشاتنا المستقبلية',
    questions: [
      {
        id: 'content_quality',
        type: 'rating',
        title: 'جودة المحتوى',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'presenter',
        type: 'rating',
        title: 'أداء المقدم/المدرب',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'difficulty',
        type: 'select',
        title: 'مستوى صعوبة المحتوى',
        required: true,
        options: ['سهل جداً', 'سهل', 'مناسب', 'صعب', 'صعب جداً'],
      },
      {
        id: 'learned_something',
        type: 'boolean',
        title: 'هل تعلمت شيئاً جديداً؟',
        required: true,
      },
      {
        id: 'topics_interest',
        type: 'multiselect',
        title: 'ما المواضيع التي تهمك مستقبلاً؟',
        required: false,
        options: ['تصميم', 'برمجة', 'تسويق', 'ريادة أعمال', 'إدارة مشاريع', 'ذكاء اصطناعي'],
      },
      {
        id: 'nps',
        type: 'nps',
        title: 'ما مدى احتمالية أن توصي بهذه الورشة؟',
        required: true,
        min: 0,
        max: 10,
      },
    ],
  },
};

/**
 * حساب إحصائيات الاستبيان
 */
export function calculateSurveyStats(
  questions: SurveyQuestion[],
  responses: SurveyResponse[]
): SurveyStats {
  const stats: SurveyStats = {
    totalResponses: responses.length,
    averageRating: 0,
    npsScore: 0,
    completionRate: 0,
    questionStats: {},
  };

  if (responses.length === 0) return stats;

  let ratingSum = 0;
  let ratingCount = 0;
  let npsPromoters = 0;
  let npsDetractors = 0;
  let npsTotal = 0;

  questions.forEach((q) => {
    const qStat: QuestionStat = {
      questionId: q.id,
      questionTitle: q.title,
      type: q.type,
      responseCount: 0,
    };

    const answers = responses
      .map((r) => r.answers[q.id])
      .filter((a) => a !== undefined && a !== null && a !== '');

    qStat.responseCount = answers.length;

    if (q.type === 'rating') {
      const nums = answers.map(Number).filter((n) => !isNaN(n));
      if (nums.length > 0) {
        qStat.average = nums.reduce((a, b) => a + b, 0) / nums.length;
        ratingSum += qStat.average;
        ratingCount++;
      }
    }

    if (q.type === 'nps') {
      const nums = answers.map(Number).filter((n) => !isNaN(n));
      nums.forEach((n) => {
        npsTotal++;
        if (n >= 9) npsPromoters++;
        else if (n <= 6) npsDetractors++;
      });
      qStat.npsBreakdown = {
        promoters: npsPromoters,
        passives: npsTotal - npsPromoters - npsDetractors,
        detractors: npsDetractors,
      };
    }

    if (q.type === 'select' || q.type === 'multiselect') {
      const counts: Record<string, number> = {};
      answers.forEach((a) => {
        const items = Array.isArray(a) ? a : [a];
        items.forEach((item) => {
          const s = String(item);
          counts[s] = (counts[s] || 0) + 1;
        });
      });
      qStat.optionCounts = counts;
    }

    if (q.type === 'boolean') {
      const trueCount = answers.filter((a) => a === true || a === 'true').length;
      qStat.positivePercent = answers.length > 0 ? (trueCount / answers.length) * 100 : 0;
    }

    stats.questionStats[q.id] = qStat;
  });

  stats.averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
  stats.npsScore =
    npsTotal > 0 ? ((npsPromoters - npsDetractors) / npsTotal) * 100 : 0;

  // حساب نسبة الإكمال
  const requiredQuestions = questions.filter((q) => q.required);
  if (requiredQuestions.length > 0) {
    const completedResponses = responses.filter((r) =>
      requiredQuestions.every((q) => {
        const a = r.answers[q.id];
        return a !== undefined && a !== null && a !== '';
      })
    );
    stats.completionRate = (completedResponses.length / responses.length) * 100;
  } else {
    stats.completionRate = 100;
  }

  return stats;
}
