import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Input, Textarea, Select, Toggle, Spinner, DateTimePicker } from '../../components/common';
import { createEvent, uploadEventBanner, updateEvent } from '../../services/event.service';
import { validationRules, isValidPhone } from '../../utils/validators';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME, PAYMENT_METHODS } from '../../config/constants';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.BKASH);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '' });
  const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);
  const [contactErrors, setContactErrors] = useState([]);
  const fileInputRef = useRef(null);

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      locationStreet: '',
      locationCity: '',
      locationPostCode: '',
      locationCountry: 'Bangladesh',
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

  const validateContactPersons = () => {
    const errs = contactPersons.map((cp) => {
      if (cp.phone && !isValidPhone(cp.phone)) return 'Invalid BD phone number';
      if (cp.name && !cp.phone) return 'Phone is required';
      if (cp.phone && !cp.name) return 'Name is required';
      return '';
    });
    setContactErrors(errs);
    return errs.every((e) => !e);
  };

  const validateDates = () => {
    const errs = { startDate: '', endDate: '' };
    if (!startDate) {
      errs.startDate = 'Start date is required';
    }
    if (endDate && startDate && endDate <= startDate) {
      errs.endDate = 'End date must be after start date';
    }
    setDateErrors(errs);
    return !errs.startDate && !errs.endDate;
  };

  const onSubmit = async (data) => {
    if (!validateDates()) return;
    if (!validateContactPersons()) return;
    setIsLoading(true);
    try {
      // Create event first
      const eventData = {
        title: data.title,
        description: data.description,
        location: {
          street: data.locationStreet || '',
          city: data.locationCity,
          postCode: data.locationPostCode || '',
          country: data.locationCountry || 'Bangladesh',
        },
        startDate,
        endDate: endDate || null,
        participantLimit: data.participantLimit ? parseInt(data.participantLimit) : null,
        registrationFee: isPaid ? parseFloat(data.registrationFee) : 0,
        paymentMethod: isPaid ? paymentMethod : null,
        bkashNumber: isPaid && paymentMethod === PAYMENT_METHODS.BKASH ? data.bkashNumber : null,
        isPublic,
        banner: null,
        contactPersons: contactPersons.filter((cp) => cp.name && cp.phone),
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
              label="Street Address / Venue"
              placeholder="e.g. Convention Center, Road 5, Gulshan"
              error={errors.locationStreet?.message}
              required
              {...register('locationStreet', { required: 'Street address is required' })}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="e.g. Dhaka"
                error={errors.locationCity?.message}
                required
                {...register('locationCity', { required: 'City is required' })}
              />
              <Input
                label="Post Code"
                placeholder="e.g. 1212"
                {...register('locationPostCode')}
              />
              <Input
                label="Country"
                placeholder="Bangladesh"
                {...register('locationCountry')}
              />
            </div>
          </div>
        </Card>

        {/* Date & Time */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Date & Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateTimePicker
              label="Start Date & Time"
              value={startDate}
              onChange={setStartDate}
              error={dateErrors.startDate}
              required
              minDate="today"
            />
            <DateTimePicker
              label="End Date & Time"
              value={endDate}
              onChange={setEndDate}
              error={dateErrors.endDate}
              minDate={startDate}
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
              <div className="space-y-4 pt-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: PAYMENT_METHODS.BKASH, label: 'bKash' },
                      { value: PAYMENT_METHODS.CASH, label: 'By Cash' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          paymentMethod === opt.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === PAYMENT_METHODS.BKASH && (
                  <Input
                    label="bKash Number"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    error={errors.bkashNumber?.message}
                    required
                    {...register('bkashNumber', {
                      required: isPaid && paymentMethod === PAYMENT_METHODS.BKASH ? 'bKash number is required' : false,
                      validate: (value) => !isPaid || paymentMethod !== PAYMENT_METHODS.BKASH || !value || isValidPhone(value) || 'Enter a valid BD phone number (01[3-9]XXXXXXXX)',
                    })}
                  />
                )}

                {paymentMethod === PAYMENT_METHODS.CASH && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Participants will pay in cash at the event venue. Admin approval will still be required.
                    </p>
                  </div>
                )}
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
              <div key={index}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name"
                      value={cp.name}
                      onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${contactErrors[index] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      placeholder="Phone (01XXXXXXXXX)"
                      value={cp.phone}
                      onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${contactErrors[index] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
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
                {contactErrors[index] && (
                  <p className="mt-1 text-xs text-red-500">{contactErrors[index]}</p>
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
          <Button type="submit" isLoading={isLoading}>
            Create Event
          </Button>
        </div>
      </form>
    </>
  );
}
