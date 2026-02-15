import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UsersIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../../components/layout';
import { Card, Button, Badge, Spinner } from '../../components/common';
import { ThemeToggle } from '../../components/theme';
import { getPublicEvents } from '../../services/event.service';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { formatEventLocation } from '../../utils/formatters';
import { PUBLIC_ROUTES, USER_ROUTES, ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function Landing() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const publicEvents = await getPublicEvents();
        setEvents(publicEvents.slice(0, 6)); // Show only first 6
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      {user ? (
        <Navbar />
      ) : (
        <header className="py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)]">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="font-bold text-2xl text-gray-900 dark:text-white">
                {APP_NAME}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Link
                to={PUBLIC_ROUTES.LOGIN}
                className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Sign In
              </Link>
              <Link
                to={PUBLIC_ROUTES.REGISTER}
                className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] text-white font-medium rounded-lg transition-all duration-300 cursor-pointer text-sm sm:text-base"
              >
                Join Now
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="blue" className="mb-6">
            Adarsha School - Batch 2003
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Reconnect with Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
              Classmates
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our exclusive alumni network to stay connected, discover what your classmates are up to, and never miss a reunion event.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <>
                <Link to={isAdmin ? ADMIN_ROUTES.DASHBOARD : USER_ROUTES.DASHBOARD}>
                  <Button size="lg" className="px-8">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to={USER_ROUTES.DIRECTORY}>
                  <Button size="lg" variant="outline" className="px-8">
                    Browse Directory
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to={PUBLIC_ROUTES.REGISTER}>
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </Link>
                <Link to={PUBLIC_ROUTES.LOGIN}>
                  <Button size="lg" variant="outline" className="px-8">
                    I Have an Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <UsersIcon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Alumni Directory
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Find and connect with your batch mates. Search by name, profession, or location.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CalendarIcon className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Events & Reunions
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Stay updated with upcoming events, reunions, and gatherings organized by the community.
              </p>
            </Card>

            <Card className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <ShieldCheckIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Privacy First
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Control your visibility. Choose what information you want to share with others.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join our exciting events and reconnect with your classmates
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming events at the moment. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} hover className="overflow-hidden">
                  {event.banner && (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-full h-40 object-cover -mt-6 -mx-6 mb-4"
                      style={{ width: 'calc(100% + 3rem)' }}
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      {formatEventLocation(event.location)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={event.registrationFee > 0 ? 'yellow' : 'green'}>
                      {event.registrationFee > 0
                        ? formatCurrency(event.registrationFee)
                        : 'Free'}
                    </Badge>
                    <Link
                      to={`/event/${event.id}/public`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center bg-gradient-to-r from-primary-600 to-primary-700 border-0">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Reconnect?
              </h2>
              <p className="text-primary-100 mb-8 max-w-xl mx-auto">
                Join hundreds of Adarsha School Batch 2003 alumni who are already connected. Registration is free and takes less than a minute.
              </p>
              <Link to={PUBLIC_ROUTES.REGISTER}>
                <Button variant="glass" size="lg" className="text-white border-white/30">
                  Create Your Account
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} {APP_NAME}. Adarsha School Batch 2003.
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
            Developed by <a href="https://matrixlab.it.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">MatrixLab</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
