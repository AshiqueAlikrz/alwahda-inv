import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useSignInMutation } from '../../store/slice/authSlice';
import LogoDark from '../../images/logo/logo-dark.svg';
import Logo from '../../images/logo/logo.svg';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/state/userState';

const SignIn: React.FC = () => {
  const [signIn, { isLoading }] = useSignInMutation();

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await signIn(values).unwrap();
        console.log('Signin successful:', response);
        if (response?.status) {
          navigate('/');
          localStorage.setItem('token', response?.token);
          localStorage.setItem('user', JSON.stringify(response?.user));
        }
        toast.success('User logged in successfully');
        resetForm();
      } catch (err: any) {
        console.error('Signin failed:', err?.data?.message || err);
        toast.error(err?.data?.message || 'Error signing in');
      }
    },
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center">
      {/* --- Animated Background Decorative Elements --- */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="container relative z-10 flex h-[90vh] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
        {/* Left Side: Branding & Info */}
        <div className="hidden w-1/2 flex-col justify-between p-12 xl:flex bg-gradient-to-br from-blue-600/10 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                KRZ <span className="text-blue-500">ERP</span>
              </span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-white">
              The Next Gen <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Typing Center
              </span>{' '}
              <br />
              Management.
            </h1>
            <p className="mt-6 max-w-md text-lg text-slate-400 leading-relaxed">
              Streamline your workflow, manage documents, and scale your
              business with our ultra-fast smart solutions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            System Status: Operational
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex w-full flex-col justify-center p-8 md:p-16 xl:w-1/2 bg-white/5">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-slate-400">
                Please enter your details to sign in.
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-xs text-red-400">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-xs text-red-400">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
              </button>
            </form>

            <footer className="mt-8 text-center text-sm text-slate-500">
              © {new Date().getFullYear()} KRZ Solutions. All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
