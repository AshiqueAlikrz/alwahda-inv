import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSignupMutation } from '../../store/slice/authSlice';
import { toast } from 'react-toastify';
import { Button, ConfigProvider, Divider, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useGetAllCompaniesQuery } from '../../store/slice/companySlice';
import AddCompanyModal from '../../components/AddCompanyModal';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white py-3 px-4 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelClass = 'mb-2 block text-sm font-medium text-slate-700';
const errorClass = 'mt-2 text-xs text-red-500';

// Matches the inputs' look on antd's Select and the Add Company modal
const lightTheme = {
  token: {
    colorPrimary: '#2563eb',
    colorBorder: '#cbd5e1',
    borderRadius: 12,
    controlHeight: 46,
  },
};

const SignUp: React.FC = () => {
  const { Option } = Select;

  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();
  const { data } = useGetAllCompaniesQuery();
  const [selectedCompany, setSelectedCompany] = useState({
    companyName: '',
    _id: '',
  });
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await signup({
          name: values.name,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          companyId: selectedCompany._id,
        }).unwrap();
        toast.success(response?.message || 'User created successfully');
        resetForm();
        navigate('/auth/signin');
      } catch (err: any) {
        console.error('Signup failed:', err?.data?.message || err);
        toast.error(err?.data?.message || 'Error in creating user');
      }
    },
  });

  const onChange = (option?: { value: string; label: React.ReactNode }) => {
    setSelectedCompany(
      option
        ? { companyName: String(option.label), _id: option.value }
        : { companyName: '', _id: '' },
    );
  };

  return (
    <ConfigProvider theme={lightTheme}>
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 py-8">
        {/* --- Animated Background Decorative Elements --- */}
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-300/30 blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-300/30 blur-[120px] animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>

        <div className="container relative z-10 flex min-h-[90vh] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {/* Left Side: Branding & Info */}
          <div className="hidden w-1/2 flex-col justify-between border-r border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-12 xl:flex">
            <div>
              <div className="mb-8 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/40">
                  <span className="text-xl font-bold text-white">K</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  KRZ <span className="text-blue-600">ERP</span>
                </span>
              </div>

              <h1 className="text-5xl font-extrabold leading-tight text-slate-900">
                Set up your <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Super Admin
                </span>{' '}
                <br />
                account.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
                Smart ERP solutions built for modern typing centers. Create
                your admin account and link it to a company to get started.
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              System Status: Operational
            </div>
          </div>

          {/* Right Side: Sign Up Form */}
          <div className="flex w-full flex-col justify-center bg-white p-8 md:p-12 xl:w-1/2">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Create Account
                </h2>
                <p className="mt-2 text-slate-600">
                  Sign up as Super Admin to get started.
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    placeholder="Enter your full name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={inputClass}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className={errorClass}>{formik.errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="name@company.com"
                    className={inputClass}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className={errorClass}>{formik.errors.email}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className={labelClass}>Select Company</label>
                  <Select
                    labelInValue
                    placeholder="Select Company"
                    style={{ width: '100%' }}
                    value={
                      selectedCompany._id
                        ? {
                            value: selectedCompany._id,
                            label: selectedCompany.companyName,
                          }
                        : undefined
                    }
                    onChange={onChange}
                    allowClear
                    open={companyDropdownOpen}
                    onDropdownVisibleChange={setCompanyDropdownOpen}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Button
                          type="text"
                          block
                          icon={<PlusOutlined />}
                          style={{ textAlign: 'left' }}
                          onClick={() => {
                            setCompanyDropdownOpen(false);
                            setAddCompanyOpen(true);
                          }}
                        >
                          Add Company
                        </Button>
                      </>
                    )}
                  >
                    {data?.data?.map((company: any) => (
                      <Option key={company._id} value={company._id}>
                        {company.companyName}
                      </Option>
                    ))}
                  </Select>
                  <AddCompanyModal
                    open={addCompanyOpen}
                    onClose={() => setAddCompanyOpen(false)}
                    onSaved={(company) =>
                      setSelectedCompany({
                        companyName: company.companyName,
                        _id: company._id,
                      })
                    }
                  />
                </div>

                {/* Password */}
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className={errorClass}>{formik.errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClass}>Re-type Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <p className={errorClass}>
                        {formik.errors.confirmPassword}
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
                      'Sign Up'
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/auth/signin"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>

              <footer className="mt-6 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} KRZ Solutions. All rights
                reserved.
              </footer>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SignUp;
