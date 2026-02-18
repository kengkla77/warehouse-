
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      } else {
        if (username === 'admin') {
           router.push('/dashboard');
        } 

        else {
           router.push('/'); 
        }
        
        router.refresh();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดของระบบ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-rose-200 rotate-3 hover:rotate-6 transition-all duration-300">
             <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Warehouse Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 text-center flex items-center justify-center gap-2 animate-pulse">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-0 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              placeholder="เช่น admin หรือ store"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-0 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                กำลังตรวจสอบ...
              </span>
            ) : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
               ติดปัญหากรุณาติดต่อแผนก IT <br/> หรือโทร 1234 (ภายใน)
            </p>
        </div>
      </div>
    </div>
  );
}