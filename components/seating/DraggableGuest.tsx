'use client';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

export function DraggableGuest({ id, name, category }: { id: string, name: string, category: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { type: 'GUEST', name } // نرسل البيانات لنعرف ماذا سحبنا
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} 
      className="bg-[#27272A] p-3 rounded-lg border border-white/10 flex items-center gap-2 cursor-grab hover:border-[#C19D65] transition-colors mb-2 shadow-sm touch-none">
      <GripVertical size={16} className="text-white/30" />
      <div>
        <p className="text-sm font-bold text-white">{name}</p>
        <span className="text-[10px] text-white/50 px-1.5 py-0.5 bg-white/5 rounded">{category}</span>
      </div>
    </div>
  );
}