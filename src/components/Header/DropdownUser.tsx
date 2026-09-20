import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import {
  IoChevronDown,
  IoLogOutOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import useLocalStorage from '../../hooks/useLocalStorage';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = useLocalStorage('user', null)[0];

  const navigate = useNavigate();

  const initials = (user?.name || '?')
    .split(' ')
    .map((word: string) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/signin');
    window.location.reload();
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 duration-200 hover:bg-gray-2 dark:hover:bg-meta-4"
        to="#"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {initials}
        </span>

        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-semibold text-black dark:text-white">
            {user?.name}
          </span>
          <span className="block text-xs">{user?.company?.companyName}</span>
        </span>

        <IoChevronDown
          size={14}
          className={`hidden duration-200 lg:block ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </Link>

      {/* <!-- Dropdown Start --> */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-3 flex w-56 flex-col rounded-xl border border-stroke bg-white p-1.5 shadow-lg dark:border-strokedark dark:bg-boxdark">
          <Link
            to="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium duration-200 hover:bg-gray-2 hover:text-primary dark:hover:bg-meta-4"
          >
            <IoPersonOutline size={18} />
            Profile
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium duration-200 hover:bg-danger/10 hover:text-danger"
          >
            <IoLogOutOutline size={18} />
            Sign out
          </button>
        </div>
      )}
      {/* <!-- Dropdown End --> */}
    </ClickOutside>
  );
};

export default DropdownUser;
