import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fromPath =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, navigate, fromPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Đăng nhập thất bại.');
      return;
    }

    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-wood-deep flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead
        title="Đăng Nhập Quản Trị | Nhà Nghỉ Tha Phương"
        description="Cổng đăng nhập nội bộ dành riêng cho Quản trị viên Nhà Nghỉ Tha Phương."
        canonicalPath="/admin/login"
        noIndex
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-7">
          <img
            src="/images/logo-tha-phuong.webp"
            alt="Logo Nhà Nghỉ Tha Phương"
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-gold mx-auto mb-3 bg-white shadow-luxury"
          />
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-gold-light block">
            HỆ THỐNG QUẢN LÝ NỘI BỘ
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-text-on-dark mt-1">
            Quản Trị Nhà Nghỉ Tha Phương
          </h1>
          <p className="text-xs font-medium text-text-on-dark/70 mt-1.5">
            Khu vực dành riêng cho Chủ nhà — Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-strong rounded-3xl p-6 sm:p-8 shadow-luxury-lg text-text-primary space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-state-danger/10 border border-state-danger/30 text-state-danger text-xs font-bold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email Quản trị viên"
              type="email"
              required
              placeholder="Nhập email quản trị..."
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              label="Mật khẩu bảo mật"
              type="password"
              required
              placeholder="Nhập mật khẩu..."
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="rounded-xl font-extrabold"
            >
              Đăng Nhập Quản Trị
            </Button>
          </form>

          <div className="pt-4 border-t border-border-default flex items-center justify-center text-xs font-extrabold text-state-success gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Hệ thống bảo mật 2 lớp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
