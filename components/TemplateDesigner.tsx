'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Download, Save } from 'lucide-react'
import useTemplateDesigner from '@/app/hooks/useTemplateDesigner'
import { DesignElement } from '@/app/utils/templateSchema'

interface TemplateDesignerProps {
  eventId: string
  templateType: 'ticket' | 'email' | 'certificate' | 'invitation'
  onSave?: (templateId: string) => void
}

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({
  eventId,
  templateType,
  onSave,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const {
    elements,
    selectedElement,
    isSaving,
    error,
    setSelectedElement,
    addElement,
    updateElement,
    deleteElement,
    saveTemplate,
  } = useTemplateDesigner({ eventId, templateType })

  const [templateName, setTemplateName] = useState(`${templateType}-design`)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [toolMode, setToolMode] = useState<'select' | 'text' | 'image'>('select')

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (toolMode === 'select') {
      setSelectedElement(null)
    } else if (toolMode === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const newElement: DesignElement = {
          id: `text-${Date.now()}`,
          type: 'text',
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          width: 200,
          height: 50,
          rotation: 0,
          opacity: 1,
          zIndex: elements.length,
          text: 'نص جديد',
          fontSize: 24,
          fontFamily: 'Cairo',
          fontColor: '#000000',
          textAlign: 'center',
        }
        addElement(newElement)
      }
    }
  }

  // Handle save
  const handleSave = async () => {
    const success = await saveTemplate(templateName)
    if (success && onSave) {
      onSave(templateName)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 محرر التصاميم
          </h1>
          <p className="text-gray-600">
            صمم تذاكر وشهادات احترافية لفعاليتك
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-4">
            {/* Template Name */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم التصميم
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: تذكرة الزفاف"
              />
            </div>

            {/* Background Color */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                لون الخلفية
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Tools */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                الأدوات
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setToolMode('select')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                    toolMode === 'select'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ↔️ تحديد
                </button>
                <button
                  onClick={() => setToolMode('text')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                    toolMode === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 نص
                </button>
                <button
                  onClick={() => setToolMode('image')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                    toolMode === 'image'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🖼️ صورة
                </button>
              </div>
            </div>

            {/* Element List */}
            {elements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  العناصر ({elements.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {elements.map((el) => (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElement(el)}
                      className={`p-2 rounded cursor-pointer text-sm transition-all ${
                        selectedElement?.id === el.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium">{el.type}</div>
                      {el.text && (
                        <div className="text-gray-600 truncate">{el.text}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {isSaving ? 'جاري الحفظ...' : 'حفظ التصميم'}
            </button>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Canvas */}
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative w-full bg-white rounded-lg shadow-lg border-2 border-gray-200 cursor-crosshair"
              style={{
                backgroundColor: bgColor,
                minHeight: '600px',
                aspectRatio: '2/3',
              }}
            >
              {/* Elements Renderer */}
              {elements.map((el) => (
                <div
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedElement(el)
                  }}
                  className={`absolute transition-all ${
                    selectedElement?.id === el.id
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : 'ring-1 ring-gray-300'
                  }`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    opacity: el.opacity,
                    zIndex: el.zIndex,
                    transform: `rotate(${el.rotation}deg)`,
                  }}
                >
                  {el.type === 'text' && (
                    <div
                      className="w-full h-full flex items-center justify-center p-2"
                      style={{
                        color: el.fontColor,
                        fontSize: `${el.fontSize}px`,
                        fontFamily: el.fontFamily,
                        textAlign: el.textAlign as any,
                        fontWeight: el.fontWeight,
                      }}
                    >
                      {el.text}
                    </div>
                  )}
                  {el.type === 'image' && el.imageUrl && (
                    <img
                      src={el.imageUrl}
                      alt="design-element"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}

              {/* Empty State */}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <Plus size={48} className="mb-2 opacity-50" />
                  <p>اختر "نص" أو "صورة" من الأدوات للبدء</p>
                </div>
              )}
            </div>

            {/* Element Properties */}
            {selectedElement && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    خصائص العنصر
                  </h3>
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Text Properties */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        النص
                      </label>
                      <input
                        type="text"
                        value={selectedElement.text || ''}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { text: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          حجم الخط
                        </label>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 24}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              fontSize: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min={8}
                          max={72}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اللون
                        </label>
                        <input
                          type="color"
                          value={selectedElement.fontColor || '#000000'}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              fontColor: e.target.value,
                            })
                          }
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الخط
                      </label>
                      <select
                        value={selectedElement.fontFamily || 'Cairo'}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            fontFamily: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Cairo">Cairo</option>
                        <option value="Almarai">Almarai</option>
                        <option value="GE Dinar One">GE Dinar One</option>
                        <option value="Droid Arabic Kufi">Droid Arabic Kufi</option>
                        <option value="Mada">Mada</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateDesigner
