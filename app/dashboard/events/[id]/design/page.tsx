'use client'

import { use, useState } from 'react'
import TemplateDesigner from '@/components/TemplateDesigner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TemplateDesignerPage({ params }: PageProps) {
  const { id } = use(params)
  const [savedMessage, setSavedMessage] = useState('')

  const handleSave = (templateId: string) => {
    setSavedMessage('✅ تم حفظ التصميم بنجاح!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {savedMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {savedMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎨 محرر التصاميم المتقدم
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                صمم تذاكر واحتفالات احترافية لفعاليتك
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">معرّف الفعالية</p>
              <p className="text-lg font-mono text-gray-900">{id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="designer" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="designer">🎨 المحرر</TabsTrigger>
            <TabsTrigger value="presets">⭐ القوالب</TabsTrigger>
            <TabsTrigger value="gallery">🖼️ المعرض</TabsTrigger>
          </TabsList>

          {/* Designer Tab */}
          <TabsContent value="designer" className="space-y-4">
            <TemplateDesigner
              eventId={id}
              templateType="ticket"
              onSave={handleSave}
            />
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Preset Card 1 */}
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-40 bg-gradient-to-br from-red-900 to-gold-600 relative"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #8B0000 0%, #FFD700 100%)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">تقليدي إسلامي</h3>
                      <p className="text-sm opacity-90">فاخر وأنيق</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    استخدم هذا القالب
                  </button>
                </div>
              </div>

              {/* Preset Card 2 */}
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-40 bg-gradient-to-br from-slate-800 to-gray-300 relative"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #2F4F4F 0%, #C0C0C0 100%)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">حديث أنيق</h3>
                      <p className="text-sm opacity-90">بسيط وأنيق</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    استخدم هذا القالب
                  </button>
                </div>
              </div>

              {/* Preset Card 3 */}
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="h-40 bg-gradient-to-br from-yellow-700 to-slate-900 relative"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #D4AF37 0%, #2F4F4F 100%)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">ذهبي فاخر</h3>
                      <p className="text-sm opacity-90">ملكي وراقي</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    استخدم هذا القالب
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                معرض التصاميم
              </h3>
              <p className="text-gray-600 mb-6">
                ستظهر هنا جميع التصاميم التي حفظتها
              </p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                إنشاء تصميم جديد
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
