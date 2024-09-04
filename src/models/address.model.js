import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    }, 
   street: {
       type: String,
       require: true
    },
    city: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    postalCode: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        require: true
    }
}, { timestamps: true })

export const Address = mongoose.model('Address', addressSchema)