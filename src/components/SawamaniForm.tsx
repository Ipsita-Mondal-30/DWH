'use client';

import React, { useState, useMemo } from 'react';
import { Heart, Phone, Mail, MapPin, Send, User, Package, Calendar, MessageSquare, CheckCircle, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

// Type definitions
interface SawamaniFormData {
  name: string;
  phoneNumber: string;
  address: string;
  itemType: string;
  itemVariant: string;
  date: string;
  packing: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
  address?: string;
  itemType?: string;
  itemVariant?: string;
  date?: string;
  packing?: string;
  message?: string;
}

interface TouchedFields {
  name?: boolean;
  phoneNumber?: boolean;
  address?: boolean;
  itemType?: boolean;
  itemVariant?: boolean;
  date?: boolean;
  packing?: boolean;
  message?: boolean;
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
      { value: 'motichoor', label: 'Motichoor Laddoo' }
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
  }
};

const PACKING_OPTIONS = [
  { value: '2 piece', label: '2 Pieces' },
  { value: '4 piece', label: '4 Pieces' },
  { value: 'half kg', label: 'Half Kg (500g)' },
  { value: '1kg', label: '1 Kg' },
  { value: '5kg', label: '5 Kg (Bulk Order)' }
];

export function SawamaniForm() {
  const [formData, setFormData] = useState<SawamaniFormData>({
    name: '',
    phoneNumber: '',
    address: '',
    itemType: '',
    itemVariant: '',
    date: '',
    packing: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [touched, setTouched] = useState<TouchedFields>({});

  // Get available variants based on selected item type
  const availableVariants = useMemo(() => {
    if (!formData.itemType || !ITEM_CONFIG[formData.itemType as keyof typeof ITEM_CONFIG]) {
      return [];
    }
    return ITEM_CONFIG[formData.itemType as keyof typeof ITEM_CONFIG].variants;
  }, [formData.itemType]);

  // Reset variant when item type changes
  React.useEffect(() => {
    if (formData.itemType && formData.itemVariant) {
      const isValidVariant = availableVariants.some(v => v.value === formData.itemVariant);
      if (!isValidVariant) {
        setFormData(prev => ({ ...prev, itemVariant: '' }));
      }
    }
  }, [formData.itemType, formData.itemVariant, availableVariants]);

  // Validation rules
  const validateField = (name: FieldName, value: string): string => {
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

      case 'packing':
        if (!value.trim()) return 'Please select a packing option';
        if (!PACKING_OPTIONS.some(p => p.value === value)) return 'Invalid packing option selected';
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
    
    (Object.keys(formData) as FieldName[]).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

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
    (Object.keys(formData) as FieldName[]).forEach(field => {
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
          packing: formData.packing,
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
          itemType: '',
          itemVariant: '',
          date: '',
          packing: '',
          message: ''
        });
        setErrors({});
        setTouched({});
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
            else if (error.includes('Packing')) serverErrors.packing = error;
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
    const hasValue = formData[fieldName];
    
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="text-orange-500 w-8 h-8" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Sawamani Sweets
            </h1>
            <ShoppingBag className="text-orange-500 w-8 h-8" />
          </div>
          <p className="text-gray-600 text-lg">Traditional Indian Sweets Made with Pure Ingredients</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Image and Info */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="h-96 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 flex items-center justify-center">
                <div className="text-center text-white">
                  <Package className="w-24 h-24 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-semibold mb-2">Premium Laddoo & Barfi</h3>
                  <p className="text-lg opacity-90">Made with traditional recipes & pure ghee</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-green-500 bg-opacity-20">
                <Image
                  src="/dwhh.png"
                  alt="Laddoo & Barfi"
                  layout="fill"
                  objectFit="cover"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span>orders@sawamanisweets.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>123 Sweet Lane, Raipur, Chhattisgarh</span>
                </div>
              </div>
              
              {/* Specialties */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Our Specialties</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>• Moti Boondi Laddoo</div>
                  <div>• Besan Barfi</div>
                  <div>• Barik Boondi Laddoo</div>
                  <div>• Moong Dal Barfi</div>
                  <div>• Motichoor Laddoo</div>
                  <div>• Mawa Barfi</div>
                  <div>• Dilkhushal Barfi</div>
                  <div>• Custom Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Place Your Order</h2>
              <p className="text-gray-600">Fill in your details and we will prepare your fresh sweets!</p>
            </div>


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

            <div className="space-y-6">
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
                    className={getInputClasses('itemType')}
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
                    disabled={!formData.itemType}
                    className={getInputClasses('itemVariant')}
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

              {/* Date and Packing */}
              <div className="grid md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Packing Size *
                  </label>
                  <select
                    name="packing"
                    value={formData.packing}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={getInputClasses('packing')}
                  >
                    <option value="">Select packing</option>
                    {PACKING_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.packing && touched.packing && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.packing}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows={3}
                  className={`${getInputClasses('message')} resize-none`}
                  placeholder="Any special requests, preferred delivery time, or additional notes..."
                />
                {errors.message && touched.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.message.length}/1000 characters
                </p>
              </div>
                          {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700">Thank you! Your order has been placed successfully. We will contact you soon to confirm.</span>
              </div>
            )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              🍯 Fresh sweets prepared on order • 📞 We will call to confirm your order • 🚚 Free delivery within city
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SawamaniForm;