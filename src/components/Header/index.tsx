import { Link, useLocation } from 'react-router-dom';
import DropdownMessage from './DropdownMessage';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import LogoIcon from '../../images/logo/logo-icon.svg';

const pageMeta = (pathname: string) => {
  if (pathname === '/')
    return { title: 'Dashboard', subtitle: 'Overview of your business' };
  if (pathname.startsWith('/billing'))
    return { title: 'Billing', subtitle: 'Create and print tax invoices' };
  if (pathname === '/quotations')
    return { title: 'Quotations', subtitle: 'Price quotes you have prepared' };
  if (pathname === '/quotations/new')
    return {
      title: 'New quotation',
      subtitle: 'Prepare a price quote for a client',
    };
  if (pathname.startsWith('/quotation/'))
    return { title: 'Quotation', subtitle: 'View, print or download' };
  if (pathname === '/report')
    return { title: 'Reports', subtitle: 'Choose a report to view' };
  if (pathname === '/report/allreports')
    return { title: 'All invoices', subtitle: 'Every invoice you have created' };
  if (pathname === '/report/dailyreports')
    return { title: 'Daily report', subtitle: 'Totals grouped by day' };
  if (pathname === '/report/montlyreports')
    return { title: 'Monthly report', subtitle: 'Totals grouped by month' };
  if (pathname.startsWith('/report/'))
    return {
      title: 'Invoice details',
      subtitle: 'Items and totals for this invoice',
    };
  if (pathname.startsWith('/service'))
    return { title: 'Services', subtitle: 'The services you bill for' };
  if (pathname.startsWith('/profile'))
    return { title: 'Profile', subtitle: 'Your account and company details' };
  return { title: '', subtitle: '' };
};

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { pathname } = useLocation();
  const { title, subtitle } = pageMeta(pathname);
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-999 flex w-full border-b border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-grow items-center justify-between gap-4 px-4 py-3 md:px-6 2xl:px-10">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-300'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && 'delay-400 !w-full'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!w-full delay-500'
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!h-0 !delay-[0]'
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && '!h-0 !delay-200'
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          <Link className="block flex-shrink-0 lg:hidden" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              AW
            </span>
          </Link>
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-black dark:text-white">
            {title}
          </h1>
          <p className="hidden text-sm text-body dark:text-bodydark sm:block">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <span className="hidden rounded-full border border-stroke bg-gray-2 px-3 py-1.5 text-xs font-medium text-body dark:border-strokedark dark:bg-meta-4 dark:text-bodydark md:block">
            {today}
          </span>

          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Notification Menu Area --> */}
            {/* <DropdownNotification /> */}
            {/* <!-- Notification Menu Area --> */}

            {/* <!-- Chat Notification Area --> */}
            {/* <DropdownMessage /> */}
            {/* <!-- Chat Notification Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
