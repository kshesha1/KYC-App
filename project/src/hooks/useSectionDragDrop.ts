import { useFormStore } from '../store/formStore';

export const useSectionDragDrop = () => {
  const { isEditMode, reorderSection } = useFormStore();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, sectionId: string, currentOrder: number) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: sectionId, order: currentOrder }));
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    e.preventDefault();
    const draggedOverItem = e.currentTarget;
    draggedOverItem.classList.add('border-t-2', 'border-blue-500');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    e.currentTarget.classList.remove('border-t-2', 'border-blue-500');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropOrder: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.currentTarget.classList.remove('border-t-2', 'border-blue-500');
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const draggedSectionId = data.id;
    const draggedOrder = data.order;
    
    if (draggedOrder === dropOrder) return;
    
    reorderSection(draggedSectionId, dropOrder);
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}; 