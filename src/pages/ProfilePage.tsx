import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/types';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, auth_user_id, full_name, role, avatar_url, created_at, updated_at')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setProfile(data);
            setFullName(data.full_name || '');
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          toast({
            title: 'Error',
            description: 'Failed to load profile.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [authLoading, user, navigate]);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast({
        title: 'Validation Error',
        description: 'Full name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('update_my_profile', {
        p_full_name: trimmedName,
        p_avatar_url: profile?.avatar_url || null,
      });

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, full_name: trimmedName } : null);
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container className="py-10">
      <Helmet>
        <title>My Profile | AKON LANGGA</title>
      </Helmet>

      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Manage your basic profile information."
      />

      <div className="mx-auto max-w-2xl">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your public display name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
