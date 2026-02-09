import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Input, Textarea, Select, Toggle, Spinner } from '../../components/common';
import { createEvent, uploadEventBanner, updateEvent } from '../../services/event.service';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME } from '../../config/constants';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      participantLimit: '',
      registrationFee: '',
      bkashNumber: '',
    },
  });

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Create event first
      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        participantLimit: data.participantLimit ? parseInt(data.participantLimit) : null,
        registrationFee: isPaid ? parseFloat(data.registrationFee) : 0,
        bkashNumber: isPaid ? data.bkashNumber : null,
        isPublic,
        banner: null,
      };

      const result = await createEvent(eventData, userProfile.uid);

      // Upload banner if exists
      if (bannerFile) {
        const bannerUrl = await uploadEventBanner(result.id, bannerFile);
        await updateEvent(result.id, { banner: bannerUrl });
      }

      toast.success('Event created successfully');
      navigate(ADMIN_ROUTES.MANAGE_EVENTS);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Event | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Create Event"
        description="Create a new event for the community"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {/* Banner Upload */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Banner
          </h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden hover:border-primary-500 transition-colors"
          >
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                <PhotoIcon className="h-12 w-12 mb-2" />
                <p>Click to upload banner image</p>
                <p className="text-sm">Recommended: 1200x400px</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerSelect}
            className="hidden"
          />
        </Card>

        {/* Basic Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Details
          </h3>
          <div className="space-y-4">
            <Input
              label="Event Title"
              placeholder="Enter event title"
              error={errors.title?.message}
              required
              {...register('title', { required: 'Title is required' })}
            />

            <Textarea
              label="Description"
              placeholder="Describe the event..."
              rows={5}
              error={errors.description?.message}
              required
              {...register('description', { required: 'Description is required' })}
            />

            <Input
              label="Location"
              placeholder="Event venue or address"
              error={errors.location?.message}
              required
              {...register('location', { required: 'Location is required' })}
            />
          </div>
        </Card>

        {/* Date & Time */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Date & Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              error={errors.startDate?.message}
              required
              {...register('startDate', { required: 'Start date is required' })}
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              {...register('endDate')}
            />
          </div>
        </Card>

        {/* Participants & Payment */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Registration Settings
          </h3>
          <div className="space-y-4">
            <Input
              label="Participant Limit"
              type="number"
              placeholder="Leave empty for unlimited"
              min="1"
              {...register('participantLimit')}
            />

            <Toggle
              enabled={isPaid}
              onChange={setIsPaid}
              label="Paid Event"
              description="Require payment for registration"
            />

            {isPaid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Registration Fee (BDT)"
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  error={errors.registrationFee?.message}
                  required
                  {...register('registrationFee', {
                    required: isPaid ? 'Fee is required for paid events' : false,
                  })}
                />
                <Input
                  label="bKash Number"
                  placeholder="01XXXXXXXXX"
                  error={errors.bkashNumber?.message}
                  required
                  {...register('bkashNumber', {
                    required: isPaid ? 'bKash number is required' : false,
                  })}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Visibility */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Visibility
          </h3>
          <Toggle
            enabled={isPublic}
            onChange={setIsPublic}
            label="Public Event"
            description="Allow this event to be shared publicly"
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ADMIN_ROUTES.MANAGE_EVENTS)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Event
          </Button>
        </div>
      </form>
    </>
  );
}
