import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  isEditMode: boolean;
  onAddSection: () => void;
}

export const EmptyState = ({ isEditMode, onAddSection }: EmptyStateProps) => {
  if (!isEditMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground">No sections have been added to this form yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <p className="text-muted-foreground mb-4">Get started by adding your first section</p>
      <Button onClick={onAddSection} variant="outline" className="gap-2">
        <PlusCircle className="w-4 h-4" />
        Add Section
      </Button>
    </div>
  );
}; 