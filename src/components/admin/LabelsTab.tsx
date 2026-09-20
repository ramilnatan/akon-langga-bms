import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Tag, Star, Sparkles, Leaf, Gift } from 'lucide-react';
import { supabase } from '@/services';
import { toast } from 'sonner';
import type { Label } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LabelForm } from './LabelForm';

const iconMap: Record<string, React.ElementType> = {
  star: Star,
  sparkles: Sparkles,
  leaf: Leaf,
  gift: Gift,
  tag: Tag,
};

export function LabelsTab() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);

  const fetchLabels = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[LabelsTab] Failed to load labels:', error);
      toast.error('Failed to load labels.');
      setLoading(false);
      return;
    }

    setLabels(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const handleAdd = () => {
    setEditingLabel(null);
    setShowForm(true);
  };

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingLabel) {
      return;
    }

    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', deletingLabel.id);

    if (error) {
      console.error('[LabelsTab] Delete failed:', error);
      toast.error('Failed to delete label.');
      return;
    }

    toast.success('Label deleted successfully.');
    setDeletingLabel(null);
    fetchLabels();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingLabel(null);
    fetchLabels();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading labels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Labels</h2>
          <p className="text-sm text-muted-foreground">
            Manage the product labels shown on the storefront.
          </p>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Label
        </Button>
      </div>

      {labels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Tag className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium">No labels yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first label for the storefront.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {labels.map((label) => {
            const Icon = iconMap[label.icon ?? ''] || Tag;
            return (
              <Card key={label.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <div
                        className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-medium"
                        style={{
                          backgroundColor: label.background_color,
                          color: label.text_color,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label.name}
                      </div>

                      <Badge variant={label.active ? 'default' : 'secondary'}>
                        {label.active ? 'Active' : 'Inactive'}
                      </Badge>

                      <Badge variant="outline">Order {label.display_order}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">/{label.slug}</p>

                    {label.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {label.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(label)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingLabel(label)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <LabelForm
          label={editingLabel}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {deletingLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="text-lg font-semibold">Delete Label?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will permanently delete the label: "{deletingLabel.name}".
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingLabel(null)}>
                  Cancel
                </Button>

                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
