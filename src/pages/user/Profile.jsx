import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { ProfileCard } from '../../components/profile';
import { APP_NAME } from '../../config/constants';

export default function Profile() {
  const { userProfile, isAdmin } = useAuth();

  return (
    <>
      <Helmet>
        <title>My Profile | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="My Profile"
        description="View and manage your profile information"
      />

      <div className="max-w-2xl">
        <ProfileCard
          user={userProfile}
          isOwnProfile={true}
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
}
