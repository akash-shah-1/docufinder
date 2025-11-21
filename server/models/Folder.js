const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: 'bg-indigo-500' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: String }], // Array of emails
  createdAt: { type: Date, default: Date.now }
});

// Virtual for frontend compatibility
FolderSchema.virtual('id').get(function(){ return this._id.toHexString(); });
FolderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Folder', FolderSchema);