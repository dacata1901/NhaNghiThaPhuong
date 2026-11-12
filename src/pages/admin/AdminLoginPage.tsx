import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Zap,
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

  const [email, setEmail] = useState('minhkhang19012006@gmail.com');
  const [password, setPassword] = useState('ThaPhuong@2026');
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

  const handleInstantLogin = async () => {
    setError(null);
    setIsLoading(true);
    const res = await login('huynhduykhanh0406@gmail.com', 'ThaPhuong@2026');
    setIsLoading(false);
    if (res.success) {
      navigate(fromPath, { replace: true });
    }
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
          <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 border border-brand-gold text-brand-gold-light flex items-center justify-center mx-auto mb-3 font-serif text-lg font-extrabold tracking-widest">
            TP
          </div>
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-gold-light block">
            HỆ THỐNG QUẢN LÝ CHỦ NHÀ
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-text-on-dark mt-1">
            Quản Trị Nhà Nghỉ Tha Phương
          </h1>
        </div>

        <div className="bg-bg-ivory-white border border-border-strong rounded-3xl p-6 sm:p-8 shadow-luxury-lg text-text-primary space-y-5">
          {/* Nút vào nhanh 1 chạm cho Chủ nhà */}
          <div className="p-4 rounded-2xl bg-brand-champagne/40 border border-brand-gold/40 space-y-2.5">
            <span className="text-xs font-extrabold text-bg-wood-deep block">
              Chuyển nhanh dành cho Chủ Nhà:
            </span>
            <button
              type="button"
              onClick={handleInstantLogin}
              className="w-full py-3 px-4 rounded-xl bg-bg-wood-deep text-brand-gold-light hover:bg-brand-gold hover:text-text-on-dark font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Zap className="w-4 h-4" />
              Vào Ngay Trang Quản Trị (1 Chạm)
            </button>
          </div>

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
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              label="Mật khẩu bảo mật"
              type="password"
              required
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

          <div className="pt-4 border-t border-border-default flex items-center justify-between text-xs font-bold text-text-secondary">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-brand-gold-dark font-extrabold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Chuyển về Giao diện Khách (User)
            </Link>
            <span className="inline-flex items-center gap-1 text-state-success font-extrabold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo mật
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
