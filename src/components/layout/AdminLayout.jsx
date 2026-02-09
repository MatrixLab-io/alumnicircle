import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import Navbar from './Navbar';
import Container from './Container';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/helpers';
import { ADMIN_ROUTES, USER_ROUTES } from '../../config/routes';

const sidebarNavigation = [
  { name: 'Dashboard', href: ADMIN_ROUTES.DASHBOARD, icon: HomeIcon },
  { name: 'User Approvals', href: ADMIN_ROUTES.USER_APPROVALS, icon: UserPlusIcon },
  { name: 'All Users', href: ADMIN_ROUTES.ALL_USERS, icon: UsersIcon },
  { name: 'Manage Events', href: ADMIN_ROUTES.MANAGE_EVENTS, icon: CalendarIcon },
  { name: 'Create Event', href: ADMIN_ROUTES.CREATE_EVENT, icon: PlusCircleIcon },
];

const superAdminNavigation = [
  { name: 'Manage Admins', href: ADMIN_ROUTES.MANAGE_ADMINS, icon: ShieldCheckIcon },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { isSuperAdmin } = useAuth();

  const isActive = (href) => location.pathname === href;

  const navigation = isSuperAdmin
    ? [...sidebarNavigation, ...superAdminNavigation]
    : sidebarNavigation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:top-16 lg:border-r lg:border-gray-200 dark:lg:border-gray-700 lg:bg-white/50 dark:lg:bg-gray-900/50 lg:backdrop-blur-sm">
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={USER_ROUTES.DASHBOARD}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Back to User View
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-8">
            <Container>
              {children || <Outlet />}
            </Container>
          </div>
        </main>
      </div>
    </div>
  );
}
