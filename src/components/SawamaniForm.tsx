'use client';

import React, { useState, useMemo } from 'react';
import { Heart, Phone, MapPin, Send, User, Package, Calendar, MessageSquare, CheckCircle, AlertCircle, Loader2, ShoppingBag, X,  Scale,  } from 'lucide-react';

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
  { id: '5kg', label: '5 Kg (Bulk)', value: '5kg', weightPerBox: 5, isWeightBased: true }
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

  // State for manual weight inputs
  const [weightInputs, setWeightInputs] = useState<{ [key: string]: string }>({
    '2piece': '',
    '4piece': '',
    '500gram': '',
    '1kg': '',
    '5kg': ''
  });

  // Calculate total weight from manual inputs
const totalWeight = useMemo(() => {
  return Object.entries(weightInputs).reduce((total, [, value]) => {
    const weight = parseFloat(value) || 0;
    return total + weight;
  }, 0);
}, [weightInputs]);

  const remainingWeight = MAX_TOTAL_WEIGHT - totalWeight;
  const isWeightLimitReached = totalWeight >= MAX_TOTAL_WEIGHT;

  // Update packingSelections based on weight inputs (to maintain compatibility with existing logic)
  React.useEffect(() => {
    const newPackingSelections: PackingSelection = {};
    
    Object.entries(weightInputs).forEach(([packingId, weightStr]) => {
      const weight = parseFloat(weightStr) || 0;
      if (weight > 0) {
        const packingOption = PACKING_OPTIONS.find(p => p.id === packingId);
        if (packingOption) {
          // Calculate equivalent boxes for compatibility
          const boxCount = Math.ceil(weight / packingOption.weightPerBox);
          newPackingSelections[packingId] = {
            boxCount,
            totalWeight: weight
          };
        }
      }
    });
    
    setFormData(prev => ({ ...prev, packingSelections: newPackingSelections }));
  }, [weightInputs]);

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

  // Handle weight input changes
  const handleWeightInputChange = (packingId: string, value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value) || 0;
      const otherWeights = Object.entries(weightInputs)
        .filter(([key]) => key !== packingId)
        .reduce((sum, [, val]) => sum + (parseFloat(val) || 0), 0);
      
      // Check if this would exceed the weight limit
      if (otherWeights + numValue > MAX_TOTAL_WEIGHT) {
        const maxAllowed = MAX_TOTAL_WEIGHT - otherWeights;
        value = maxAllowed.toString();
      }
      
      setWeightInputs(prev => ({
        ...prev,
        [packingId]: value
      }));

      // Clear packing errors when user makes a selection
      if (touched.packingSelections && errors.packingSelections) {
        setErrors(prev => ({ ...prev, packingSelections: undefined }));
      }
    }
  };

  // Validation rules
  const validateField = (name: FieldName, value: unknown): string => {
    if (typeof value !== 'string' && name !== 'packingSelections') {
      return 'Invalid input type';
    }
  
    switch (name) {
      case 'name':
        if (typeof value === 'string' && !value.trim()) return 'Name is required';
        if (typeof value === 'string' && value.length < 2) return 'Name must be at least 2 characters';
        if ((value as string).length > 100) return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value as string)) return 'Name can only contain letters, spaces, dots, hyphens and apostrophes';
        return '';
  
      case 'phoneNumber':
        if (!(value as string).trim()) return 'Phone number is required';
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value as string)) return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
        return '';
  
      case 'address':
        if (typeof value === 'string' && !value.trim()) return 'Address is required';
        if (typeof value === 'string' && value.length < 10) return 'Please provide a complete address (minimum 10 characters)';
        if (typeof value === 'string' && value.length > 500) return 'Address must be less than 500 characters';
        return '';
  
      case 'itemType':
        if (!(value as string).trim()) return 'Please select an item type';
        if (!Object.keys(ITEM_CONFIG).includes(value as string)) return 'Invalid item type selected';
        return '';
  
      case 'itemVariant':
        if (!(value as string).trim()) return 'Please select a variant';
        if (formData.itemType) {
          const validVariants = ITEM_CONFIG[formData.itemType as keyof typeof ITEM_CONFIG]?.variants || [];
          if (!validVariants.some(v => v.value === value)) return 'Invalid variant for selected item type';
        }
        return '';
  
      case 'date':
        if (!(value as string).trim()) return 'Delivery date is required';
        const selectedDate = new Date(value as string);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Delivery date cannot be in the past';
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        if (selectedDate > maxDate) return 'Please select a date within the next 3 months';
        return '';
  
      case 'packingSelections':
        if (totalWeight === 0) return 'Please enter weight for at least one packing option';
        if (totalWeight > MAX_TOTAL_WEIGHT) return `Total weight cannot exceed ${MAX_TOTAL_WEIGHT}kg`;
        return '';
  
      case 'message':
        if (typeof value === 'string' && value.trim().length > 1000) return 'Message must be less than 1000 characters';
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
         // Convert weight inputs to readable string format
packing: Object.entries(weightInputs)
.filter(([, weight]) => parseFloat(weight) > 0)
.map(([packingId, weight]) => {
  const option = PACKING_OPTIONS.find(p => p.id === packingId);
  return `${weight}kg ${option?.label || packingId}`;
})
.join(', '),
// Add detailed packing breakdown
packingBreakdown: Object.entries(weightInputs)
.filter(([, weight]) => parseFloat(weight) > 0)
.reduce((acc, [packingId, weight]) => {
  const option = PACKING_OPTIONS.find(p => p.id === packingId);
  acc[option?.label || packingId] = `${weight} kg`;
  return acc;
}, {} as { [key: string]: string }),
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
        setWeightInputs({
          '2piece': '',
          '4piece': '',
          '500gram': '',
          '1kg': '',
          '5kg': ''
        });
        setErrors({});
        setTouched({});
        
        // Call success callback if provided
        if (onOrderSuccess) {
          setTimeout(() => {
            onOrderSuccess();
          }, 8000);
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-8 text-center shadow-2xl">
      <div className="mb-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Thank you for placing your order!</h3>
      </div>
      <div className="space-y-3 text-gray-600">
        <p className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          📞 We will contact you soon.
        </p>
        <p className="text-sm">
          For any issue, contact: <a href="tel:9034033999" className="font-semibold text-orange-600 hover:text-orange-700">9034033999</a>
        </p>
      </div>
      <button
        onClick={() => setSubmitStatus(null)}
        className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

      {submitStatus === 'validation_error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Please enter the details below before submitting.</span>
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

        {/* Enhanced Packing Section with Manual Weight Inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <Scale className="w-4 h-4 inline mr-1" />
            Enter Weight for Each Packing Type *
          </label>
          
          {/* Weight Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
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
                    {remainingWeight.toFixed(1)}kg remaining
                  </span>
                ) : remainingWeight === 0 ? (
                  <span className="text-green-600 font-medium">
                    Perfect! Ready to order
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Exceeds limit by {Math.abs(remainingWeight).toFixed(1)}kg
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  totalWeight > MAX_TOTAL_WEIGHT 
                    ? 'bg-red-500' 
                    : totalWeight === MAX_TOTAL_WEIGHT 
                      ? 'bg-green-500' 
                      : totalWeight > MAX_TOTAL_WEIGHT * 0.8 
                        ? 'bg-yellow-500' 
                        : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((totalWeight / MAX_TOTAL_WEIGHT) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Packing Options with Manual Weight Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {PACKING_OPTIONS.map((option) => {
              const currentWeight = parseFloat(weightInputs[option.id]) || 0;
              const hasValue = currentWeight > 0;
              const maxWeightForThis = remainingWeight + currentWeight;
              
              return (
                <div 
                  key={option.id} 
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    hasValue 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-orange-200'
                  }`}
                >
                  {/* Packing Type Label */}
                  <div className="text-center mb-3">
                    <div className={`inline-flex items-center px-3 py-2 rounded-lg font-medium ${
                      hasValue 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      <Package className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </div>
                  
                  {/* Weight Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600 text-center">
                      Enter Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={weightInputs[option.id]}
                        onChange={(e) => handleWeightInputChange(option.id, e.target.value)}
                        onFocus={() => {
                          if (touched.packingSelections && errors.packingSelections) {
                            setErrors(prev => ({ ...prev, packingSelections: undefined }));
                          }
                        }}
                        disabled={isWeightLimitReached && !hasValue}
                        className={`w-full px-3 py-2 text-center border rounded-lg transition-all duration-200 ${
                          hasValue
                            ? 'border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white'
                            : isWeightLimitReached
                              ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                              : 'border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
                        }`}
                        placeholder={isWeightLimitReached && !hasValue ? "Limit reached" : "0"}
                      />
                      {hasValue && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-orange-600 font-medium">kg</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Individual Weight Limit Warning */}
                    {currentWeight > maxWeightForThis && maxWeightForThis >= 0 && (
                      <p className="text-xs text-red-600 text-center">
                        Max {maxWeightForThis.toFixed(1)}kg available
                      </p>
                    )}
                    
                    {/* Equivalent Info for reference */}
                    {hasValue && option.isWeightBased}
                    {hasValue && !option.isWeightBased }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weight Limit Exceeded Warning */}
          {totalWeight > MAX_TOTAL_WEIGHT && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Order cannot exceed {MAX_TOTAL_WEIGHT} kg total.</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Please reduce the weight in one or more categories to proceed.
              </p>
            </div>
          )}

          {/* Helpful Tips */}
          {totalWeight === 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">How to order:</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Enter the total weight you want for each packing type. For example:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
  <li>• 2 Pieces: Enter 3kg (you&#39;ll get pieces totaling ~3kg)</li>
  <li>• 1 Kg: Enter 10kg (you&#39;ll get 10 × 1kg packs)</li>
  <li>• Maximum total order: {MAX_TOTAL_WEIGHT}kg</li>
</ul>
                </div>
              </div>
            </div>
          )}

          {/* Packing Selection Error */}
          {errors.packingSelections && touched.packingSelections && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.packingSelections}
              </p>
            </div>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Additional Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={3}
            className={`${getInputClasses('message')} resize-none`}
            placeholder="Any special instructions or requests..."
          />
          {errors.message && touched.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || totalWeight === 0 || totalWeight > MAX_TOTAL_WEIGHT}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isSubmitting || totalWeight === 0 || totalWeight > MAX_TOTAL_WEIGHT
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Order...
              </>
            ) : totalWeight === 0 ? (
              <>
                <Package className="w-5 h-5" />
                Enter Weight to Continue
              </>
            ) : totalWeight > MAX_TOTAL_WEIGHT ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Exceeds Weight Limit
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Place Order ({totalWeight.toFixed(1)}kg)
              </>
            )}
          </button>
          
          {/* Order Summary */}
          {totalWeight > 0 && totalWeight <= MAX_TOTAL_WEIGHT && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-semibold text-green-800 mb-2">Order Summary:</h4>
              <div className="text-sm text-green-700 space-y-1">
                {Object.entries(weightInputs)
                  .filter(([, weight]) => parseFloat(weight) > 0)
                  .map(([packingId, weight]) => {
                    const option = PACKING_OPTIONS.find(p => p.id === packingId);
                    return (
                      <div key={packingId} className="flex justify-between">
                        <span>{option?.label}:</span>
                        <span className="font-medium">{weight}kg</span>
                      </div>
                    );
                  })}
                <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total Weight:</span>
                  <span>{totalWeight.toFixed(1)}kg</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Return the form based on whether it's a modal or standalone
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
     
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
          <div className="p-6 md:p-8">
            {formContent}
          </div>
        </div>
      </div>
    </div>
  );
};