'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { Sparkles, Wand2, Image as ImageIcon, Type, Loader2, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AIAssistantStepProps {
  eventType: string;
  eventDetails: any;
  setEventDetails: (details: any) => void;
  selectedColor: string;
  onNext: () => void;
  onBack: () => void;
}

export function AIAssistantStep({
  eventType,
  eventDetails,
  setEventDetails,
  selectedColor,
  onNext,
  onBack
}: AIAssistantStepProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [textVariations, setTextVariations] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState('');

  // AI Text Settings
  const [tone, setTone] = useState<'formal' | 'casual' | 'elegant'>('formal');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // AI Image Settings
  const [imageTheme, setImageTheme] = useState('');
  const [imageStyle, setImageStyle] = useState<'modern' | 'classic' | 'minimal' | 'floral'>('modern');

  const predefinedThemes = [
    'مؤتمر أعمال احترافي',
    'حفل إطلاق منتج',
    'ورشة عمل تفاعلية',
    'حفل افتتاح رسمي',
    'معرض تجاري',
    'ندوة تقنية'
  ];

  // Generate Text
  const handleGenerateText = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'business event',
          eventName: eventDetails.name,
          date: eventDetails.date,
          location: eventDetails.locationName,
          tone,
          language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedText(data.text);
        setEventDetails({ ...eventDetails, invitationText: data.text });
      } else {
        toast.error('فشل توليد النص: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Text generation error:', error);
      toast.error('حدث خطأ أثناء توليد النص');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get Text Variations
  const handleGetVariations = async () => {
    if (!generatedText) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/text-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: generatedText, count: 3 }),
      });

      const data = await response.json();

      if (data.success) {
        setTextVariations(data.variations);
      }
    } catch (error) {
      console.error('Variations error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Image
  const handleGenerateImage = async () => {
    if (!imageTheme) {
      toast.warning('الرجاء اختيار موضوع الصورة');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'business',
          theme: imageTheme,
          style: imageStyle,
          colors: [selectedColor, 'white'],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage(data.imageUrl);
        setEventDetails({ ...eventDetails, image_url: data.imageUrl });
      } else {
        toast.error('فشل توليد الصورة: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('حدث خطأ أثناء توليد الصورة');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-left duration-300 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: selectedColor + '20' }}
        >
          <Wand2 size={24} style={{ color: selectedColor }} />
        </div>
        <div>
          <h1 className="text-3xl font-black">مساعد الذكاء الاصطناعي</h1>
          <p className="text-sm text-white/40">دع الذكاء الاصطناعي يساعدك</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'text'
            ? 'bg-white text-black'
            : 'text-white/40 hover:text-white/70'
            }`}
        >
          <Type size={18} className="inline mr-2" />
          توليد النص
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'image'
            ? 'bg-white text-black'
            : 'text-white/40 hover:text-white/70'
            }`}
        >
          <ImageIcon size={18} className="inline mr-2" />
          توليد الصورة
        </button>
      </div>

      {/* Text Generation Tab */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          {/* Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-white/50 mb-2 block">الأسلوب</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30"
              >
                <option value="formal">رسمي</option>
                <option value="elegant">راقي</option>
                <option value="casual">ودي</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 mb-2 block">اللغة</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateText}
            disabled={isGenerating}
            style={{ backgroundColor: selectedColor }}
            className="w-full py-4 rounded-xl text-black font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                توليد نص الدعوة
              </>
            )}
          </button>

          {/* Generated Text */}
          {generatedText && (
            <div className="space-y-3">
              <div
                className="p-4 rounded-xl border relative"
                style={{
                  backgroundColor: selectedColor + '10',
                  borderColor: selectedColor + '30'
                }}
              >
                <div className="absolute top-3 left-3">
                  <Check size={16} style={{ color: selectedColor }} />
                </div>
                <p className="text-sm leading-relaxed text-white/90 pr-6">
                  {generatedText}
                </p>
              </div>

              <button
                onClick={handleGetVariations}
                disabled={isGenerating}
                className="w-full py-3 border border-white/20 rounded-xl hover:bg-white/5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                احصل على نسخ بديلة
              </button>
            </div>
          )}

          {/* Variations */}
          {textVariations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-white/50">نسخ بديلة:</p>
              {textVariations.map((variation, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setGeneratedText(variation);
                    setEventDetails({ ...eventDetails, invitationText: variation });
                  }}
                  className="w-full p-3 text-right bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/30 transition-all text-sm"
                >
                  {variation}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Generation Tab */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          {/* Theme Selection */}
          <div>
            <label className="text-xs font-bold text-white/50 mb-2 block">موضوع الصورة</label>
            <select
              value={imageTheme}
              onChange={(e) => setImageTheme(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/30"
            >
              <option value="">اختر موضوع...</option>
              {predefinedThemes.map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* Style Selection */}
          <div>
            <label className="text-xs font-bold text-white/50 mb-2 block">الأسلوب</label>
            <div className="grid grid-cols-2 gap-2">
              {(['modern', 'classic', 'minimal', 'floral'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setImageStyle(style)}
                  className={`p-3 rounded-xl border transition-all text-sm font-bold ${imageStyle === style
                    ? 'border-white bg-white/10'
                    : 'border-white/10 hover:border-white/30'
                    }`}
                >
                  {style === 'modern' && 'عصري'}
                  {style === 'classic' && 'كلاسيكي'}
                  {style === 'minimal' && 'بسيط'}
                  {style === 'floral' && 'زهري'}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating || !imageTheme}
            style={{ backgroundColor: selectedColor }}
            className="w-full py-4 rounded-xl text-black font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                جاري التوليد... (قد يستغرق دقيقة)
              </>
            ) : (
              <>
                <ImageIcon size={18} />
                توليد الصورة
              </>
            )}
          </button>

          {/* Generated Image */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2" style={{ borderColor: selectedColor }}>
                <NextImage
                  src={generatedImage}
                  alt="Generated invitation"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-3 right-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <Check size={16} className="text-black" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip Message */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
        <p className="text-xs text-white/50 text-center">
          💡 يمكنك تخطي هذه الخطوة واستخدام النصوص والصور الخاصة بك
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
        >
          السابق
        </button>
        <button
          onClick={onNext}
          style={{ backgroundColor: selectedColor }}
          className="px-8 py-3 rounded-xl text-black font-black hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
        >
          التالي
          <Sparkles size={16} />
        </button>
      </div>
    </div>
  );
}
