import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ documents, error, isLoading, userId }) {
  if (isLoading) {
    return <p className="list-state" role="status">Carregando documentos...</p>;
  }

  if (error) {
    return <p className="list-state is-error" role="alert">{error}</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-mark" aria-hidden="true">—</span>
        <p>Nenhum documento por aqui.</p>
      </div>
    );
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <span className="document-file-mark" aria-hidden="true">DOC</span>
          <div className="document-info">
            <strong title={document.originalName}>{document.originalName}</strong>
            <span>{formatFileSize(document.size)} <span aria-hidden="true">·</span> {formatDate(document.uploadedAt)}</span>
          </div>
          <DownloadButton document={document} userId={userId} />
        </li>
      ))}
    </ul>
  );
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}