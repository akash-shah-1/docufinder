const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: String,
  summary: String,
  category: String,
  tags: [String],
  imageUrl: String, // URL from ImageKit
  fileId: String,   // ImageKit File ID for deletion
  mimeType: String,
  folderId: { type: String, default: 'root' }, // Can be 'root' or ObjectId string
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentAnalysis: String, // JSON string from AI
  importantDate: String,
  dateLabel: String,
  fileSize: Number,
  ocrText: String,
  createdAt: { type: Date, default: Date.now }
});

DocumentSchema.virtual('id').get(function(){ return this._id.toHexString(); });
DocumentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Document', DocumentSchema);