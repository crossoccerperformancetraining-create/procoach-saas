# ProCoach V6.3.1 — Athlete Clean Header

Refinamento visual do ProCoach Athlete V6.3.

## Alterações
- Removido o banner grande “Instalar ProCoach Athlete / Adicionar à tela” da parte superior da tela inicial.
- Cabeçalho superior mais compacto.
- Cartão do atleta e Central do Dia aparecem mais cedo na tela.
- Instalação PWA continua disponível em **Docs**, em um card discreto.
- Em modo PWA instalado, o card informa que o app já está instalado.
- Mantidas as funções da V6.3: PSQ/PSE, academia, vídeos, mensagens, multi-team e complemento por minutagem.
- Cache do service worker atualizado para `procoach-v631-athlete-clean-header`.

## Publicação
Para garantir que a alteração apareça também no app instalado, substitua `atleta.html`, `service-worker.js` e `athlete-manifest.webmanifest`. O pacote completo pode ser publicado sobre a versão V6.3.
