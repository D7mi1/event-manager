'use client';

import { useEffect, use, useState } from 'react';
import { supabase } from '@/app/utils/supabase/client';
import { SURVEY_TEMPLATES, type SurveyDefinition, type SurveyQuestion } from '@/lib/surveys/types';
import { SurveyRenderer } from '@/components/surveys/SurveyRenderer';
import { Loader2, ArrowLeft, Copy, Check, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface PageProps { params: Promise<{ id: string }>; }

export default function SurveyManagePage({ params }: PageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<SurveyDefinition[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('event_feedback');
  const [previewSurvey, setPreviewSurvey] = useState<SurveyDefinition | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, [id]);

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`/api/surveys?event_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setSurveys(data.data || []);
      }
    } catch {
      // تجاهل
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    const template = SURVEY_TEMPLATES[selectedTemplate];
    if (!template) return;

    setCreating(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: id,
          title: template.title,
          description: template.description,
          questions: template.questions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('تم إنشاء الاستبيان بنجاح');
        fetchSurveys();
      } else {
        toast.error(data.error || 'فشل إنشاء الاستبيان');
      }
    } catch {
      toast.error('حدث خطأ');
    } finally {
      setCreating(false);
    }
  };

  const getSurveyLink = (surveyId: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/survey/${surveyId}`;
  };

  const handleCopyLink = (surveyId: string) => {
    navigator.clipboard.writeText(getSurveyLink(surveyId));
    setLinkCopied(true);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19D65]" />
      </div>
    );
  }

  // وضع المعاينة
  if (previewSurvey) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] p-4 md:p-8 text-white font-sans" dir="rtl">
        <button
          onClick={() => setPreviewSurvey(null)}
          className="text-white/50 hover:text-white flex items-center gap-2 text-sm mb-6"
        >
          <ArrowLeft size={16} /> العودة
        </button>
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center text-sm text-amber-300 mb-6">
            ⚠️ هذا معاينة فقط - الإجابات لن تُسجل
          </div>
          <SurveyRenderer
            survey={previewSurvey}
            onSubmit={async () => {
              toast.info('هذا معاينة فقط');
              setPreviewSurvey(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] p-4 md:p-8 text-white font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href={`/dashboard/events/${id}`} className="text-white/50 hover:text-white flex items-center gap-2 text-sm mb-2">
            <ArrowLeft size={16} /> العودة لغرفة التحكم
          </Link>
          <h1 className="text-3xl font-bold">📋 إدارة الاستبيانات</h1>
        </div>
      </div>

      {/* إنشاء استبيان جديد */}
      <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6 mb-8">
        <h3 className="font-bold mb-4">إنشاء استبيان جديد</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#C19D65]"
          >
            {Object.entries(SURVEY_TEMPLATES).map(([key, tpl]) => (
              <option key={key} value={key}>{tpl.title}</option>
            ))}
          </select>
          <button
            onClick={handleCreateSurvey}
            disabled={creating}
            className="px-6 py-3 bg-[#C19D65] text-black rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            إنشاء
          </button>
        </div>
      </div>

      {/* قائمة الاستبيانات */}
      {surveys.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-lg">لا توجد استبيانات بعد</p>
          <p className="text-white/20 text-sm mt-2">أنشئ استبياناً لجمع آراء الحضور</p>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey) => {
            const questions: SurveyQuestion[] = typeof survey.questions === 'string'
              ? JSON.parse(survey.questions)
              : survey.questions;

            return (
              <div key={survey.id} className="bg-[#0F0F12] border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{survey.title}</h4>
                    {survey.description && (
                      <p className="text-white/40 text-sm mt-1">{survey.description}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-xs text-white/30">
                      <span>{questions.length} سؤال</span>
                      <span>{survey.is_active ? '🟢 نشط' : '🔴 متوقف'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPreviewSurvey({
                          ...survey,
                          questions,
                        })
                      }
                      className="px-3 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 flex items-center gap-1"
                    >
                      <Eye size={14} /> معاينة
                    </button>
                    <button
                      onClick={() => handleCopyLink(survey.id)}
                      className="px-3 py-2 bg-[#C19D65] text-black rounded-xl text-xs font-bold hover:brightness-110 flex items-center gap-1"
                    >
                      {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                      نسخ الرابط
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
