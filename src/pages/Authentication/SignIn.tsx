import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useSignInMutation } from '../../store/authSlice';
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
    <div className="rounded-sm border h-screen border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex">
      {/* Left side */}
      <div className="hidden xl:flex w-1/2 flex-col items-center justify-center p-10 text-center">
        {/* <Link to="/" className="mb-5 inline-block"> */}
          {/* <img className="hidden dark:block" src={Logo} alt="Logo" /> */}
          {/* <img className="dark:hidden" src={LogoDark} alt="Logo" /> */}

          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-wide drop-shadow-lg">
            KRZ ERP
          </h1>
        {/* </Link> */}
        <p className="2xl:px-20">
          Smart ERP solutions built for modern typing centers
        </p>
      </div>

      {/* Right side */}
      <div className="w-full xl:w-1/2 flex items-center justify-center p-10">
        <form className="w-full max-w-md" onSubmit={formik.handleSubmit}>
          <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
            Sign In
          </h2>

          {/* Email */}
          <div className="mb-4">
            <label className="mb-2 block font-medium text-black dark:text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="mb-2 block font-medium text-black dark:text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary py-3 text-white transition hover:bg-opacity-90"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary">
              Sign Up
            </Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default SignIn;
