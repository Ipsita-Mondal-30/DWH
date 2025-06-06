import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for TypeScript
export interface ISawamani extends Document {
  name: string;
  phoneNumber: string;
  address: string;
  item: {
    type: 'laddoo' | 'barfi';
    variant: 'moti boondi' | 'barik boondi' | 'motichoor' | 'besan' | 'moong' | 'mawa' | 'dilkhushal';
  };
  date: Date;
  packing: '1kg' | 'half kg' | '4 piece' | '2 piece' | '5kg';
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
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
        enum: ['laddoo', 'barfi'],
        required: [true, 'Item type is required'],
      },
      variant: {
        type: String,
        enum: ['moti boondi', 'barik boondi', 'motichoor', 'besan', 'moong', 'mawa', 'dilkhushal'],
        required: [true, 'Item variant is required'],
        validate: {
          validator: function(this: ISawamani, variant: string) {
            const laddooVariants = ['moti boondi', 'barik boondi', 'motichoor'];
            const barfiVariants = ['besan', 'moong', 'mawa', 'dilkhushal'];
            
            if (this.item.type === 'laddoo') {
              return laddooVariants.includes(variant);
            }
            if (this.item.type === 'barfi') {
              return barfiVariants.includes(variant);
            }
            return false;
          },
          message: 'Invalid variant for the selected item type',
        },
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
    packing: {
      type: String,
      enum: ['1kg', 'half kg', '4 piece', '2 piece', '5kg'],
      required: [true, 'Packing is required'],
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