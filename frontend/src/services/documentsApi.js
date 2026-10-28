const API_PREFIX = '/api';

async function request(path, userId, options = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'X-User-Id': userId,
    },
  });

  if (!response.ok) {
    let message = 'Não foi possível concluir a solicitação.';
    try {
      const body = await response.json();
      message = body.error?.message || message;
    } catch {
      // Mantém a mensagem padrão quando a resposta não contém JSON.
    }
    throw new Error(message);
  }

  return response;
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', userId, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function listDocuments(userId, { signal } = {}) {
  const response = await request('/documents', userId, { signal });
  const body = await response.json();
  return body.documents;
}

function getDownloadName(contentDisposition, fallbackName) {
  const encodedName = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encodedName) {
    try {
      return decodeURIComponent(encodedName);
    } catch {
      return fallbackName;
    }
  }

  const quotedName = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  return quotedName || fallbackName;
}

export async function downloadDocument(document, userId) {
  const response = await request(
    `/documents/${encodeURIComponent(document.id)}/download`,
    userId,
  );
  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = downloadUrl;
  link.download = getDownloadName(
    response.headers.get('Content-Disposition'),
    document.originalName,
  );
  window.document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}