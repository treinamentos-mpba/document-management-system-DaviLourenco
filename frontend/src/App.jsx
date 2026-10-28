import { useEffect, useState } from 'react';
import { listDocuments } from './services/documentsApi.js';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState('demo-user');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUserId = userId.trim();

  useEffect(() => {
    if (!currentUserId) {
      setDocuments([]);
      setIsLoading(false);
      setListError('');
      return undefined;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setListError('');

    listDocuments(currentUserId, { signal: controller.signal })
      .then(setDocuments)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setListError(error.message);
          setDocuments([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [currentUserId, refreshKey]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="DMS, início">
          <span className="wordmark-icon" aria-hidden="true">D</span>
          <span>DMS<span className="wordmark-period">.</span></span>
        </a>
        <label className="user-field">
          <span>Usuário</span>
          <input
            autoComplete="off"
            maxLength={128}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Identificador"
            value={userId}
          />
        </label>
      </header>

      <section className="page-heading" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">ARQUIVO PESSOAL</p>
          <h1 id="page-title">Seus documentos<span className="heading-period">.</span></h1>
        </div>
        <p className="heading-note">Organizados em um só lugar.</p>
      </section>

      <div className="workspace">
        <section className="upload-panel" aria-labelledby="upload-title">
          <div className="section-heading">
            <span className="section-index">01</span>
            <div>
              <p className="eyebrow">ADICIONAR</p>
              <h2 id="upload-title">Novo documento</h2>
            </div>
          </div>
          <UploadComponent
            onUploaded={() => setRefreshKey((key) => key + 1)}
            userId={currentUserId}
          />
          <div className="local-note">
            <span className="local-note-mark" aria-hidden="true" />
            <span>Armazenamento local</span>
          </div>
        </section>

        <section className="documents-panel" aria-labelledby="documents-title">
          <div className="section-heading documents-heading">
            <span className="section-index">02</span>
            <div>
              <p className="eyebrow">BIBLIOTECA</p>
              <h2 id="documents-title">Documentos</h2>
            </div>
            {!isLoading && !listError && (
              <span className="document-count" aria-label={`${documents.length} documentos`}>
                {String(documents.length).padStart(2, '0')}
              </span>
            )}
          </div>
          <DocumentList
            documents={documents}
            error={listError}
            isLoading={isLoading}
            userId={currentUserId}
          />
        </section>
      </div>
      <footer className="page-footer">
        <span>DOCUMENT MANAGEMENT SYSTEM</span>
        <span>ARQUIVO LOCAL <span className="footer-dot" aria-hidden="true">●</span></span>
      </footer>
    </main>
  );
}
