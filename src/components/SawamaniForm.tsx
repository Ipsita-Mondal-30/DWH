'use client';

import React, { useState, useMemo } from 'react';
import { Heart, Phone, Mail, MapPin, Send, User, Package, Calendar, MessageSquare, CheckCircle, AlertCircle, Loader2, ShoppingBag, X, ArrowLeft, Scale, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";

// Type definitions
interface PackingOption {
  id: string;
  label: string;
  value: string;
  weightPerBox: number; // in kg
  isWeightBased: boolean; // true for gram/kg options, false for piece options
}

interface PackingSelection {
  [key: string]: {
    boxCount: number;
    totalWeight: number;
  };
}

interface SawamaniFormData {
  name: string;
  phoneNumber: string;
  address: string;
  itemType: string;
  itemVariant: string;
  date: string;
  packingSelections: PackingSelection;
  message: string;
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  address?: string;
  itemType?: string;
  itemVariant?: string;
  date?: string;
  packingSelections?: string;
  message?: string;
}

interface TouchedFields {
  name?: boolean;
  phoneNumber?: boolean;
  address?: boolean;
  itemType?: boolean;
  itemVariant?: boolean;
  date?: boolean;
  packingSelections?: boolean;
  message?: boolean;
}

interface SawamaniFormProps {
  preSelectedProduct?: {
    type: string;
    variant: string;
    price: number;
    label?: string;
  };
  onOrderSuccess?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

type SubmitStatus = 'success' | 'validation_error' | 'server_error' | 'network_error' | null;
type FieldName = keyof SawamaniFormData;

// Product configuration
const ITEM_CONFIG = {
  laddoo: {
    label: 'Laddoo',
    variants: [
      { value: 'moti boondi', label: 'Moti Boondi Laddoo' },
      { value: 'barik boondi', label: 'Barik Boondi Laddoo' },
      { value: 'motichoor', label: 'Motichoor Laddoo' },
      { value: 'moong', label: 'Moong Ladoo' },
      { value: 'besan', label: 'Besan Ladoo' }
    ]
  },
  barfi: {
    label: 'Barfi',
    variants: [
      { value: 'besan', label: 'Besan Barfi' },
      { value: 'moong', label: 'Moong Dal Barfi' },
      { value: 'mawa', label: 'Mawa Barfi' },
      { value: 'dilkhushal', label: 'Dilkhushal Barfi' }
    ]
  },
  other: {
    label: 'Other',
    variants: [
      { value: 'churma', label: 'Churma' }
    ]
  }
};

const PACKING_OPTIONS: PackingOption[] = [
  { id: '2piece', label: '2 Pieces', value: '2 piece', weightPerBox: 0.1, isWeightBased: false },
  { id: '4piece', label: '4 Pieces', value: '4 piece', weightPerBox: 0.2, isWeightBased: false },
  { id: '500gram', label: '500g', value: '500 gram', weightPerBox: 0.5, isWeightBased: true },
  { id: '1kg', label: '1 Kg', value: '1kg', weightPerBox: 1, isWeightBased: true },
  { id: '5kg', label: '5 Kg', value: '5kg', weightPerBox: 5, isWeightBased: true }
];

const MAX_TOTAL_WEIGHT = 50; // kg

export const SawamaniForm: React.FC<SawamaniFormProps> = ({ 
  preSelectedProduct, 
  onOrderSuccess, 
  isModal = false,
  onClose 
}) => {
  const [formData, setFormData] = useState<SawamaniFormData>({
    name: '',
    phoneNumber: '',
    address: '',
    itemType: preSelectedProduct?.type || '',
    itemVariant: preSelectedProduct?.variant || '',
    date: '',
    packingSelections: {},
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [touched, setTouched] = useState<TouchedFields>({});

  // Calculate total weight
  const totalWeight = useMemo(() => {
    return Object.values(formData.packingSelections).reduce((total, selection) => {
      return total + selection.totalWeight;
    }, 0);
  }, [formData.packingSelections]);

  const remainingWeight = MAX_TOTAL_WEIGHT - totalWeight;
  const isWeightLimitReached = totalWeight >= MAX_TOTAL_WEIGHT;

  // Get available variants based on selected item type
  const availableVariants = useMemo(() => {
    if (!formData.itemType || !ITEM_CONFIG[formData.itemType as keyof typeof ITEM_CONFIG]) {
      return [];
    }
    return ITEM_CONFIG[formData.itemType as keyof typeof ITEM_CONFIG].variants;
  }, [formData.itemType]);

  // Reset variant when item type changes (only if not pre-selected)
  React.useEffect(() => {
    if (formData.itemType && formData.itemVariant && !preSelectedProduct) {
      const isValidVariant = availableVariants.some(v => v.value === formData.itemVariant);
      if (!isValidVariant) {
        setFormData(prev => ({ ...prev, itemVariant: '' }));
      }
    }
  }, [formData.itemType, formData.itemVariant, availableVariants, preSelectedProduct]);

  // Handle packing selection changes
  const updatePackingSelection = (packingId: string, boxCount: number) => {
    const packingOption = PACKING_OPTIONS.find(p => p.id === packingId);
    if (!packingOption) return;

    const newTotalWeight = boxCount * packingOption.weightPerBox;
    const otherSelectionsWeight = Object.entries(formData.packingSelections)
      .filter(([key]) => key !== packingId)
      .reduce((total, [, selection]) => total + selection.totalWeight, 0);

    // Check if this selection would exceed the weight limit
    if (otherSelectionsWeight + newTotalWeight > MAX_TOTAL_WEIGHT) {
      const maxAllowedBoxes = Math.floor((MAX_TOTAL_WEIGHT - otherSelectionsWeight) / packingOption.weightPerBox);
      boxCount = Math.max(0, maxAllowedBoxes);
    }

    setFormData(prev => ({
      ...prev,
      packingSelections: {
        ...prev.packingSelections,
        [packingId]: {
          boxCount,
          totalWeight: boxCount * packingOption.weightPerBox
        }
      }
    }));

    // Clear packing errors when user makes a selection
    if (touched.packingSelections && errors.packingSelections) {
      setErrors(prev => ({ ...prev, packingSelections: undefined }));
    }
  };

  // Validation rules
  const validateField = (name: FieldName, value: any): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 100) return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, dots, hyphens and apostrophes';
        return '';

      case 'phoneNumber':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value.trim())) return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
        return '';

      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Please provide a complete address (minimum 10 characters)';
        if (value.trim().length > 500) return 'Address must be less than 500 characters';
        return '';

      case 'itemType':
        if (!value.trim()) return 'Please select an item type';
        if (!Object.keys(ITEM_CONFIG).includes(value)) return 'Invalid item type selected';
        return '';

      case 'itemVariant':
        if (!value.trim()) return 'Please select a variant';
        if (formData.itemType) {
          const validVariants = ITEM_CONFIG[formData.itemType as keyof typeof ITEM_CONFIG]?.variants || [];
          if (!validVariants.some(v => v.value === value)) return 'Invalid variant for selected item type';
        }
        return '';

      case 'date':
        if (!value.trim()) return 'Delivery date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Delivery date cannot be in the past';
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        if (selectedDate > maxDate) return 'Please select a date within the next 3 months';
        return '';

      case 'packingSelections':
        if (totalWeight === 0) return 'Please select at least one packing option';
        if (totalWeight !== MAX_TOTAL_WEIGHT) return `Total weight must be exactly ${MAX_TOTAL_WEIGHT}kg`;
        return '';

      case 'message':
        if (value.trim() && value.trim().length > 1000) return 'Message must be less than 1000 characters';
        return '';

      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Validate regular fields
    (['name', 'phoneNumber', 'address', 'itemType', 'itemVariant', 'date', 'message'] as const).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Validate packing selections
    const packingError = validateField('packingSelections', formData.packingSelections);
    if (packingError) newErrors.packingSelections = packingError;

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    const fieldName = name as FieldName;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    const fieldName = name as FieldName;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate on blur
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: TouchedFields = {};
    (['name', 'phoneNumber', 'address', 'itemType', 'itemVariant', 'date', 'packingSelections', 'message'] as const).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate form
    const formErrors = validateForm();
    setErrors(formErrors);

    // If there are errors, don't submit
    if (Object.keys(formErrors).some(key => formErrors[key as FieldName])) {
      setSubmitStatus('validation_error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Replace the fetch call in handleSubmit function with this:

const response = await fetch('/api/sawamani', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: formData.name.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    address: formData.address.trim(),
    item: {
      type: formData.itemType,
      variant: formData.itemVariant
    },
    date: new Date(formData.date).toISOString(),
    packingSelections: formData.packingSelections,
    totalWeight: totalWeight,
    // Convert packingSelections to readable string format
    packing: Object.entries(formData.packingSelections)
      .filter(([, selection]) => selection.boxCount > 0)
      .map(([packingId, selection]) => {
        const option = PACKING_OPTIONS.find(p => p.id === packingId);
        return `${selection.boxCount} ${option?.label || packingId}`;
      })
      .join(', '),
    message: formData.message.trim() || 'No additional message'
  }),
});

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          phoneNumber: '',
          address: '',
          itemType: preSelectedProduct?.type || '',
          itemVariant: preSelectedProduct?.variant || '',
          date: '',
          packingSelections: {},
          message: ''
        });
        setErrors({});
        setTouched({});
        
        // Call success callback if provided
        if (onOrderSuccess) {
          setTimeout(() => {
            onOrderSuccess();
          }, 2000);
        }
      } else {
        setSubmitStatus('server_error');
        console.error('Submission error:', result.message);
        
        // Handle server validation errors
        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          const serverErrors: FormErrors = {};
          result.validationErrors.forEach((error: string) => {
            // Parse validation error messages to extract field names
            if (error.includes('Name')) serverErrors.name = error;
            else if (error.includes('Phone')) serverErrors.phoneNumber = error;
            else if (error.includes('Address')) serverErrors.address = error;
            else if (error.includes('Date')) serverErrors.date = error;
            else if (error.includes('Packing')) serverErrors.packingSelections = error;
          });
          setErrors(prev => ({ ...prev, ...serverErrors }));
        }
      }
    } catch (error) {
      setSubmitStatus('network_error');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get input classes based on validation state
  const getInputClasses = (fieldName: FieldName): string => {
    const baseClasses = "w-full px-4 py-3 border rounded-lg transition-all duration-200";
    const hasError = errors[fieldName] && touched[fieldName];
    const hasValue = fieldName === 'packingSelections' ? totalWeight > 0 : formData[fieldName];
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50`;
    } else if (hasValue && touched[fieldName]) {
      return `${baseClasses} border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50`;
    } else {
      return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent`;
    }
  };

  // Get minimum date (today) in YYYY-MM-DD format
  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now) in YYYY-MM-DD format
  const getMaxDate = (): string => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const formContent = (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingBag className="text-orange-500 w-6 h-6" />
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {preSelectedProduct ? `Order ${preSelectedProduct.label || 'Product'}` : 'Sabka Sweets'}
          </h2>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        {preSelectedProduct && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-orange-800 font-medium">Selected: {preSelectedProduct.label}</p>
            <p className="text-orange-600 text-sm">Price: ₹{(preSelectedProduct.price / 100).toFixed(0)} per kg</p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">Thank you! Your order has been placed successfully. We will contact you soon to confirm.</span>
        </div>
      )}

      {submitStatus === 'validation_error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Please fix the errors below before submitting.</span>
        </div>
      )}

      {submitStatus === 'server_error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Server error occurred. Please try again later.</span>
        </div>
      )}

      {submitStatus === 'network_error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Network error. Please check your connection and try again.</span>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {/* Name and Phone */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={getInputClasses('name')}
              placeholder="Enter your full name"
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                +91
              </span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`${getInputClasses('phoneNumber')} rounded-l-none`}
                placeholder="9876543210"
              />
            </div>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Delivery Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
            rows={3}
            className={`${getInputClasses('address')} resize-none`}
            placeholder="Enter complete delivery address with landmarks"
          />
          {errors.address && touched.address && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.address}
            </p>
          )}
        </div>

        {/* Item Type and Variant */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Item Type *
            </label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              disabled={!!preSelectedProduct}
              className={`${getInputClasses('itemType')} ${preSelectedProduct ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select item type</option>
              {Object.entries(ITEM_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            {errors.itemType && touched.itemType && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.itemType}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1" />
              Variant *
            </label>
            <select
              name="itemVariant"
              value={formData.itemVariant}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              disabled={!formData.itemType || !!preSelectedProduct}
              className={`${getInputClasses('itemVariant')} ${preSelectedProduct ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {!formData.itemType ? 'Select item type first' : 'Select variant'}
              </option>
              {availableVariants.map((variant) => (
                <option key={variant.value} value={variant.value}>
                  {variant.label}
                </option>
              ))}
            </select>
            {errors.itemVariant && touched.itemVariant && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.itemVariant}
              </p>
            )}
          </div>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Delivery Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
            min={getMinDate()}
            max={getMaxDate()}
            className={getInputClasses('date')}
          />
          {errors.date && touched.date && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Enhanced Packing Size Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <Scale className="w-4 h-4 inline mr-1" />
            Select Packing Sizes & Quantities *
          </label>
          
          {/* Weight Summary */}
          <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Total Weight: {totalWeight.toFixed(1)}kg / {MAX_TOTAL_WEIGHT}kg
                </span>
              </div>
              <div className="text-sm">
                {remainingWeight > 0 ? (
                  <span className="text-green-600 font-medium">
                    You can add {remainingWeight.toFixed(1)}kg more
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Max weight limit reached ({MAX_TOTAL_WEIGHT}kg)
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  totalWeight === MAX_TOTAL_WEIGHT 
                    ? 'bg-green-500' 
                    : totalWeight > MAX_TOTAL_WEIGHT * 0.8 
                      ? 'bg-yellow-500' 
                      : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((totalWeight / MAX_TOTAL_WEIGHT) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Packing Options */}
          <div className="space-y-4">
            {PACKING_OPTIONS.map((option) => {
              const selection = formData.packingSelections[option.id] || { boxCount: 0, totalWeight: 0 };
              const isSelected = selection.boxCount > 0;
              const maxBoxesForThisOption = Math.floor(remainingWeight / option.weightPerBox) + selection.boxCount;
              const isDisabled = isWeightLimitReached && !isSelected;

              return (
                <div
                  key={option.id}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'border-orange-400 bg-orange-50 shadow-md'
                      : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Option Info */}
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <h4 className="font-semibold text-gray-800">{option.label}</h4>
                        <span className="text-sm text-gray-500">
                          ({option.weightPerBox}kg per box)
                        </span>
                      </div>
                      
                      {isSelected && (
                        <p className="text-sm text-orange-600 font-medium">
                          {selection.boxCount} box{selection.boxCount !== 1 ? 'es' : ''} × {option.weightPerBox}kg = {selection.totalWeight}kg
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-orange-300 p-1">
                          <button
                            type="button"
                            onClick={() => updatePackingSelection(option.id, Math.max(0, selection.boxCount - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-orange-100 text-orange-600 transition-colors"
                            disabled={selection.boxCount <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            max={maxBoxesForThisOption}
                            value={selection.boxCount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updatePackingSelection(option.id, Math.min(value, maxBoxesForThisOption));
                            }}
                            className="w-16 text-center border-0 bg-transparent font-medium text-gray-800 focus:outline-none"
                            disabled={isDisabled}
                          />
                          
                          <button
                            type="button"
                            onClick={() => updatePackingSelection(option.id, Math.min(maxBoxesForThisOption, selection.boxCount + 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-orange-100 text-orange-600 transition-colors"
                            disabled={selection.boxCount >= maxBoxesForThisOption || isDisabled}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updatePackingSelection(option.id, 1)}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isDisabled
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          Add
                        </button>
                      )}
                      
                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => updatePackingSelection(option.id, 0)}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Max boxes info */}
                  {maxBoxesForThisOption > 0 && !isDisabled && (
                    <div className="mt-2 text-xs text-gray-500">
                      Max {maxBoxesForThisOption} box{maxBoxesForThisOption !== 1 ? 'es' : ''} available
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Validation Message */}
          {errors.packingSelections && touched.packingSelections && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.packingSelections}
              </p>
            </div>
          )}

          {/* Weight requirement info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>
                <strong>Note:</strong> Total weight must be exactly {MAX_TOTAL_WEIGHT}kg to place an order.
                {totalWeight < MAX_TOTAL_WEIGHT && (
                  <span className="ml-1">You need to add {(MAX_TOTAL_WEIGHT - totalWeight).toFixed(1)}kg more.</span>
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Additional Message (Optional)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={3}
            className={`${getInputClasses('message')} resize-none`}
            placeholder="Any special instructions or preferences..."
          />
          {errors.message && touched.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || totalWeight !== MAX_TOTAL_WEIGHT}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting || totalWeight !== MAX_TOTAL_WEIGHT
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Place Order ({totalWeight}kg)
            </>
          )}
        </button>

        {/* Submit button helper text */}
        {totalWeight !== MAX_TOTAL_WEIGHT && (
          <p className="text-center text-sm text-gray-500 -mt-2">
            {totalWeight === 0 
              ? 'Please select packing options to continue'
              : `Add ${(MAX_TOTAL_WEIGHT - totalWeight).toFixed(1)}kg more to place order`
            }
          </p>
        )}
      </div>
    </>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
     
      <div className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SawamaniForm;