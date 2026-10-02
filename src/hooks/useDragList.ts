import { useCallback, useState } from 'react';

interface DragListState {
  order: string[] | null;   // draft order while dragging (null = not dragging)
  draggingId: string | null;
}

/**
 * Local-draft drag reordering: reorder visually during dragOver,
 * commit once on dragEnd. Works with native HTML5 DnD (desktop);
 * arrow buttons cover mobile (HTML5 DnD doesn't fire on touch).
 */
export function useDragList(itemIds: string[], onCommit: (orderedIds: string[]) => void) {
  const [state, setState] = useState<DragListState>({ order: null, draggingId: null });

  const displayOrder = state.order ?? itemIds;

  const handleDragStart = useCallback((id: string) => {
    setState({ order: itemIds, draggingId: id });
  }, [itemIds]);

  const handleDragOver = useCallback((targetId: string) => {
    setState((prev) => {
      if (!prev.draggingId || prev.draggingId === targetId) return prev;
      const list = prev.order ?? itemIds;
      const from = list.indexOf(prev.draggingId);
      const to = list.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...list];
      next.splice(from, 1);
      next.splice(to, 0, prev.draggingId);
      return { ...prev, order: next };
    });
  }, [itemIds]);

  const handleDragEnd = useCallback(() => {
    if (state.order) onCommit(state.order);
    setState({ order: null, draggingId: null });
  }, [state.order, onCommit]);

  return { displayOrder, draggingId: state.draggingId, handleDragStart, handleDragOver, handleDragEnd };
}
