import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  Lock,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const finish = (ready: boolean) => {
      if (cancelled) return;

      setRecoveryReady(ready);
      setChecking(false);
    };

    /*
     * IMPORTANT:
     * Register the auth listener FIRST.
     *
     * Supabase password-recovery links can arrive with the
     * access token in the URL hash. Supabase may emit the
     * PASSWORD_RECOVERY event while establishing the session.
     *
     * If getSession() is checked first and we immediately
     * treat "no session" as failure, we can miss that event.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ResetPassword] Auth event:', event);

      if (cancelled) return;

      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('[ResetPassword] Password recovery session detected');
        finish(true);
        return;
      }

      if (session) {
        console.log('[ResetPassword] Existing session detected');
        finish(true);
      }
    });

    /*
     * Check for an already-established session.
     * This handles cases where Supabase finishes processing
     * the recovery link before our listener needs to react.
     */
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;

        if (session) {
          console.log('[ResetPassword] Session already available');
          finish(true);
        }
      })
      .catch((error) => {
        console.error('[ResetPassword] Session check failed:', error);
      });

    /*
     * Give Supabase time to process the recovery URL/hash.
     *
     * We deliberately do NOT immediately fail when there is
     * no session. This was the problem with the previous version.
     */
    const timeout = window.setTimeout(() => {
      if (cancelled) return;

      console.warn(
        '[ResetPassword] No recovery session detected within timeout'
      );

      finish(false);
    }, 8000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast({
        title: 'Please enter a new password',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSubmitting(false);

    if (error) {
      console.error('[ResetPassword] Password update failed:', error);

      toast({
        title: 'Could not update password',
        description: error.message,
        variant: 'destructive',
      });

      return;
    }

    setSuccess(true);

    toast({
      title: 'Password updated successfully',
    });
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — AKON LANGGA</title>
        <meta
          name="description"
          content="Reset your AKON LANGGA account password."
        />
      </Helmet>

      <div className="min-h-[70vh] bg-background py-12 sm:py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
            className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-card sm:p-10"
          >
            <div className="flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                <Leaf
                  className="h-8 w-8"
                  aria-hidden="true"
                />
              </span>

              <h1 className="mt-6 font-display text-3xl font-semibold">
                {success
                  ? 'Password Updated'
                  : 'Reset Your Password'}
              </h1>

              <p className="mt-2 text-muted-foreground">
                {success
                  ? 'Your password has been changed successfully.'
                  : 'Choose a new password for your account.'}
              </p>
            </div>

            {success ? (
              <div className="mt-8 flex flex-col items-center gap-6">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2
                    className="h-8 w-8"
                    aria-hidden="true"
                  />
                </span>

                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full shadow-soft"
                >
                  <Link to="/auth">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : checking ? (
              <div className="mt-10 flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />

                <p className="text-sm text-muted-foreground">
                  Verifying your reset link…
                </p>
              </div>
            ) : !recoveryReady ? (
              <div className="mt-8 flex flex-col items-center gap-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
                  <ShieldAlert
                    className="h-8 w-8"
                    aria-hidden="true"
                  />
                </span>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  This link is no longer valid or has expired.
                  Please request a new password reset link from
                  the sign-in page.
                </p>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full"
                >
                  <Link to="/auth">
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <div>
                  <Label htmlFor="password">
                    New Password
                  </Label>

                  <div className="relative mt-1.5">
                    <Lock
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />

                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      placeholder="At least 6 characters"
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm">
                    Confirm New Password
                  </Label>

                  <div className="relative mt-1.5">
                    <Lock
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />

                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) =>
                        setConfirm(e.target.value)
                      }
                      required
                      placeholder="Re-enter your new password"
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full shadow-soft"
                  disabled={submitting}
                >
                  {submitting ? (
                    <LoadingSpinner
                      size="sm"
                      className="mr-2"
                    />
                  ) : (
                    <>
                      Change Password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {!success &&
              !checking &&
              recoveryReady && (
                <div className="mt-6 text-center">
                  <Link
                    to="/auth"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Back to Sign In
                  </Link>
                </div>
              )}
          </motion.div>
        </Container>
      </div>
    </>
  );
}
