import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';

type AuthMode = 'signin' | 'signup' | 'forgot';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      setLoading(false);

      if (error) {
        toast({
          title: 'Could not send reset email',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setResetSent(true);

      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link.',
      });

      return;
    }

    if (!password) {
      toast({
        title: 'Password is required',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        toast({
          title: 'Password must be at least 6 characters',
          variant: 'destructive',
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    const result =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

    setLoading(false);

    if (result.error) {
      toast({
        title:
          mode === 'signin'
            ? 'Sign in failed'
            : 'Sign up failed',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'signup') {
      toast({
        title: 'Account created',
        description:
          'Your account has been created successfully.',
      });
    } else {
      navigate('/');
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setResetSent(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <Helmet>
        <title>
          {mode === 'forgot'
            ? 'Reset Password'
            : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}{' '}
          — AKON LANGGA
        </title>

        <meta
          name="description"
          content="Sign in, create an account, or reset your AKON LANGGA password."
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
                {mode === 'forgot'
                  ? 'Reset Your Password'
                  : mode === 'signup'
                    ? 'Create Your Account'
                    : 'Welcome Back'}
              </h1>

              <p className="mt-2 text-muted-foreground">
                {mode === 'forgot'
                  ? 'Enter your email and we will send you a password reset link.'
                  : mode === 'signup'
                    ? 'Create an account to enjoy a better AKON LANGGA experience.'
                    : 'Sign in to your AKON LANGGA account.'}
              </p>
            </div>

            {mode === 'forgot' && resetSent ? (
              <div className="mt-8 flex flex-col items-center gap-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2
                    className="h-8 w-8"
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <h2 className="font-semibold">
                    Check Your Email
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    We sent a password reset link to{' '}
                    <strong className="text-foreground">
                      {email}
                    </strong>
                    .
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => switchMode('signin')}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <div>
                  <Label htmlFor="email">Email</Label>

                  <div className="relative mt-1.5">
                    <Mail
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      placeholder="you@example.com"
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">
                          Password
                        </Label>

                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() =>
                              switchMode('forgot')
                            }
                            className="text-sm text-primary transition-colors hover:underline"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>

                      <div className="relative mt-1.5">
                        <Lock
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />

                        <Input
                          id="password"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          required
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          autoComplete={
                            mode === 'signin'
                              ? 'current-password'
                              : 'new-password'
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {mode === 'signup' && (
                      <div>
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>

                        <div className="relative mt-1.5">
                          <Lock
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                          />

                          <Input
                            id="confirmPassword"
                            type={
                              showConfirmPassword
                                ? 'text'
                                : 'password'
                            }
                            value={confirmPassword}
                            onChange={(e) =>
                              setConfirmPassword(
                                e.target.value
                              )
                            }
                            required
                            placeholder="Re-enter your password"
                            className="pl-10 pr-10"
                            autoComplete="new-password"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(
                                (value) => !value
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={
                              showConfirmPassword
                                ? 'Hide password'
                                : 'Show password'
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full shadow-soft"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner
                      size="sm"
                      className="mr-2"
                    />
                  ) : (
                    <>
                      {mode === 'forgot'
                        ? 'Send Reset Link'
                        : mode === 'signup'
                          ? 'Create Account'
                          : 'Sign In'}

                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              {mode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Back to Sign In
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {mode === 'signin'
                    ? "Don't have an account?"
                    : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() =>
                      switchMode(
                        mode === 'signin'
                          ? 'signup'
                          : 'signin'
                      )
                    }
                    className="font-medium text-primary hover:underline"
                  >
                    {mode === 'signin'
                      ? 'Create one'
                      : 'Sign In'}
                  </button>
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Back to homepage
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>
    </>
  );
}