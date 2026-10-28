const fs = require('node:fs/promises');
const path = require('node:path');

const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage'),
);
const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

function findById(id) {
  return documents.get(id) || null;
}

function getStoredFilePath(storageName) {
  return path.join(storageDirectory, storageName);
}

async function removeStoredFile(storageName) {
  try {
    await fs.unlink(getStoredFilePath(storageName));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  storageDirectory,
  save,
  findByOwner,
  findById,
  getStoredFilePath,
  removeStoredFile,
};