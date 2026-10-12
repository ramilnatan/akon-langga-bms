import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Account {
  profile_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar_url: string | null;
  created_at: string;
}

export function AccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [promoting, setPromoting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_accounts');
      if (error) throw error;
      setAccounts(data ?? []);
    } catch (error: any) {
      toast({
        title: 'Could not load accounts',
        description: error?.message || 'An unexpected error occurred while fetching accounts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const promoteToAdmin = async () => {
    if (!selectedAccount || promoting) return;
    setPromoting(true);
    try {
      const { error } = await supabase.rpc('promote_customer_to_admin', { p_profile_id: selectedAccount.profile_id });
      if (error) throw error;
      toast({ title: 'Account promoted to admin' });
      setSelectedAccount(null);
      await fetchAccounts();
    } catch (error: any) {
      toast({ title: 'Promotion failed', description: error.message || 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Registered</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map((acc) => (
                <tr key={acc.profile_id} className="transition-colors hover:bg-surface/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {acc.full_name?.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{acc.full_name}</p>
                        <p className="text-xs text-muted-foreground">{acc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {acc.role === 'admin' ? (
                      <Badge className="bg-primary/15 text-primary">Admin</Badge>
                    ) : (
                      <span className="text-muted-foreground">Customer</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(acc.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {acc.role === 'customer' && (
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSelectedAccount(acc)}>
                        Make Admin
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Promotion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to promote <strong>{selectedAccount?.full_name}</strong> ({selectedAccount?.email}) to admin?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAccount(null)}>Cancel</Button>
            <Button onClick={promoteToAdmin} disabled={promoting}>
              {promoting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Confirm Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
