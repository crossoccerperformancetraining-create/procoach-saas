# Auditoria ProCoach — sincronização da dor v215

## Base

Os arquivos deste pacote foram lidos do branch `main` atual do repositório `crossoccerperformancetraining-create/procoach-saas`, identificado como versão 214. As alterações foram aplicadas localmente em uma cópia de trabalho para preparar o patch da versão 215.

## Fluxo de dados

O portal do atleta envia `painZones` como regiões normalizadas, `painSides` como mapa região/lado e `painDetails` para preservar cada seleção. O endpoint atual mescla os campos recebidos no diário do atleta/data. O app do treinador lê esses dados no preenchimento manual, no painel do wellness, no histórico individual e no dashboard de avaliações.

Registros antigos em texto com sufixo `(Dir)` ou `(Esq)` continuam legíveis e são normalizados no formulário do treinador. Sem lado disponível, a interface mostra “Lado não informado”.

## Escopo e validação

A alteração cobre a sincronização da dor, sem reorganizar as áreas principais do app. O seletor permite direita, esquerda, ambos ou lado não informado. A intensidade aparece apenas quando existe ao menos uma região dolorida; sem dor, o valor salvo de soreness fica em 1.

O ZIP foi conferido quanto à integridade e aos arquivos incluídos. Não foi feito teste autenticado no Firebase nem validação visual na Preview do Vercel. A tentativa de criar uma branch pelo conector GitHub foi bloqueada com erro 403; nada foi gravado no repositório nem publicado.

