'use client';

import React, { useState, useMemo } from 'react';
import { Heart, Phone, Mail, MapPin, Send, User, Package, Hash, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useProductNames } from '@/hooks/useProducts';

// Type definitions
interface FormData {
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  price: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  product?: string;
  quantity?: string;
  price?: string;
  message?: string;
}

interface TouchedFields {
  name?: boolean;
  email?: boolean;
  phone?: boolean;
  product?: boolean;
  quantity?: boolean;
  price?: boolean;
  message?: boolean;
}

type SubmitStatus = 'success' | 'validation_error' | 'server_error' | 'network_error' | null;

type FieldName = keyof FormData;

export function EnquiryForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    product: '',
    quantity: '',
    price: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [touched, setTouched] = useState<TouchedFields>({});

  // Fetch products using our custom hook
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    // error: productsError,
    isError: hasProductsError 
  } = useProductNames();

 
  const availableProducts = useMemo<string[]>(() => {
    let products: string[] = [];
    
    // Add products from API if available
    if (productsData && Array.isArray(productsData)) {
      products = productsData.map(product => product.name);
    }
    

    // Always ensure "Other" option is at the end
    const otherIndex = products.indexOf('Other (Please specify in message)');
    if (otherIndex > -1) {
      products.splice(otherIndex, 1);
    }
    products.push('Other (Please specify in message)');

    return products;
  }, [productsData]);

  // Validation rules
  const validateField = (name: FieldName, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 100) return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, dots, hyphens and apostrophes';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email address is too long';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value.trim())) return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
        return '';

      case 'product':
        if (!value.trim()) return 'Please select a product/service';
        return '';

      case 'quantity':
        if (value.trim() && value.trim().length > 100) return 'Quantity description must be less than 100 characters';
        return '';

      case 'price':
        if (value.trim() && value.trim().length > 50) return 'Price range must be less than 50 characters';
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
    
    // Special validation for "Other" product selection
    if (formData.product === 'Other (Please specify in message)' && !formData.message.trim()) {
      newErrors.message = 'Please specify the product details in the message when selecting "Other"';
    }

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
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          quantity: formData.quantity.trim() || 'Not specified',
          price: formData.price.trim() || 'Not specified',
          message: formData.message.trim() || 'No additional message'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          product: '',
          quantity: '',
          price: '',
          message: ''
        });
        setErrors({});
        setTouched({});
      } else {
        setSubmitStatus('server_error');
        console.error('Submission error:', result.message);
        
        // Handle server validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const serverErrors: FormErrors = {};
          result.errors.forEach((error: any) => {
            if (error.field && error.field in formData) {
              serverErrors[error.field as FieldName] = error.message;
            }
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
      return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="text-pink-500 w-8 h-8" fill="currentColor" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Sweet Delights
            </h1>
            <Heart className="text-pink-500 w-8 h-8" fill="currentColor" />
          </div>
          <p className="text-gray-600 text-lg">Crafting Sweet Memories, One Treat at a Time</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Image and Info */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="h-96 bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 flex items-center justify-center">
                <div className="text-center text-white">
                  <Package className="w-24 h-24 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-semibold mb-2">Premium Sweets & Cakes</h3>
                  <p className="text-lg opacity-90">Made with love, served with joy</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-pink-500" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-pink-500" />
                  <span>orders@sweetdelights.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-pink-500" />
                  <span>123 Sweet Street, Raipur, Chhattisgarh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Enquiry</h2>
              <p className="text-gray-600">Tell us about your sweet requirements and well get back to you!</p>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700">Thank you! Your enquiry has been submitted successfully.</span>
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

            {/* Products loading error */}
            {hasProductsError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-700">
                  Unable to load latest products. Using default options.
                </span>
              </div>
            )}

            <div className="space-y-6">
              {/* Name and Email */}
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
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={getInputClasses('email')}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`${getInputClasses('phone')} rounded-l-none`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Product and Quantity */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Product/Service *
                    {productsLoading && (
                      <Loader2 className="w-4 h-4 inline ml-2 animate-spin text-gray-400" />
                    )}
                  </label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={productsLoading}
                    className={getInputClasses('product')}
                  >
                    <option value="">
                      {productsLoading ? 'Loading products...' : 'Select a product'}
                    </option>
                    {availableProducts.map((product, index) => (
                      <option key={index} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                  {errors.product && touched.product && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.product}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Estimated Quantity
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getInputClasses('quantity')}
                    placeholder="e.g., 2 kg, 50 pieces"
                  />
                  {errors.quantity && touched.quantity && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.quantity}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (Optional)
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClasses('price')}
                  placeholder="e.g., ₹500-1000, ₹2000+"
                />
                {errors.price && touched.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Additional Details
                  {formData.product === 'Other (Please specify in message)' && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows={4}
                  className={`${getInputClasses('message')} resize-none`}
                  placeholder="Tell us about your event, special requirements, delivery date, or any other details..."
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

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || productsLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Enquiry
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              We will get back to you within 24 hours with a customized quote!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnquiryForm;