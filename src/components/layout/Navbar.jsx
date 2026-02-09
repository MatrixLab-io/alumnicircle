import { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../theme';
import { Avatar, Badge } from '../common';
import { cn } from '../../utils/helpers';
import { USER_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout, isAdmin } = useAuth();

  const userNavigation = [
    { name: 'Dashboard', href: USER_ROUTES.DASHBOARD },
    { name: 'Directory', href: USER_ROUTES.DIRECTORY },
    { name: 'Events', href: USER_ROUTES.EVENTS },
    { name: 'My Events', href: USER_ROUTES.MY_EVENTS },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: ADMIN_ROUTES.DASHBOARD },
    { name: 'User Approvals', href: ADMIN_ROUTES.USER_APPROVALS },
    { name: 'Manage Events', href: ADMIN_ROUTES.MANAGE_EVENTS },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(PUBLIC_ROUTES.LOGIN);
  };

  const isActive = (href) => location.pathname === href;

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                    {APP_NAME}
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              {user && (
                <div className="hidden md:flex md:items-center md:gap-1">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive(item.href)
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {isAdmin && (
                    <>
                      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActive(item.href)
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Right side */}
              <div className="flex items-center gap-3">
                <ThemeToggle />

                {user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Avatar
                        src={userProfile?.photo}
                        name={userProfile?.name}
                        size="sm"
                      />
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {userProfile?.name?.split(' ')[0]}
                      </span>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userProfile?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {userProfile?.email}
                          </p>
                          {isAdmin && (
                            <Badge variant="purple" size="sm" className="mt-2">
                              {userProfile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </Badge>
                          )}
                        </div>

                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to={isAdmin ? ADMIN_ROUTES.DASHBOARD : USER_ROUTES.DASHBOARD}
                                className={cn(
                                  'flex items-center px-4 py-2 text-sm',
                                  active && 'bg-gray-100 dark:bg-gray-800',
                                  'text-gray-700 dark:text-gray-300'
                                )}
                              >
                                <HomeIcon className="mr-3 h-5 w-5" />
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to={USER_ROUTES.PROFILE}
                                className={cn(
                                  'flex items-center px-4 py-2 text-sm',
                                  active && 'bg-gray-100 dark:bg-gray-800',
                                  'text-gray-700 dark:text-gray-300'
                                )}
                              >
                                <UserCircleIcon className="mr-3 h-5 w-5" />
                                Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to={USER_ROUTES.EDIT_PROFILE}
                                className={cn(
                                  'flex items-center px-4 py-2 text-sm',
                                  active && 'bg-gray-100 dark:bg-gray-800',
                                  'text-gray-700 dark:text-gray-300'
                                )}
                              >
                                <Cog6ToothIcon className="mr-3 h-5 w-5" />
                                Settings
                              </Link>
                            )}
                          </Menu.Item>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={handleLogout}
                                className={cn(
                                  'flex w-full items-center px-4 py-2 text-sm',
                                  active && 'bg-gray-100 dark:bg-gray-800',
                                  'text-red-600 dark:text-red-400'
                                )}
                              >
                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to={PUBLIC_ROUTES.LOGIN}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Sign in
                    </Link>
                    <Link
                      to={PUBLIC_ROUTES.REGISTER}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] rounded-lg transition-all duration-300 cursor-pointer"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                {user && (
                  <Disclosure.Button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </Disclosure.Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {user && (
            <Disclosure.Panel className="md:hidden border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1 px-4 py-3">
                {userNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-base font-medium',
                      isActive(item.href)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
                {isAdmin && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                    <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                      Admin
                    </p>
                    {adminNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        to={item.href}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-base font-medium',
                          isActive(item.href)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </>
                )}
              </div>
            </Disclosure.Panel>
          )}
        </>
      )}
    </Disclosure>
  );
}
