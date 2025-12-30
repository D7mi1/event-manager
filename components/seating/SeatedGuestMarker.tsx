'use client';
import { useDraggable } from '@dnd-kit/core';

interface SeatedGuestProps {
  guest: any;
  tableId: string;
  isGrid?: boolean;
  style?: React.CSSProperties;
}

export function SeatedGuestMarker({ guest, tableId, isGrid, style }: SeatedGuestProps) {
  // 1. استدعاء الـ Hook دائماً في البداية (بدون شروط قبله)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `seated-${guest.id}`,
    data: { 
      type: 'SEATED_GUEST', 
      guestId: guest.id, 
      originTableId: tableId,
      name: guest.name
    }
  });

  // 2. حساب الستايل
  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100
  } : undefined;

  // 3. الإرجاع (Return)
  return (
    <div 
      ref={setNodeRef} {...listeners} {...attributes}
      style={{ ...style, ...dragStyle }}
      className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border cursor-grab active:cursor-grabbing shadow-lg transition-transform hover:scale-110 z-10
        ${isGrid ? 'rounded' : 'rounded-full'} 
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        bg-[#C19D65] text-black border-[#C19D65]
      `}
      title={guest.name}
    >
      {guest.name.charAt(0)}
    </div>
  );
}