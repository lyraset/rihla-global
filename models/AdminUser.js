import mongoose from 'mongoose'
import { mediaRefSchema, model } from './shared.js'

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'editor', 'viewer'], default: 'editor' },
    avatar: mediaRefSchema,
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

adminUserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    if (ret._id) ret.id = ret._id.toString()
    delete ret._id
    delete ret.passwordHash // never serialize the hash
    return ret
  },
})

export const AdminUser = model('AdminUser', adminUserSchema)
