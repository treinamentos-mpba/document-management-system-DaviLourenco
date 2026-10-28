# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos por uma interface web, com arquivos armazenados localmente e metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Envio de documentos pelo navegador.
- Listagem dos documentos do usuário identificado na requisição.
- Download de um documento pelo identificador.
- Separação simples de documentos por usuário.
- Interface React consumindo a API Express.

### Fora do escopo

- Autenticação, cadastro ou administração de usuários.
- Armazenamento em nuvem ou em serviços externos.
- Versionamento, busca, edição ou exclusão de documentos.
- Persistência dos metadados após reinício do backend.
- Visualização de arquivos no navegador.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando o formulário da interface. |
| RF-02 | O sistema aceita o arquivo no campo multipart `file`, valida a requisição e rejeita arquivos vazios ou acima do limite configurado. |
| RF-03 | O sistema grava o arquivo em `backend/storage` usando `multer` com `diskStorage`; o nome físico deve ser gerado pelo sistema e não depender do nome enviado pelo usuário. |
| RF-04 | Após um upload bem-sucedido, o sistema registra os metadados em memória e retorna o identificador e os dados públicos do documento. |
| RF-05 | O usuário pode listar somente os documentos associados à sua identidade de requisição. |
| RF-06 | O usuário pode baixar um documento de sua propriedade pelo identificador. O download deve usar o nome original como nome sugerido e ser enviado como anexo. |
| RF-07 | Um documento inexistente ou pertencente a outro usuário deve resultar em resposta `404`, sem revelar sua existência. |
| RF-08 | A interface apresenta estados de envio, sucesso e erro, atualiza a listagem após upload e permite iniciar o download. |
| RF-09 | A API retorna erros em formato JSON consistente, sem expor caminhos internos ou detalhes de implementação. |

### Identificação do usuário no MVP

As rotas de documentos recebem o cabeçalho `X-User-Id`, com identificador não vazio de até 128 caracteres. A ausência ou invalidade do cabeçalho resulta em `400 Bad Request`.

Esse cabeçalho é apenas um mecanismo de separação para desenvolvimento e demonstração: não autentica o solicitante e pode ser falsificado. O MVP não deve ser considerado seguro para implantação multiusuário pública sem autenticação e autorização confiáveis.

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são armazenados exclusivamente no filesystem local, em `backend/storage`, usando `multer` com `diskStorage`. |
| RNF-02 | Os metadados são mantidos em memória; reiniciar o backend os apaga. |
| RNF-03 | Configurações operacionais são obtidas por variáveis de ambiente, com valores padrão documentados. |
| RNF-04 | O backend usa Node.js e Express em CommonJS; o frontend usa React e Vite em ESM. |
| RNF-05 | O backend segue o fluxo `routes -> controllers -> services -> repositories`; camadas internas não dependem de Express. |
| RNF-06 | O frontend acessa a API via `fetch` com prefixo `/api`; o proxy de desenvolvimento do Vite remove esse prefixo ao encaminhar para o backend. |
| RNF-07 | O limite padrão de upload é 10 MiB e pode ser alterado por `MAX_FILE_SIZE_BYTES`. Não há restrição de tipo de arquivo no MVP. |
| RNF-08 | Os arquivos são sempre baixados como anexo, sem execução ou renderização pelo frontend. |

### Configuração

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local para arquivos. |
| `MAX_FILE_SIZE_BYTES` | `10485760` | Tamanho máximo de upload em bytes. |

## 5. Modelo de dados

### Metadados do documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | Público | UUID usado como identificador do documento. |
| `originalName` | string | Público | Nome original fornecido no upload; tratado como dado não confiável. |
| `size` | number | Público | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Público | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | Público | Valor de `X-User-Id` associado ao documento. |
| `mimeType` | string | Público | Tipo informado/detectado pelo middleware, com fallback para `application/octet-stream`. |
| `storageName` | string | Interno | Nome gerado para o arquivo no filesystem; nunca deve ser retornado pela API. |

O repositório mantém os registros em memória, indexados por `id`. O nome físico deve ser opaco e único, preferencialmente derivado do UUID, sem usar diretamente `originalName`.

## 6. Contratos de API

Todas as rotas abaixo são relativas à raiz do backend. Em desenvolvimento, o frontend as acessa por `/api`, usando o proxy do Vite.

### Formato de erro

Respostas de erro usam o formato:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}