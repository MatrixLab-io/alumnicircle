import { useEffect } from 'react';
import { Input, Select } from '../common';
import { PROFESSION_TYPES } from '../../config/constants';

const professionOptions = [
  { value: '', label: 'Select profession type' },
  { value: PROFESSION_TYPES.BUSINESS, label: 'Business Owner' },
  { value: PROFESSION_TYPES.SERVICE, label: 'Service/Job' },
  { value: PROFESSION_TYPES.OTHER, label: 'Other' },
];

export default function ProfessionFields({ register, watch, errors, setValue }) {
  const professionType = watch('profession.type');

  // Clear fields when profession type changes
  useEffect(() => {
    if (professionType === PROFESSION_TYPES.BUSINESS) {
      setValue('profession.designation', '');
      setValue('profession.companyName', '');
      setValue('profession.otherDetails', '');
    } else if (professionType === PROFESSION_TYPES.SERVICE) {
      setValue('profession.businessName', '');
      setValue('profession.otherDetails', '');
    } else if (professionType === PROFESSION_TYPES.OTHER) {
      setValue('profession.businessName', '');
      setValue('profession.designation', '');
      setValue('profession.companyName', '');
      setValue('profession.companyWebsite', '');
    }
  }, [professionType, setValue]);

  return (
    <div className="space-y-4">
      <Select
        label="Profession Type"
        options={professionOptions.slice(1)}
        placeholder="Select profession type"
        error={errors?.profession?.type?.message}
        {...register('profession.type')}
      />

      {professionType === PROFESSION_TYPES.BUSINESS && (
        <>
          <Input
            label="Business Name"
            placeholder="Enter your business name"
            error={errors?.profession?.businessName?.message}
            {...register('profession.businessName')}
          />
          <Input
            label="Business Website"
            placeholder="https://yourbusiness.com"
            helperText="Optional — business name will link to this"
            error={errors?.profession?.companyWebsite?.message}
            {...register('profession.companyWebsite')}
          />
        </>
      )}

      {professionType === PROFESSION_TYPES.SERVICE && (
        <>
          <Input
            label="Designation"
            placeholder="e.g., Software Engineer, Manager"
            error={errors?.profession?.designation?.message}
            {...register('profession.designation')}
          />
          <Input
            label="Company Name"
            placeholder="Enter company name"
            error={errors?.profession?.companyName?.message}
            {...register('profession.companyName')}
          />
          <Input
            label="Company Website"
            placeholder="https://company.com"
            helperText="Optional — company name will link to this"
            error={errors?.profession?.companyWebsite?.message}
            {...register('profession.companyWebsite')}
          />
        </>
      )}

      {professionType === PROFESSION_TYPES.OTHER && (
        <Input
          label="Profession Details"
          placeholder="Describe your profession"
          error={errors?.profession?.otherDetails?.message}
          {...register('profession.otherDetails')}
        />
      )}
    </div>
  );
}
