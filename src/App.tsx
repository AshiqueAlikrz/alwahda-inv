import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
// import Calendar from './pages/Calendar';
const Report = lazy(() => import('./pages/Report/index'));
const AllReports = lazy(() => import('./pages/Report/AllReports'));
const DailyReports = lazy(() => import('./pages/Report/DailyReports'));
const MontlyReports = lazy(() => import('./pages/Report/MontlyReports'));
import Chart from './pages/Chart';
import Dashboard from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';

import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import Billing from './pages/Billing';
// import { billingDataContext } from './contexts/DataContext';
import ReportDetail from './pages/invoiceDetail';
import InvoiceData from './pages/Invoice';
import Service from './pages/Service';

// interface BillingData {
//   name: string;
//   date: string;
//   items: {
//     id: number;
//     description: string;
//     rate: number;
//     quantity: number;
//     serviceCharge: number;
//     tax: number;
//     total: number;
//   }[];
//   sub_total: number; // matches "sub_total" from backend
//   grand_total: number; // matches "grand_total" from backend
//   discount: number;
//   paid: boolean; // added "paid" field from backend
// }

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  // const [invoice, setInvoice] = useState<any[]>([]);

  // const [billingData, setBillingData] = useState<BillingData>({
  //   name: '',
  //   date: '',
  //   items: [
  //     {
  //       id: 0,
  //       description: '',
  //       rate: 0,
  //       quantity: 0,
  //       total: 0,
  //       serviceCharge: 0,
  //       tax: 0,
  //     },
  //   ],
  //   sub_total: 0, // Updated to match backend
  //   grand_total: 0, // Updated to match backend
  //   discount: 0,
  //   paid: false, // Added "paid" field
  // });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
        <Route
          path="/billing"
          element={
            <>
              <PageTitle title="billing | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Billing />
            </>
          }
        />

        <Route
          path="/"
          element={
            <>
              <PageTitle title="AL WAHDA INVENTORY" />
              <Dashboard />
            </>
          }
        />
        <Route
          path="/invoice/:id"
          element={
            <>
              <PageTitle title="INVOICE" />
              <InvoiceData />
            </>
          }
        />
        <Route
          path="/report"
          element={
            <>
              <Suspense fallback={<h1>Loading</h1>}>
                <PageTitle title="Report | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Report />
              </Suspense>
            </>
          }
        />
        <Route
          path="/report/allreports"
          element={
            <>
              <Suspense fallback={<h1>Loading</h1>}>
                <PageTitle title="Report | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <AllReports />
              </Suspense>
            </>
          }
        />
        <Route
          path="/report/dailyreports"
          element={
            <>
              <Suspense fallback={<h1>Loading</h1>}>
                <PageTitle title="Report | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <DailyReports />
              </Suspense>
            </>
          }
        />
        <Route
          path="/report/montlyreports"
          element={
            <>
              <Suspense fallback={<h1>Loading</h1>}>
                <PageTitle title="Report | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <MontlyReports />
              </Suspense>
            </>
          }
        />
        <Route
          path="/report/:id"
          element={
            <>
              <Suspense fallback={<h1>Loading</h1>}>
                <PageTitle title="report Details" />
                <ReportDetail />
              </Suspense>
            </>
          }
        />
        <Route
          path="/Service"
          element={
            <>
              <Suspense fallback={<h1>Loading</h1>}>
                <PageTitle title="Service" />
                <Service />
              </Suspense>
            </>
          }
        />

        {/* lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll */}

        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Profile />
            </>
          }
        />
        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Tables />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Settings />
            </>
          }
        />
        <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Chart />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Alerts />
            </>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <Buttons />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
              <SignUp />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
