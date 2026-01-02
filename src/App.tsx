import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';

const Report = lazy(() => import('./pages/Report'));
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
import ReportDetail from './pages/invoiceDetail';
import InvoiceData from './pages/Invoice';
import Service from './pages/Service';

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Loader />;

  const signUpURl = import.meta.env.VITE_SIGN_UP_URL;

  return (
    <Routes>
      {/* ================= AUTH ROUTES (NO LAYOUT) ================= */}
      <Route
        path="/auth/signin"
        element={
          <>
            <PageTitle title="Signin" />
            <SignIn />
          </>
        }
      />

      <Route
        path={`/auth/${signUpURl}`}
        element={
          <>
            <PageTitle title="Signup" />
            <SignUp />
          </>
        }
      />

      {/* ================= APP ROUTES (WITH LAYOUT) ================= */}
      <Route element={<DefaultLayout />}>
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
          path="/billing"
          element={
            <>
              <PageTitle title="Billing" />
              <Billing />
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
            <Suspense fallback={<h1>Loading...</h1>}>
              <PageTitle title="Report" />
              <Report />
            </Suspense>
          }
        />

        <Route
          path="/report/allreports"
          element={
            <Suspense fallback={<h1>Loading...</h1>}>
              <AllReports />
            </Suspense>
          }
        />

        <Route
          path="/report/dailyreports"
          element={
            <Suspense fallback={<h1>Loading...</h1>}>
              <DailyReports />
            </Suspense>
          }
        />

        <Route
          path="/report/montlyreports"
          element={
            <Suspense fallback={<h1>Loading...</h1>}>
              <MontlyReports />
            </Suspense>
          }
        />

        <Route
          path="/report/:id"
          element={
            <Suspense fallback={<h1>Loading...</h1>}>
              <PageTitle title="Report Details" />
              <ReportDetail />
            </Suspense>
          }
        />

        <Route
          path="/service"
          element={
            <Suspense fallback={<h1>Loading...</h1>}>
              <PageTitle title="Service" />
              <Service />
            </Suspense>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Profile" />
              <Profile />
            </>
          }
        />

        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements" />
              <FormElements />
            </>
          }
        />

        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout" />
              <FormLayout />
            </>
          }
        />

        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables" />
              <Tables />
            </>
          }
        />

        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings" />
              <Settings />
            </>
          }
        />

        <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Chart" />
              <Chart />
            </>
          }
        />

        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts" />
              <Alerts />
            </>
          }
        />

        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons" />
              <Buttons />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
