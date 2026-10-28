const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const documentsRepository = require('../repositories/documents.repository');
const documentsService = require('../services/documents.service');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const configuredLimit = Number(process.env.MAX_FILE_SIZE_BYTES);
const maxFileSize = Number.isSafeInteger(configuredLimit) && configuredLimit > 0
  ? configuredLimit
  : 10 * 1024 * 1024;

fs.mkdirSync(documentsRepository.storageDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: documentsRepository.storageDirectory,
    filename: (req, file, callback) => callback(null, crypto.randomUUID()),
  }),
  limits: { fileSize: maxFileSize },
});

router.post(
  '/upload',
  documentsController.requireOwner,
  upload.single('file'),
  documentsController.upload,
);
router.get('/documents', documentsController.requireOwner, documentsController.list);
router.get(
  '/documents/:id/download',
  documentsController.requireOwner,
  documentsController.download,
);

module.exports = router;