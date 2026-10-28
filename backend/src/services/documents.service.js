const crypto = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

async function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype || 'application/octet-stream',
    storageName: file.filename,
  };

  try {
    documentsRepository.save(document);
    return toPublicDocument(document);
  } catch (error) {
    await documentsRepository.removeStoredFile(file.filename);
    throw error;
  }
}

function listDocuments(owner) {
  return documentsRepository
    .findByOwner(owner)
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(toPublicDocument);
}

function getDocumentForDownload(id, owner) {
  const document = documentsRepository.findById(id);

  if (!document || document.owner !== owner) {
    return null;
  }

  return {
    document,
    filePath: documentsRepository.getStoredFilePath(document.storageName),
  };
}

function removeUploadedFile(storageName) {
  return documentsRepository.removeStoredFile(storageName);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
  removeUploadedFile,
};