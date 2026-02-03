import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LogoDark from '../../images/logo/logo-dark.svg';
import Logo from '../../images/logo/logo.svg';
import { useSignupMutation } from '../../store/slice/authSlice';
import { toast } from 'react-toastify';
import { Select } from 'antd';
import { useGetAllCompaniesQuery } from '../../store/slice/companySlice';
// import { useGetAllCompaniesQuery } from '../../store/companySlice';

const SignUp: React.FC = () => {
  const { Option } = Select;

  const [signup, { isLoading }] = useSignupMutation();
  const { data, error } = useGetAllCompaniesQuery();
  const [selectedCompany, setSelectedCompany] = useState({
    companyName: '',
    _id: '',
  });

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
      } catch (err: any) {
        console.error('Signup failed:', err?.data?.message || err);
        toast.error('Error in creating user');
      }
    },
  });

  const onChange = (value: string, option: any) => {
    setSelectedCompany({ companyName: option.children, _id: option.value });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        {/* Left side */}
        <div className="hidden w-full xl:block xl:w-1/2 text-center py-17.5 px-26">
          {/* <Link className="mb-5.5 inline-block" to="/">
            <img className="hidden dark:block" src={Logo} alt="Logo" />
            <img className="dark:hidden" src={LogoDark} alt="Logo" />
          </Link> */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-wide drop-shadow-lg">
            KRZ ERP
          </h1>
          <p className="2xl:px-20">
            Smart ERP solutions built for modern typing centers
          </p>
        </div>

        {/* Right side (Form) */}
        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign Up - Super Admin
            </h2>

            <form onSubmit={formik.handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  placeholder="Enter your full name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Select Company
                </label>
                <Select
                  className="h-12"
                  placeholder="Select Company"
                  style={{ width: '100%' }}
                  value={selectedCompany.companyName}
                  onChange={onChange}
                  allowClear
                >
                  {data?.data?.map((company: any) => (
                    <Option key={company._id} value={company._id}>
                      {company.companyName}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Re-type Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-primary py-4 text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
