# ProCoach V6.1 — Club & Academy Hub

Principais novidades:
- Dashboard Todas as Equipes
- Radar da Base
- Convocações temporárias e promoções entre categorias
- athleteId único para movimentações
- Calendário geral das categorias
- Temporadas com snapshot/resumo da temporada anterior
- Matriz administrativa de acessos por equipe
- Athlete identifica a categoria no topo

## Segurança dos dados
A Equipe Principal continua usando as chaves históricas. Cada nova equipe permanece isolada por teamId. Promoção mantém o registro da origem como histórico arquivado, evitando reindexação destrutiva dos dados antigos.

## Permissões
A tela Acessos por Equipe é uma matriz administrativa. Para restringir tecnicamente contas diferentes por categoria, ainda é necessário implementar claims/perfis no Firebase Auth e regras correspondentes.
