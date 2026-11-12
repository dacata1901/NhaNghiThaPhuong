import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('huynhduykhanh0406@gmail.com');
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

  const handleQuickFillDemo = () => {
    setEmail('huynhduykhanh0406@gmail.com');
    setPassword('ThaPhuong@2026');
    setError(null);
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
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-classic bg-brand-gold/20 border border-brand-gold text-brand-gold-light flex items-center justify-center mx-auto mb-3 font-serif text-lg font-bold tracking-widest">
            TP
          </div>
          <span className="text-xs uppercase tracking-[0.24em] text-brand-gold-light block">
            INTERNAL MANAGEMENT PORTAL
          </span>
          <h1 className="font-serif text-3xl font-bold text-text-on-dark mt-1">
            Quản Trị Nhà Nghỉ Tha Phương
          </h1>
          <p className="text-xs text-text-on-dark/70 mt-2">
            Hệ thống bảo mật nội bộ – Không cho phép tự đăng ký tài khoản công khai
          </p>
        </div>

        <div className="bg-bg-ivory-white border border-border-strong rounded-classic p-6 sm:p-8 shadow-luxury-lg text-text-primary">
          {error && (
            <div className="mb-5 p-3.5 rounded-classic bg-state-danger/10 border border-state-danger/30 text-state-danger text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email Quản trị viên"
              type="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="huynhduykhanh0406@gmail.com"
            />

            <InputField
              label="Mật khẩu bảo mật"
              type="password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu quản trị..."
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Đăng nhập hệ thống quản trị
            </Button>
          </form>

          {/* Quick-fill helper for owner testing */}
          <div className="mt-6 pt-5 border-t border-border-default">
            <div className="p-3.5 rounded-classic bg-bg-cream/70 border border-border-default text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-brand-gold-dark" />
                  Tài khoản Chủ nhà mặc định:
                </span>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="px-2.5 py-1 rounded-classic bg-brand-gold text-text-on-dark font-medium hover:bg-brand-gold-dark transition-colors"
                >
                  Điền nhanh mật khẩu
                </button>
              </div>
              <p className="text-text-secondary">
                Email: <code className="text-text-primary font-semibold">huynhduykhanh0406@gmail.com</code>
                <br />
                Mật khẩu: <code className="text-text-primary font-semibold">ThaPhuong@2026</code>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-text-secondary">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-brand-gold-dark font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay về trang chủ khách hàng
            </Link>
            <span className="inline-flex items-center gap-1 text-state-success">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo mật RLS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
