import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Lock, User, Zap } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (!login(user, pass)) {
        setError('Usuário ou senha inválidos');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerenciador de formulários de leads</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card p-6 space-y-4">
          <div>
            <label className="admin-label">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="admin-input w-full pl-10"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="admin"
              />
            </div>
          </div>
          <div>
            <label className="admin-label">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="admin-input w-full pl-10"
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Credenciais padrão: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;
