import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, HelpCircle } from 'lucide-react';
import { supabase } from '@/services';
import { toast } from 'sonner';
import type { Faq } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FaqForm } from './FaqForm';

export function FaqsTab() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[FaqsTab] Failed to load FAQs:', error);
      toast.error('Failed to load FAQs.');
      setLoading(false);
      return;
    }

    setFaqs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleAdd = () => {
    setEditingFaq(null);
    setShowForm(true);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingFaq) {
      return;
    }

    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', deletingFaq.id);

    if (error) {
      console.error('[FaqsTab] Delete failed:', error);
      toast.error('Failed to delete FAQ.');
      return;
    }

    toast.success('FAQ deleted successfully.');
    setDeletingFaq(null);
    fetchFaqs();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingFaq(null);
    fetchFaqs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">FAQs</h2>
          <p className="text-sm text-muted-foreground">
            Manage the Frequently Asked Questions shown on the storefront.
          </p>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium">No FAQs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first FAQ entry for the storefront.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{faq.question}</h3>

                    <Badge variant={faq.active ? 'default' : 'secondary'}>
                      {faq.active ? 'Active' : 'Inactive'}
                    </Badge>

                    <Badge variant="outline">
                      Order {faq.display_order}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(faq)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingFaq(faq)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <FaqForm
          open={showForm}
          onOpenChange={setShowForm}
          faq={editingFaq}
          onSaved={handleSaved}
        />
      )}

      {deletingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="text-lg font-semibold">Delete FAQ?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will permanently delete the FAQ: "{deletingFaq.question}".
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeletingFaq(null)}
                >
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
