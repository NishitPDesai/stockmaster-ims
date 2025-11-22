import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient, USE_MOCK } from '@/lib/api'
import { toast } from '@/lib/toast'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function PasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // Get email from location state (passed from PasswordResetRequest)
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email,
    },
  });

  // Update email field when state changes
  useEffect(() => {
    if (email) {
      setValue('email', email);
    }
  }, [email, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Mock implementation
        toast('Password reset successfully!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/password-reset/reset',
        {
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
        }
      );

      if (response.data.success) {
        toast('Password reset successfully!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to reset password';
      setError(errorMessage);
      toast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter the OTP sent to your email and your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                value={email || ''}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValue('email', e.target.value);
                }}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                {...register('otp')}
                aria-invalid={errors.otp ? 'true' : 'false'}
                className="text-center text-2xl tracking-widest font-mono"
              />
              {errors.otp && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                {...register('newPassword')}
                aria-invalid={errors.newPassword ? 'true' : 'false'}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center text-sm space-y-2">
              <div>
                <Link to="/password-reset-request" className="text-primary hover:underline">
                  Resend OTP
                </Link>
              </div>
              <div>
                <Link to="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

