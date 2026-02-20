import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Input, Select, PhoneInput } from '../../components/common';
import {
  PhotoUpload,
  ProfessionFields,
  SocialLinksForm,
  PrivacySettings,
  ProfileCompletion,
} from '../../components/profile';
import { updateUserProfile, uploadUserPhoto, deleteUserPhoto } from '../../services/user.service';
import { validationRules } from '../../utils/validators';
import { USER_ROUTES } from '../../config/routes';
import { APP_NAME, BLOOD_GROUPS, VISIBILITY } from '../../config/constants';

const bloodGroupOptions = BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }));

// Normalize legacy Bangladesh phone numbers (01XXXXXXXXX → +8801XXXXXXXXX)
const normalizePhone = (phone) => {
  if (!phone) return '';
  if (phone.startsWith('+')) return phone;
  if (/^01[3-9]\d{8}$/.test(phone)) return `+880${phone.substring(1)}`;
  return phone;
};

export default function EditProfile() {
  const navigate = useNavigate();
  const { userProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    nameVisibility: userProfile?.nameVisibility || VISIBILITY.PUBLIC,
    emailVisibility: userProfile?.emailVisibility || VISIBILITY.PUBLIC,
    phoneVisibility: userProfile?.phoneVisibility || VISIBILITY.PRIVATE,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userProfile?.name || '',
      phone: normalizePhone(userProfile?.phone || ''),
      bloodGroup: userProfile?.bloodGroup || '',
      profession: {
        type: userProfile?.profession?.type || '',
        businessName: userProfile?.profession?.businessName || '',
        designation: userProfile?.profession?.designation || '',
        companyName: userProfile?.profession?.companyName || '',
        otherDetails: userProfile?.profession?.otherDetails || '',
      },
      address: {
        street: userProfile?.address?.street || '',
        city: userProfile?.address?.city || '',
        postCode: userProfile?.address?.postCode || '',
        country: userProfile?.address?.country || 'Bangladesh',
      },
      socialLinks: {
        facebook: userProfile?.socialLinks?.facebook || '',
        linkedin: userProfile?.socialLinks?.linkedin || '',
        twitter: userProfile?.socialLinks?.twitter || '',
        website: userProfile?.socialLinks?.website || '',
      },
    },
  });

  const handlePhotoUpload = async (file) => {
    setIsUploading(true);
    try {
      await uploadUserPhoto(userProfile.uid, file);
      await refreshProfile();
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!userProfile?.photo) return;
    setIsUploading(true);
    try {
      await deleteUserPhoto(userProfile.uid);
      await refreshProfile();
      toast.success('Photo removed');
    } catch (error) {
      toast.error('Failed to remove photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Clean up profession data based on type
      const profession = data.profession.type
        ? {
            type: data.profession.type,
            businessName: data.profession.type === 'business' ? data.profession.businessName : null,
            designation: data.profession.type === 'service' ? data.profession.designation : null,
            companyName: data.profession.type === 'service' ? data.profession.companyName : null,
            otherDetails: data.profession.type === 'other' ? data.profession.otherDetails : null,
          }
        : null;

      // Clean up address
      const address = data.address.city
        ? {
            street: data.address.street || null,
            city: data.address.city,
            postCode: data.address.postCode || null,
            country: data.address.country || 'Bangladesh',
          }
        : null;

      // Clean up social links
      const socialLinks = Object.values(data.socialLinks).some(Boolean)
        ? {
            facebook: data.socialLinks.facebook || null,
            linkedin: data.socialLinks.linkedin || null,
            twitter: data.socialLinks.twitter || null,
            website: data.socialLinks.website || null,
          }
        : null;

      await updateUserProfile(userProfile.uid, {
        name: data.name,
        phone: data.phone,
        bloodGroup: data.bloodGroup || null,
        profession,
        address,
        socialLinks,
        ...privacySettings,
      });

      await refreshProfile();
      toast.success('Profile updated successfully');
      navigate(USER_ROUTES.PROFILE);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Profile | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Edit Profile"
        description="Update your profile information"
      />

      <div className="max-w-3xl">
        {/* Profile Completion */}
        <Card className="mb-6">
          <ProfileCompletion percentage={userProfile?.profileCompletion || 0} />
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile Photo
            </h3>
            <PhotoUpload
              currentPhoto={userProfile?.photo}
              name={userProfile?.name}
              onUpload={handlePhotoUpload}
              onRemove={handlePhotoRemove}
              isUploading={isUploading}
            />
          </Card>

          {/* Basic Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                error={errors.name?.message}
                required
                {...register('name', validationRules.name)}
              />
              <Controller
                name="phone"
                control={control}
                rules={validationRules.phone}
                render={({ field }) => (
                  <PhoneInput
                    label="Phone Number"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.phone?.message}
                    required
                    placeholder="Phone number"
                  />
                )}
              />
              <Input
                label="Email"
                type="email"
                value={userProfile?.email}
                disabled
                helperText="Email cannot be changed"
              />
              <Select
                label="Blood Group"
                options={bloodGroupOptions}
                placeholder="Select blood group"
                {...register('bloodGroup')}
              />
            </div>
          </Card>

          {/* Profession */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profession
            </h3>
            <ProfessionFields
              register={register}
              watch={watch}
              errors={errors}
              setValue={setValue}
            />
          </Card>

          {/* Address */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  placeholder="Enter street address"
                  {...register('address.street')}
                />
              </div>
              <Input
                label="City"
                placeholder="Enter city"
                {...register('address.city')}
              />
              <Input
                label="Post Code"
                placeholder="e.g. 1212"
                {...register('address.postCode')}
              />
              <Input
                label="Country"
                placeholder="Bangladesh"
                {...register('address.country')}
              />
            </div>
          </Card>

          {/* Social Links */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Social Links
            </h3>
            <SocialLinksForm register={register} errors={errors} />
          </Card>

          {/* Privacy Settings */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Privacy Settings
            </h3>
            <PrivacySettings
              values={privacySettings}
              onChange={handlePrivacyChange}
            />
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(USER_ROUTES.PROFILE)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
