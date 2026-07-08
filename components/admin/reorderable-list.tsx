'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Loader2 } from 'lucide-react'

interface ReorderableListProps {
  items: any[]
  onReorder: (idOrderList: { id: string | number; display_order: number }[]) => Promise<{ success: boolean; error?: string }>
  renderItem: (item: any, index: number) => React.ReactNode
  droppableId: string
}

export default function ReorderableList({ items, onReorder, renderItem, droppableId }: ReorderableListProps) {
  const [orderedItems, setOrderedItems] = useState(items)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return

    const reordered = Array.from(orderedItems)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setOrderedItems(reordered)

    // Build the new order list
    const idOrderList = reordered.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }))

    setSaving(true)
    setError(null)
    const res = await onReorder(idOrderList)
    if (!res.success) {
      setError(res.error || 'Failed to save order')
      setOrderedItems(items) // revert
    }
    setSaving(false)
  }

  return (
    <div className="relative">
      {saving && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-indigo-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving order...
        </div>
      )}
      {error && (
        <div className="mb-3 p-2 bg-red-950/40 border border-red-900/50 rounded-lg text-red-300 text-xs">
          {error}
        </div>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {orderedItems.map((item, index) => (
                <Draggable key={String(item.id)} draggableId={String(item.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-0 ${snapshot.isDragging ? 'z-50 shadow-2xl shadow-indigo-500/20 rounded-xl' : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="flex items-center justify-center px-2 py-4 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renderItem(item, index)}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
