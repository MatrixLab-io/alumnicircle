import { Toggle } from '../common';
import { VISIBILITY } from '../../config/constants';

export default function PrivacySettings({ values, onChange }) {
  const handleToggle = (field) => {
    const currentValue = values[field];
    const newValue = currentValue === VISIBILITY.PUBLIC ? VISIBILITY.PRIVATE : VISIBILITY.PUBLIC;
    onChange(field, newValue);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Control what information is visible to other members. Admins can always see all your information.
        </p>
      </div>

      <Toggle
        enabled={values.nameVisibility === VISIBILITY.PUBLIC}
        onChange={() => handleToggle('nameVisibility')}
        label="Show Name"
        description="Your name will be visible in the directory"
      />

      <Toggle
        enabled={values.emailVisibility === VISIBILITY.PUBLIC}
        onChange={() => handleToggle('emailVisibility')}
        label="Show Email"
        description="Your email will be visible to other members"
      />

      <Toggle
        enabled={values.phoneVisibility === VISIBILITY.PUBLIC}
        onChange={() => handleToggle('phoneVisibility')}
        label="Show Phone Number"
        description="Your phone number will be visible to other members"
      />
    </div>
  );
}
