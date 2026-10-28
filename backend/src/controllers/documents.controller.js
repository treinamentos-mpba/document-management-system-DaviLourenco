const path = require('node:path');
const documentsService = require('../services/documents.service');

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function requireOwner(req, res, next) {
  const owner = req.get('X-User-Id');
  const normalizedOwner = typeof owner === 'string' ? owner.trim() : '';

  if (!normalizedOwner || normalizedOwner.length > 128) {
    return sendError(res, 400, 'INVALID_USER', 'O cabeçalho X-User-Id é obrigatório.');
  }

  req.owner = normalizedOwner;
  return next();
}

async function upload(req, res, next) {
  if (!req.file) {
    return sendError(res, 400, 'FILE_REQUIRED', 'Envie um arquivo no campo "file".');
  }

  if (req.file.size === 0) {
    try {
      await documentsService.removeUploadedFile(req.file.filename);
    } catch (error) {
      return next(error);
    }
    return sendError(res, 400, 'EMPTY_FILE', 'O arquivo enviado está vazio.');
  }

  try {
    const document = await documentsService.createDocument(req.file, req.owner);
    return res.status(201).json(document);
  } catch (error) {
    return next(error);
  }
}

function list(req, res) {
  return res.json({ documents: documentsService.listDocuments(req.owner) });
}

function download(req, res, next) {
  const result = documentsService.getDocumentForDownload(req.params.id, req.owner);

  if (!result) {
    return sendError(res, 404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
  }

  const downloadName = path.basename(result.document.originalName.replace(/\\/g, '/'));
  return res.download(result.filePath, downloadName, (error) => {
    if (!error) {
      return;
    }

    if (res.headersSent) {
      return next(error);
    }

    if (error.code === 'ENOENT') {
      return sendError(res, 404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    return next(error);
  });
}

module.exports = { requireOwner, upload, list, download };