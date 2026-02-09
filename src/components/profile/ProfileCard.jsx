import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { Card, Avatar, Badge, Button } from '../common';
import ProfileCompletion from './ProfileCompletion';
import { formatProfession, formatAddress } from '../../utils/formatters';
import { USER_ROUTES } from '../../config/routes';
import { VISIBILITY } from '../../config/constants';

export default function ProfileCard({ user, isOwnProfile = false, isAdmin = false }) {
  const showEmail = isOwnProfile || isAdmin || user.emailVisibility === VISIBILITY.PUBLIC;
  const showPhone = isOwnProfile || isAdmin || user.phoneVisibility === VISIBILITY.PUBLIC;

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 -mx-6 -mt-6 mb-16 relative">
        <div className="absolute -bottom-12 left-6">
          <Avatar
            src={user.photo}
            name={user.name}
            size="2xl"
            className="ring-4 ring-white dark:ring-gray-900 shadow-lg"
          />
        </div>
        {isOwnProfile && (
          <Link
            to={USER_ROUTES.EDIT_PROFILE}
            className="absolute top-4 right-4"
          >
            <Button size="sm" variant="glass" className="text-white">
              <PencilSquareIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* User Info */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h2>
          {user.profession && (
            <p className="text-gray-600 dark:text-gray-400">
              {formatProfession(user.profession)}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {user.bloodGroup && (
            <Badge variant="red">
              Blood: {user.bloodGroup}
            </Badge>
          )}
          <Badge variant="blue">Batch 2003</Badge>
          {user.role !== 'user' && (
            <Badge variant="purple">
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {showEmail && user.email && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <EnvelopeIcon className="h-5 w-5" />
              <a href={`mailto:${user.email}`} className="hover:text-primary-600">
                {user.email}
              </a>
            </div>
          )}

          {showPhone && user.phone && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <PhoneIcon className="h-5 w-5" />
              <a href={`tel:${user.phone}`} className="hover:text-primary-600">
                {user.phone}
              </a>
            </div>
          )}

          {user.address?.city && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <MapPinIcon className="h-5 w-5" />
              <span>{formatAddress(user.address)}</span>
            </div>
          )}

          {user.profession && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <BriefcaseIcon className="h-5 w-5" />
              <span>{formatProfession(user.profession)}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {user.socialLinks.facebook && (
              <a
                href={user.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {user.socialLinks.linkedin && (
              <a
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {user.socialLinks.twitter && (
              <a
                href={user.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {user.socialLinks.website && (
              <a
                href={user.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Profile Completion */}
        {isOwnProfile && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <ProfileCompletion percentage={user.profileCompletion || 0} />
          </div>
        )}
      </div>
    </Card>
  );
}
