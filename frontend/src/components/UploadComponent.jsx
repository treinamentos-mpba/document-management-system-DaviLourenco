import { useId, useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi.js';

export default function UploadComponent({ userId, onUploaded }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || !userId || isUploading) return;

    setIsUploading(true);
    setMessage('');
    setIsError(false);

    try {
      await uploadDocument(file, userId);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage('Documento enviado.');
      onUploaded();
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className={`file-picker${file ? ' has-file' : ''}`} htmlFor={inputId}>
        <span className="file-picker-icon" aria-hidden="true">+</span>
        <span className="file-picker-copy">
          <strong>{file ? file.name : 'Escolher arquivo'}</strong>
          <span>{file ? formatFileSize(file.size) : 'Qualquer formato · até 10 MB'}</span>
        </span>
        <span className="file-picker-arrow" aria-hidden="true">↗</span>
      </label>
      <input
        ref={inputRef}
        className="visually-hidden"
        id={inputId}
        onChange={(event) => {
          setFile(event.target.files?.[0] || null);
          setMessage('');
        }}
        type="file"
      />
      <button className="primary-button" disabled={!file || !userId || isUploading} type="submit">
        {isUploading ? 'Enviando...' : 'Enviar documento'}
        <span aria-hidden="true">↗</span>
      </button>
      {message && (
        <p className={`form-message${isError ? ' is-error' : ''}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}