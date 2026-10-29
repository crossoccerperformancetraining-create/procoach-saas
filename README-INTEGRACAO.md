# ProCoach — sincronização da dor v215

Pacote de atualização preparado sobre os arquivos atuais do branch `main` do repositório `crossoccerperformancetraining-create/procoach-saas` (versão 214). Ele adiciona o registro e a leitura do lado da dor do atleta no diário compartilhado. Ainda não foi enviado ao GitHub nem publicado no Vercel.

## Arquivos incluídos

- `index.html`: formulário manual do treinador com lado por região, intensidade condicional, leitura de `painSides`, exibição por atleta e recorrência por região/lado.
- `atleta.html`: portal atual do atleta, com região, lado, intensidade condicional e envio dos campos `painZones`, `painSides` e `painDetails`. Preserva modo seguro e fila offline.
- `athlete-submit.js`: endpoint atual que grava as respostas seguras e conserva os campos do diário.
- `manifest.json` e `sw.js`: atualização de cache para a versão 215.
- `README-INTEGRACAO.md` e `AUDITORIA-UNIFICACAO.md`: instruções e escopo.

## Como integrar

Extraia o pacote e aplique os cinco arquivos de código na raiz de uma branch de teste. Faça commit na branch e confira a Preview do Vercel antes de publicar. Preserve os demais arquivos, regras do Firebase e variáveis de ambiente.

A tentativa de criar a branch pelo conector GitHub foi bloqueada com erro 403. Por isso, este pacote está pronto para integração manual; nenhum arquivo do repositório foi alterado.

## Comportamento

O treinador e o atleta registram a região e o lado (direita, esquerda, ambos ou não informado). Os registros ficam no mesmo diário por atleta e data. Relatórios e histórico agrupam a recorrência pela mesma região e lado. A intensidade da dor só aparece quando há uma região selecionada. O alerta de recorrência é um sinal para a comissão revisar, não um diagnóstico nem uma decisão automática de afastamento.

