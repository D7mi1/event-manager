'use client';

/**
 * مكون عرض وتعبئة الاستبيان
 * ========================================
 * يعرض أسئلة الاستبيان بأنواعها المختلفة
 * مع تصميم RTL ودارك مود
 */

import { useState } from 'react';
import { Star, Send, Loader2, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { SurveyQuestion, SurveyDefinition } from '@/lib/surveys/types';

interface SurveyRendererProps {
  survey: SurveyDefinition;
  onSubmit: (answers: Record<string, string | number | boolean | string[]>) => Promise<void>;
  className?: string;
}

export function SurveyRenderer({ survey, onSubmit, className = '' }: SurveyRendererProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // التحقق من الأسئلة المطلوبة
    const missing = survey.questions.filter(
      (q) => q.required && (answers[q.id] === undefined || answers[q.id] === '' || answers[q.id] === null)
    );
    if (missing.length > 0) {
      return; // يمكن إضافة toast هنا
    }

    setSubmitting(true);
    try {
      await onSubmit(answers);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2">شكراً لمشاركتك! 🎉</h3>
        <p className="text-white/50">تم إرسال إجاباتك بنجاح</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* عنوان الاستبيان */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{survey.title}</h2>
        {survey.description && (
          <p className="text-white/50 text-sm">{survey.description}</p>
        )}
      </div>

      {/* الأسئلة */}
      {survey.questions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-[#C19D65] font-bold text-sm mt-0.5">{index + 1}</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm">
                {question.title}
                {question.required && <span className="text-red-400 mr-1">*</span>}
              </h4>
              {question.description && (
                <p className="text-white/40 text-xs mt-1">{question.description}</p>
              )}
            </div>
          </div>

          <div className="mr-7">
            <QuestionInput
              question={question}
              value={answers[question.id]}
              onChange={(val) => updateAnswer(question.id, val)}
            />
          </div>
        </div>
      ))}

      {/* زر الإرسال */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 bg-[#C19D65] text-black rounded-2xl font-bold text-lg hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send size={18} />
        )}
        {submitting ? 'جاري الإرسال...' : 'إرسال الإجابات'}
      </button>
    </div>
  );
}

// ========================================
// مكون السؤال حسب النوع
// ========================================

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (question.type) {
    case 'rating':
      return <RatingInput value={value} max={question.max || 5} onChange={onChange} />;
    case 'nps':
      return <NPSInput value={value} onChange={onChange} />;
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'اكتب إجابتك...'}
          maxLength={question.maxLength}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#C19D65] transition-colors"
        />
      );
    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || 'اكتب إجابتك...'}
          maxLength={question.maxLength}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#C19D65] transition-colors resize-none"
        />
      );
    case 'select':
      return (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                value === opt
                  ? 'bg-[#C19D65] text-black border-[#C19D65]'
                  : 'bg-white/5 border-white/10 hover:border-[#C19D65]/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case 'multiselect':
      return (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => {
                  const current = Array.isArray(value) ? value : [];
                  onChange(
                    selected
                      ? current.filter((v: string) => v !== opt)
                      : [...current, opt]
                  );
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  selected
                    ? 'bg-[#C19D65] text-black border-[#C19D65]'
                    : 'bg-white/5 border-white/10 hover:border-[#C19D65]/50'
                }`}
              >
                {selected && <Check size={12} className="inline ml-1" />}
                {opt}
              </button>
            );
          })}
        </div>
      );
    case 'boolean':
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onChange(true)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
              value === true
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-white/5 border-white/10 hover:border-green-500/30'
            }`}
          >
            <ThumbsUp size={16} /> نعم
          </button>
          <button
            onClick={() => onChange(false)}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
              value === false
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 hover:border-red-500/30'
            }`}
          >
            <ThumbsDown size={16} /> لا
          </button>
        </div>
      );
    default:
      return null;
  }
}

// ========================================
// مكون التقييم بالنجوم
// ========================================

function RatingInput({
  value,
  max,
  onChange,
}: {
  value: number | undefined;
  max: number;
  onChange: (val: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-2" dir="ltr">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={32}
            className={`transition-colors ${
              (hovered !== null ? star <= hovered : star <= (value || 0))
                ? 'fill-[#C19D65] text-[#C19D65]'
                : 'text-white/20'
            }`}
          />
        </button>
      ))}
      {value && (
        <span className="text-sm text-white/40 self-center mr-2">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

// ========================================
// مكون NPS (0-10)
// ========================================

function NPSInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <div className="flex gap-1.5 mb-2" dir="ltr">
        {Array.from({ length: 11 }, (_, i) => i).map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border ${
              value === num
                ? num <= 6
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : num <= 8
                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                    : 'bg-green-500/20 border-green-500/40 text-green-400'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/30 px-1" dir="ltr">
        <span>غير محتمل إطلاقاً</span>
        <span>محتمل جداً</span>
      </div>
    </div>
  );
}
