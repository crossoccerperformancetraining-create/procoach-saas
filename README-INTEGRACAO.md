# ProCoach — pacote de integração 213

Pacote de atualização para aplicar em uma branch de teste do repositório `procoach-saas`. Foi reconstituído a partir da base ProCoach 211 salva e inclui as alterações 213 descritas nesta documentação. Não foi enviado ao GitHub nem implantado.

## Arquivos de atualização

- `index.html`: novas abas, integração com autosave, backup/importação e recarga de dados ao trocar de equipe.
- `api/athlete-submit.js`: gravação transacional das respostas do atleta, com deduplicação por `clientMutationId` enviado pelo portal.
- `api/club-data.js`: endpoint autenticado para resumo do radar e calendário entre equipes vinculadas.
- `manifest.json` e `sw.js`: versão 213 e atualização do cache.

## Aplicação em branch

Na raiz do repositório, substitua `index.html`, `manifest.json`, `sw.js` e `api/athlete-submit.js`; adicione `api/club-data.js`. Preserve os outros arquivos, incluindo `api/_lib.js`, `atleta.html`, regras Firestore, imagens e variáveis de ambiente.

Crie uma branch de teste e gere uma Preview no Vercel antes de publicar. A integração GitHub usada nesta conversa não conseguiu criar a branch por falta de autorização de escrita; o ZIP serve para fazer o envio manual ou retomar quando essa autorização estiver disponível.

## Recursos incluídos

O menu passa de 35 para 40 destinos com **Estúdio de treino**, **Estoque DM**, **Escalação semanal**, **Prancheta tática** e **Clube e base**. O Estúdio organiza modelos e rotinas, agenda modelos no calendário existente e guarda um diário da comissão. A área de vídeos existente continua sendo usada para envios individuais, por setor e ao elenco.

A avaliação semanal registra notas do treinador de 1 a 5, calcula Top 5 dos últimos sete dias e sugere até onze atletas na formação selecionada, considerando as posições cadastradas. A sugestão fica salva e deve ser revisada pelo treinador.

O estoque permite cadastro de material, quantidade, nível mínimo, validade e movimentações simples de entrada/saída. Os itens sincronizam com o workspace, mas ainda não são debitados automaticamente por um atendimento do DM.

A prancheta nova oferece campo, tokens dos atletas, seleção múltipla, ajustes direcionais, quadros salvos e exportação PNG. O centro de jogo que já existia no SaaS permanece disponível.

## Limites da sincronização Clube e base

Informe o mesmo código em **Clube e base** nos workspaces que devem se reunir. A função só agrega workspaces que pertencem à conta autenticada (`ownerUid`) e que têm o mesmo `organization.clubId`; a consulta fica limitada aos 50 primeiros documentos da conta.

O endpoint compartilha apenas dados resumidos para o radar: nome, posição, média de notas, frequência e sinal de revisão do DM, além de eventos de calendário. Não retorna diagnóstico, contrato ou documento pessoal. Propostas de promoção/convocação vão para revisão e não movem atleta automaticamente.
