import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-[380px] glass-card p-12"
      >
        <div className="font-display text-[22px] font-bold tracking-[-0.02em] mb-1.5">
          BEEZZY<span className="accent-text">GROUP</span>
        </div>
        <div className="text-xs text-muted-foreground mb-9">Gestão Financeira do Grupo</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] block mb-1.5">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="beezzygroup"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-[0.08em] block mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-secondary border border-input rounded-[6px] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-[11px] accent-gradient rounded-[6px] font-display text-sm font-semibold text-black hover:opacity-90 active:scale-[0.99] transition-all mt-1"
          >
            Entrar
          </button>
        </form>
      </motion.div>
    </div>
  );
}
