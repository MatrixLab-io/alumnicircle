import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { PhotoIcon, PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Input, Textarea, Select, Toggle, Spinner } from '../../components/common';
import { getEventById, updateEvent, uploadEventBanner } from '../../services/event.service';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME, EVENT_STATUS } from '../../config/constants';

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);
  const [eventStatus, setEventStatus] = useState(EVENT_STATUS.UPCOMING);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const event = await getEventById(id);
      if (!event) {
        toast.error('Event not found');
        navigate(ADMIN_ROUTES.MANAGE_EVENTS);
        return;
      }

      // Pre-fill form
      reset({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        participantLimit: event.participantLimit || '',
        registrationFee: event.registrationFee || '',
        bkashNumber: event.bkashNumber || '',
      });

      setIsPublic(event.isPublic !== false);
      setIsPaid(event.registrationFee > 0);
      setEventStatus(event.status || EVENT_STATUS.UPCOMING);
      if (event.banner) setBannerPreview(event.banner);
      if (event.contactPersons?.length > 0) {
        setContactPersons(event.contactPersons);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
      navigate(ADMIN_ROUTES.MANAGE_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const addContactPerson = () => {
    setContactPersons([...contactPersons, { name: '', phone: '' }]);
  };

  const removeContactPerson = (index) => {
    setContactPersons(contactPersons.filter((_, i) => i !== index));
  };

  const updateContactPerson = (index, field, value) => {
    setContactPersons(
      contactPersons.map((cp, i) => (i === index ? { ...cp, [field]: value } : cp))
    );
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
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
        status: eventStatus,
        contactPersons: contactPersons.filter((cp) => cp.name && cp.phone),
      };

      // Upload new banner if selected
      if (bannerFile) {
        const bannerUrl = await uploadEventBanner(id, bannerFile);
        eventData.banner = bannerUrl;
      }

      await updateEvent(id, eventData);
      toast.success('Event updated successfully');
      navigate(ADMIN_ROUTES.MANAGE_EVENTS);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner.Page message="Loading event..." />;
  }

  const statusOptions = [
    { value: EVENT_STATUS.UPCOMING, label: 'Upcoming' },
    { value: EVENT_STATUS.ONGOING, label: 'Ongoing' },
    { value: EVENT_STATUS.COMPLETED, label: 'Completed' },
    { value: EVENT_STATUS.CANCELLED, label: 'Cancelled' },
  ];

  return (
    <>
      <Helmet>
        <title>Edit Event | {APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Edit Event"
        description="Update event details"
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(ADMIN_ROUTES.MANAGE_EVENTS)}
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Events
          </Button>
        }
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

        {/* Event Status */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Status
          </h3>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEventStatus(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  eventStatus === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
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

        {/* Contact Persons */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Persons
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add contact persons for event inquiries
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addContactPerson}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {contactPersons.map((cp, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={cp.name}
                    onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="tel"
                    placeholder="Phone (01XXXXXXXXX)"
                    value={cp.phone}
                    onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {contactPersons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContactPerson(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
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
          <Button type="submit" isLoading={isSubmitting}>
            Update Event
          </Button>
        </div>
      </form>
    </>
  );
}
