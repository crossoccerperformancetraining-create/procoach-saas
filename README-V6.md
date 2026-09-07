# ProCoach V6 Multi-Team

## O que mudou
- Um único login para várias equipes/categorias.
- A equipe atual existente vira **Equipe Principal** sem mover os dados legados.
- Criar: Sub-12, Sub-15, Sub-17, Sub-20, Sub-23, Profissional ou Personalizada.
- Troca rápida de equipe no menu lateral e no celular.
- Dados das novas equipes ficam separados por `teamId` nas chaves sincronizadas do `coachData`.
- Criar equipe pode copiar identidade/configurações, biblioteca e modelos, sem copiar elenco/histórico/PSQ.
- Gerenciamento: abrir, renomear, duplicar estrutura, arquivar, restaurar e excluir equipes secundárias.
- Portal do Atleta publica `teamId` e `teamCategory` junto do perfil.

## Compatibilidade
As regras atuais do Firestore continuam compatíveis: todas as chaves de equipe continuam no documento `coachData/{uid}` do próprio treinador.

## Segurança
A Equipe Principal não pode ser excluída. Para arquivar uma equipe ativa, troque primeiro para outra equipe.
