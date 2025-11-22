import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient, USE_MOCK } from '@/lib/api'
import { toast } from '@/lib/toast'

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type EmailFormData = z.infer<typeof emailSchema>;

export function PasswordResetRequest() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      if (USE_MOCK) {
        // Mock implementation - just show success
        setIsSuccess(true);
        toast('If the email exists, an OTP has been sent.', 'success');
        setTimeout(() => {
          navigate('/password-reset', { state: { email: data.email } });
        }, 2000);
        return;
      }

      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/password-reset/request',
        { email: data.email }
      );

      if (response.data.success) {
        setIsSuccess(true);
        toast('If the email exists, an OTP has been sent.', 'success');
        setTimeout(() => {
          navigate('/password-reset', { state: { email: data.email } });
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to send password reset email';
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
            Enter your email address and we'll send you an OTP to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                <p className="font-medium">Email sent!</p>
                <p className="mt-1">If the email exists, an OTP has been sent. Please check your inbox.</p>
                <p className="mt-2 text-xs text-green-500">Redirecting to OTP verification...</p>
              </div>
            </div>
          ) : (
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
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

