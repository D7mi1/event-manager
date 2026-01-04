'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/app/utils/supabase/client'
import { Template, DesignElement } from '@/app/utils/templateSchema'
import useSWR from 'swr'

interface UseTemplateDesignerProps {
  eventId: string
  templateType: 'ticket' | 'email' | 'certificate' | 'invitation'
}

export const useTemplateDesigner = ({
  eventId,
  templateType,
}: UseTemplateDesignerProps) => {
  const [template, setTemplate] = useState<Template | null>(null)
  const [elements, setElements] = useState<DesignElement[]>([])
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch template
  const fetchTemplate = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('event_templates')
        .select('*')
        .eq('event_id', eventId)
        .eq('template_type', templateType)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (data) {
        setTemplate(data as Template)
        setElements(data.elements || [])
      }
    } catch (err: any) {
      setError(err.message)
    }
  }, [eventId, templateType])

  useEffect(() => {
    fetchTemplate()
  }, [fetchTemplate])

  // Add element
  const addElement = useCallback((element: DesignElement) => {
    setElements((prev) => [...prev, element])
  }, [])

  // Update element
  const updateElement = useCallback((elementId: string, updates: Partial<DesignElement>) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    )
  }, [])

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId))
    setSelectedElement(null)
  }, [])

  // Save template
  const saveTemplate = useCallback(async (templateName: string) => {
    setIsSaving(true)
    try {
      if (template?.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from('event_templates')
          .update({
            template_name: templateName,
            elements: elements,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id)

        if (updateError) throw updateError
      } else {
        // Create new
        const { data, error: insertError } = await supabase
          .from('event_templates')
          .insert([
            {
              event_id: eventId,
              template_name: templateName,
              template_type: templateType,
              template_category: 'wedding', // Default, will be updated
              elements: elements,
            },
          ])
          .select()
          .single()

        if (insertError) throw insertError
        setTemplate(data as Template)
      }

      setError(null)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [template?.id, eventId, templateType, elements])

  // Generate preview
  const generatePreview = useCallback(async () => {
    try {
      // This will be implemented with canvas rendering
      // For now, we'll return a placeholder
      return 'preview-generated'
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  // Load preset
  const loadPreset = useCallback(async (presetId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('template_presets')
        .select('*')
        .eq('id', presetId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setElements(data.design_json?.elements || [])
      }
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  return {
    // State
    template,
    elements,
    selectedElement,
    isSaving,
    error,

    // Methods
    setSelectedElement,
    addElement,
    updateElement,
    deleteElement,
    saveTemplate,
    generatePreview,
    loadPreset,
    fetchTemplate,
  }
}

export default useTemplateDesigner
