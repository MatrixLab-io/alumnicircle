import { Link } from 'react-router-dom';
import { APP_NAME } from '../../config/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and copyright */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} {APP_NAME}. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/events"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Events
            </Link>
            <Link
              to="/directory"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Directory
            </Link>
          </div>
        </div>

        {/* Batch info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Proudly connecting Adarsha School Batch 2003 alumni
          </p>
        </div>

        {/* Developer credit */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Developed by MatrixLab
          </p>
        </div>
      </div>
    </footer>
  );
}
