import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name must be less than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  product: {
    type: String,
    required: [true, 'Product selection is required'],
    trim: true
  },
  quantity: {
    type: String,
    default: 'Not specified',
    maxlength: [100, 'Quantity must be less than 100 characters']
  },
  price: {
    type: String,
    default: 'Not specified',
    maxlength: [50, 'Price range must be less than 50 characters']
  },
  message: {
    type: String,
    default: 'No additional message',
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'completed', 'cancelled'],
    default: 'new'
  }
}, {
  timestamps: true
});

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });

export default mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);