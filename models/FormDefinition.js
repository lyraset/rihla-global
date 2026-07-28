import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'text', 'email', 'tel', 'number', 'textarea', 'select',
        'multiselect', 'radio', 'checkbox', 'date', 'file', 'hidden',
      ],
      default: 'text',
    },
    placeholder: String,
    helpText: String,
    required: { type: Boolean, default: false },
    options: [{ label: String, value: String }],
    validation: { min: Number, max: Number, minLength: Number, maxLength: Number, pattern: String },
    order: { type: Number, default: 0 },
    width: { type: String, enum: ['full', 'half'], default: 'full' },
  },
  { _id: false },
)

const formDefinitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    submitLabel: { type: String, default: 'Submit' },
    successMessage: { type: String, default: 'Thank you! We will be in touch shortly.' },
    fields: [fieldSchema],
    notifications: {
      emailTo: [String],
      sendWhatsapp: { type: Boolean, default: false },
      whatsappTemplate: String,
      autoReply: { type: Boolean, default: false },
      autoReplySubject: String,
      autoReplyBody: String,
    },
    redirectUrl: String,
    isActive: { type: Boolean, default: true },
    embedLocations: [String],
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

applyToJSON(formDefinitionSchema)

export const FormDefinition = model('FormDefinition', formDefinitionSchema)
