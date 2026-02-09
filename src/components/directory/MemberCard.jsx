import { EnvelopeIcon, PhoneIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Card, Avatar, Badge } from '../common';
import { formatProfession } from '../../utils/formatters';
import { VISIBILITY } from '../../config/constants';

export default function MemberCard({ member, onClick, isAdmin = false }) {
  const showEmail = isAdmin || member.emailVisibility === VISIBILITY.PUBLIC;
  const showPhone = isAdmin || member.phoneVisibility === VISIBILITY.PUBLIC;

  return (
    <Card
      hover
      className="cursor-pointer"
      onClick={() => onClick(member)}
    >
      <div className="flex items-start gap-4">
        <Avatar
          src={member.photo}
          name={member.name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {member.name}
            </h3>
            {member.bloodGroup && (
              <Badge variant="red" size="sm">
                {member.bloodGroup}
              </Badge>
            )}
          </div>

          {member.profession && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
              <BriefcaseIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatProfession(member.profession)}</span>
            </p>
          )}

          <div className="space-y-1">
            {showEmail && member.email && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </p>
            )}
            {showPhone && member.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                <span>{member.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
