import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { Modal, Avatar, Badge, Button } from '../common';
import { formatProfession, formatAddress } from '../../utils/formatters';
import { VISIBILITY } from '../../config/constants';

export default function MemberModal({ member, isOpen, onClose, isAdmin = false }) {
  if (!member) return null;

  const showEmail = isAdmin || member.emailVisibility === VISIBILITY.PUBLIC;
  const showPhone = isAdmin || member.phoneVisibility === VISIBILITY.PUBLIC;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Profile" size="md">
      <Modal.Body>
        <div className="text-center mb-6">
          <Avatar
            src={member.photo}
            name={member.name}
            size="2xl"
            className="mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {member.name}
          </h2>
          {member.profession && (
            <p className="text-gray-600 dark:text-gray-400">
              {formatProfession(member.profession)}
            </p>
          )}

          <div className="flex justify-center gap-2 mt-3">
            {member.bloodGroup && (
              <Badge variant="red">{member.bloodGroup}</Badge>
            )}
            <Badge variant="blue">Adarsha School - Batch 2003</Badge>
          </div>
        </div>

        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {showEmail && member.email && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <EnvelopeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <a
                  href={`mailto:${member.email}`}
                  className="text-sm text-gray-900 dark:text-white hover:text-primary-600"
                >
                  {member.email}
                </a>
              </div>
            </div>
          )}

          {showPhone && member.phone && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <PhoneIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <a
                  href={`tel:${member.phone}`}
                  className="text-sm text-gray-900 dark:text-white hover:text-primary-600"
                >
                  {member.phone}
                </a>
              </div>
            </div>
          )}

          {member.address?.city && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatAddress(member.address)}
                </p>
              </div>
            </div>
          )}

          {member.profession && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <BriefcaseIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Profession</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatProfession(member.profession)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {member.socialLinks.facebook && (
              <a
                href={member.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {member.socialLinks.linkedin && (
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {member.socialLinks.twitter && (
              <a
                href={member.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {member.socialLinks.website && (
              <a
                href={member.socialLinks.website}
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
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
