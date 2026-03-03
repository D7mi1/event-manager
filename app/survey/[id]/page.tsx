'use client';

import { useEffect, use, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SurveyRenderer } from '@/components/surveys/SurveyRenderer';
import type { SurveyDefinition, SurveyQuestion } from '@/lib/surveys/types';
import { Loader2 } from 'lucide-react';

interface PageProps { params: Promise<{ id: string }>; }

export default function PublicSurveyPage({ params }: PageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      const { data, error: err } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (err || !data) {
        setError('الاستبيان غير موجود أو تم إغلاقه');
      } else {
        const questions: SurveyQuestion[] = typeof data.questions === 'string'
          ? JSON.parse(data.questions)
          : data.questions;

        setSurvey({ ...data, questions });
      }
      setLoading(false);
    };
    fetchSurvey();
  }, [id]);

  const handleSubmit = async (answers: Record<string, any>) => {
    const res = await fetch('/api/surveys/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        survey_id: id,
        answers,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to submit');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19D65]" />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white text-center p-8" dir="rtl">
        <div>
          <p className="text-6xl mb-4">📋</p>
          <h2 className="text-xl font-bold mb-2">الاستبيان غير متاح</h2>
          <p className="text-white/50 text-sm">{error || 'يبدو أن هذا الاستبيان تم إغلاقه'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" dir="rtl">
      <div className="max-w-2xl mx-auto p-6 py-12">
        {/* شعار مِراس */}
        <div className="text-center mb-8">
          <p className="text-[#C19D65] font-bold text-sm">مِراس - MERAS</p>
        </div>

        <SurveyRenderer survey={survey} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
