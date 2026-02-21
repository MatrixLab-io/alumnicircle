import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/layout';
import { Card, Button, Input, Textarea, Select, Toggle, Spinner, DateTimePicker, PhoneInput } from '../../components/common';
import { createEvent, uploadEventBanner, updateEvent } from '../../services/event.service';
import { validationRules, isValidPhone } from '../../utils/validators';
import { ADMIN_ROUTES } from '../../config/routes';
import { APP_NAME, PAYMENT_METHODS, EVENT_STATUS } from '../../config/constants';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState([PAYMENT_METHODS.BKASH]);
  const [eventDate, setEventDate] = useState(null);
  const [registrationDeadline, setRegistrationDeadline] = useState(null);
  const [dateErrors, setDateErrors] = useState({ eventDate: '', registrationDeadline: '' });
  const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);
  const [contactErrors, setContactErrors] = useState([]);
  const [bkashNumbers, setBkashNumbers] = useState(['']);
  const [nagadNumbers, setNagadNumbers] = useState(['']);
  const submitModeRef = useRef('publish');
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
    getValues,
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
      if (cp.phone && !isValidPhone(cp.phone)) return 'Invalid phone number';
      if (cp.name && !cp.phone) return 'Phone is required';
      if (cp.phone && !cp.name) return 'Name is required';
      return '';
    });
    setContactErrors(errs);
    return errs.every((e) => !e);
  };

  const validateDates = () => {
    const errs = { eventDate: '', registrationDeadline: '' };
    if (!eventDate) {
      errs.eventDate = 'Event date is required';
    }
    if (registrationDeadline && eventDate && registrationDeadline > eventDate) {
      errs.registrationDeadline = 'Registration deadline must be on or before the event date';
    }
    setDateErrors(errs);
    return !errs.eventDate && !errs.registrationDeadline;
  };

  const toggleMethod = (method) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const addNumber = (setter) => setter((prev) => [...prev, '']);
  const removeNumber = (setter, index) => setter((prev) => prev.filter((_, i) => i !== index));
  const updateNumber = (setter, index, value) =>
    setter((prev) => prev.map((n, i) => (i === index ? value : n)));

  const saveDraft = async () => {
    const data = getValues();
    if (!data.title?.trim()) {
      toast.error('Event title is required to save as draft');
      return;
    }
    setIsLoading(true);
    submitModeRef.current = 'draft';
    try {
      const eventData = {
        title: data.title,
        description: data.description || '',
        location: {
          street: data.locationStreet || '',
          city: data.locationCity || '',
          postCode: data.locationPostCode || '',
          country: data.locationCountry || 'Bangladesh',
        },
        eventDate: eventDate || null,
        registrationDeadline: registrationDeadline || null,
        participantLimit: data.participantLimit ? parseInt(data.participantLimit) : null,
        registrationFee: isPaid ? (parseFloat(data.registrationFee) || 0) : 0,
        paymentMethods: isPaid ? [...selectedMethods] : [],
        paymentMethod: null,
        bkashNumbers: isPaid && selectedMethods.includes(PAYMENT_METHODS.BKASH)
          ? bkashNumbers.filter((n) => n.trim()) : [],
        nagadNumbers: isPaid && selectedMethods.includes(PAYMENT_METHODS.NAGAD)
          ? nagadNumbers.filter((n) => n.trim()) : [],
        isPublic,
        banner: null,
        contactPersons: contactPersons.filter((cp) => cp.name && cp.phone),
        status: EVENT_STATUS.DRAFT,
      };
      const result = await createEvent(eventData, {
        uid: userProfile.uid,
        name: userProfile.name,
        email: userProfile.email,
      });
      if (bannerFile) {
        const bannerUrl = await uploadEventBanner(result.id, bannerFile);
        await updateEvent(result.id, { banner: bannerUrl });
      }
      toast.success('Draft saved');
      navigate(ADMIN_ROUTES.MANAGE_EVENTS);
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
      submitModeRef.current = 'publish';
    }
  };

  const onSubmit = async (data) => {
    if (!validateDates()) return;
    if (!validateContactPersons()) return;
    if (isPaid && selectedMethods.length === 0) {
      toast.error('Select at least one payment method');
      return;
    }
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
        eventDate,
        registrationDeadline: registrationDeadline || null,
        participantLimit: data.participantLimit ? parseInt(data.participantLimit) : null,
        registrationFee: isPaid ? parseFloat(data.registrationFee) : 0,
        paymentMethods: isPaid ? [...selectedMethods] : [],
        paymentMethod: null,
        bkashNumbers: isPaid && selectedMethods.includes(PAYMENT_METHODS.BKASH)
          ? bkashNumbers.filter((n) => n.trim()) : [],
        nagadNumbers: isPaid && selectedMethods.includes(PAYMENT_METHODS.NAGAD)
          ? nagadNumbers.filter((n) => n.trim()) : [],
        isPublic,
        banner: null,
        contactPersons: contactPersons.filter((cp) => cp.name && cp.phone),
      };

      const result = await createEvent(eventData, { uid: userProfile.uid, name: userProfile.name, email: userProfile.email });

      // Upload banner if exists
      if (bannerFile) {
        const bannerUrl = await uploadEventBanner(result.id, bannerFile);
        await updateEvent(result.id, { banner: bannerUrl });
      }

      toast.success('Event created successfully');
      navigate(ADMIN_ROUTES.MANAGE_EVENTS);
    } catch (error) {
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
              label="Event Date & Time"
              value={eventDate}
              onChange={setEventDate}
              error={dateErrors.eventDate}
              required
              minDate="today"
            />
            <DateTimePicker
              label="Registration Deadline (Optional)"
              value={registrationDeadline}
              onChange={setRegistrationDeadline}
              error={dateErrors.registrationDeadline}
              maxDate={eventDate || undefined}
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
                    Payment Methods
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select one or more accepted payment methods</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: PAYMENT_METHODS.BKASH, label: 'bKash' },
                      { value: PAYMENT_METHODS.NAGAD, label: 'Nagad' },
                      { value: PAYMENT_METHODS.CASH, label: 'Cash' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleMethod(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          selectedMethods.includes(opt.value)
                            ? 'bg-primary-600 text-white'
                            : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {selectedMethods.includes(opt.value) ? '✓ ' : ''}{opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMethods.includes(PAYMENT_METHODS.BKASH) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        bKash Numbers <span className="text-red-500">*</span>
                      </label>
                      <button type="button" onClick={() => addNumber(setBkashNumbers)}
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                        + Add Number
                      </button>
                    </div>
                    <div className="space-y-2">
                      {bkashNumbers.map((num, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input type="tel" placeholder="01XXXXXXXXX" value={num}
                            onChange={(e) => updateNumber(setBkashNumbers, idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {bkashNumbers.length > 1 && (
                            <button type="button" onClick={() => removeNumber(setBkashNumbers, idx)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMethods.includes(PAYMENT_METHODS.NAGAD) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nagad Numbers <span className="text-red-500">*</span>
                      </label>
                      <button type="button" onClick={() => addNumber(setNagadNumbers)}
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                        + Add Number
                      </button>
                    </div>
                    <div className="space-y-2">
                      {nagadNumbers.map((num, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input type="tel" placeholder="01XXXXXXXXX" value={num}
                            onChange={(e) => updateNumber(setNagadNumbers, idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {nagadNumbers.length > 1 && (
                            <button type="button" onClick={() => removeNumber(setNagadNumbers, idx)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMethods.includes(PAYMENT_METHODS.CASH) && (
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
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
                    <PhoneInput
                      value={cp.phone}
                      onChange={(value) => updateContactPerson(index, 'phone', value || '')}
                      defaultCountry="BD"
                      placeholder="Phone number"
                      error={contactErrors[index]}
                    />
                  </div>
                  {contactPersons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContactPerson(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
          <Button
            type="button"
            variant="outline"
            onClick={saveDraft}
            isLoading={isLoading && submitModeRef.current === 'draft'}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            isLoading={isLoading && submitModeRef.current === 'publish'}
          >
            Publish Event
          </Button>
        </div>
      </form>
    </>
  );
}
