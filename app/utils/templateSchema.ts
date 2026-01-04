import { z } from 'zod'

/**
 * Template Design System - نظام التصاميم
 * للزواجات والفعاليات
 */

// Design Element Schema
export const designElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'shape', 'decoration']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  zIndex: z.number().default(0),
  
  // Text properties
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontColor: z.string().optional(),
  fontWeight: z.enum(['normal', 'bold', 'lighter']).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  
  // Image properties
  imageUrl: z.string().optional(),
  imageScale: z.number().optional(),
  
  // Shape properties
  shapeType: z.enum(['rectangle', 'circle', 'diamond']).optional(),
  fillColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  
  // Decoration
  decorationType: z.enum(['border', 'ornament', 'frame']).optional(),
})

export type DesignElement = z.infer<typeof designElementSchema>

// Template Schema
export const templateSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  template_name: z.string().min(3).max(50),
  template_type: z.enum(['ticket', 'email', 'certificate', 'invitation']),
  template_category: z.enum(['wedding', 'corporate', 'birthday', 'other']),
  
  // Design properties
  width: z.number().default(400),
  height: z.number().default(600),
  background_color: z.string().default('#ffffff'),
  background_image: z.string().optional(),
  
  // Elements
  elements: z.array(designElementSchema).default([]),
  
  // Metadata
  is_public: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  preview_url: z.string().optional(),
})

export type Template = z.infer<typeof templateSchema>

// Preset Templates (القوالب الجاهزة)
export const presetTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['wedding', 'corporate', 'birthday', 'other']),
  template_type: z.enum(['ticket', 'email', 'certificate', 'invitation']),
  thumbnail_url: z.string(),
  design_json: z.unknown() as z.ZodType<Record<string, unknown>>,
  created_at: z.date(),
})

export type PresetTemplate = z.infer<typeof presetTemplateSchema>

// Arabic Fonts List
export const ARABIC_FONTS = [
  { name: 'Droid Arabic Kufi', value: 'Droid Arabic Kufi' },
  { name: 'Droid Arabic Naskh', value: 'Droid Arabic Naskh' },
  { name: 'Cairoflat', value: 'Cairoflat' },
  { name: 'Mada', value: 'Mada' },
  { name: 'GE Dinar One', value: 'GE Dinar One' },
  { name: 'Ruwudu', value: 'Ruwudu' },
  { name: 'Amiri', value: 'Amiri' },
  { name: 'Almarai', value: 'Almarai' },
  { name: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic' },
  { name: 'Cairo', value: 'Cairo' },
] as const

// Wedding-specific colors
export const WEDDING_COLORS = [
  '#FFD700', // Gold
  '#C0C0C0', // Silver
  '#8B0000', // Deep Red
  '#2F4F4F', // Dark Slate
  '#FFB6C1', // Light Pink
  '#FFF8DC', // Cornsilk
  '#000000', // Black
  '#FFFFFF', // White
  '#D4AF37', // Gold (Dark)
  '#E6E6FA', // Lavender
] as const

// Preset Wedding Designs
export const WEDDING_PRESETS = {
  TRADITIONAL_ISLAMIC: {
    name: 'Traditional Islamic',
    description: 'تصميم إسلامي تقليدي فاخر',
    colors: ['#8B0000', '#FFD700', '#FFFFFF'],
    fonts: ['GE Dinar One', 'Droid Arabic Naskh'],
  },
  MODERN_ELEGANT: {
    name: 'Modern Elegant',
    description: 'تصميم حديث أنيق',
    colors: ['#2F4F4F', '#C0C0C0', '#FFFFFF'],
    fonts: ['Cairo', 'Almarai'],
  },
  LUXURY_GOLD: {
    name: 'Luxury Gold',
    description: 'ذهبي فاخر',
    colors: ['#D4AF37', '#2F4F4F', '#FFFFFF'],
    fonts: ['GE Dinar One', 'Droid Arabic Kufi'],
  },
  FLORAL_GARDEN: {
    name: 'Floral Garden',
    description: 'حديقة زهور',
    colors: ['#FFB6C1', '#2F4F4F', '#FFFFFF'],
    fonts: ['Cairo', 'Mada'],
  },
  MINIMALIST: {
    name: 'Minimalist',
    description: 'بسيط وأنيق',
    colors: ['#000000', '#FFFFFF', '#888888'],
    fonts: ['Almarai', 'IBM Plex Sans Arabic'],
  },
} as const

export type WeddingPreset = keyof typeof WEDDING_PRESETS
