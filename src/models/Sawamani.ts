import mongoose, { Schema, Document } from 'mongoose';

// Update the interface
export interface ISawamani extends Document {
  name: string;
  phoneNumber: string;
  address: string;
  item: {
    type: 'laddoo' | 'barfi' | 'other';
    variant: 'moti boondi' | 'barik boondi' | 'motichoor' | 'besan' | 'moong' | 'mawa' | 'dilkhushal' | 'churma';
  };
  date: Date;
  packingSelections: {
    [key: string]: {
      boxCount: number;
      totalWeight: number;
    };
  };
  totalWeight: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// Update the schema
const SawamaniSchema: Schema<ISawamani> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    item: {
      type: {
        type: String,
        enum: ['laddoo', 'barfi', 'other'],
        required: [true, 'Item type is required'],
      },
      variant: {
        type: String,
        enum: ['moti boondi', 'barik boondi', 'motichoor', 'besan', 'moong', 'mawa', 'dilkhushal', 'churma'],
        required: [true, 'Item variant is required'],
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: function(date: Date) {
          return date >= new Date();
        },
        message: 'Date cannot be in the past',
      },
    },
    packingSelections: {
      type: Schema.Types.Mixed,
      required: [true, 'Packing selections are required'],
    },
    totalWeight: {
      type: Number,
      required: [true, 'Total weight is required'],
      min: [0, 'Total weight must be positive'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);
// Create indexes for better performance
SawamaniSchema.index({ phoneNumber: 1 });
SawamaniSchema.index({ date: 1 });
SawamaniSchema.index({ createdAt: -1 });

// Export the model
const Sawamani = mongoose.models.Sawamani || mongoose.model<ISawamani>('Sawamani', SawamaniSchema);

export default Sawamani;