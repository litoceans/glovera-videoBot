'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/app/context/AdminContext';
import { FiMenu, FiX } from 'react-icons/fi';
import { MdDashboard, MdPeople, MdSchool, MdChat, MdLogout } from 'react-icons/md';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { admin, logout } = useAdmin();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <MdDashboard className="w-6 h-6" /> },
    { name: 'Students', path: '/admin/students', icon: <MdPeople className="w-6 h-6" /> },
    { name: 'Programs', path: '/admin/programs', icon: <MdSchool className="w-6 h-6" /> },
    { name: 'Sessions', path: '/admin/sessions', icon: <MdChat className="w-6 h-6" /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    logout();
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md md:hidden bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg text-gray-800 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40`}
      >
        {/* Admin Profile */}
        <div className="p-6 bg-blue-600">
          <h2 className="text-xl font-semibold text-white truncate">{admin?.name || 'Admin'}</h2>
          <p className="text-sm text-blue-100 truncate">{admin?.email || 'admin@example.com'}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={handleMenuClick}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : ''
                  }`}
                >
                  <span className={`${pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              </li>
            ))}

            {/* Logout Button */}
            <li className="px-3 mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <MdLogout className="w-6 h-6 text-gray-500" />
                <span className="ml-3 font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
