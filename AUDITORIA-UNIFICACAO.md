# Auditoria da unificação ProCoach 213

A base escolhida é o ProCoach SaaS, porque já centraliza os elencos, o portal do atleta e a sincronização por workspace. O app de futebol contribui com rotinas de treino, prancheta e visão da base. As funções foram adicionadas à estrutura atual do SaaS, preservando cadastro e portal existentes.

| Área | Incluído na unificação |
|---|---|
| Operação | Central, inteligência, alertas, microciclo, treino, calendário, vídeos, temporada, biblioteca, Estúdio de treino, modelos, sequências, quadro semanal e diário do treinador |
| Elenco | Cadastro, perfil 360°, contratos e alertas, documentos, família/consentimentos, wellness, PSE/RPE, frequência, grupos e notificações |
| Performance | Avaliações físicas, metas, notas semanais do treinador, Top 5, sugestão de escalação por formação e posição, convocação, jogos, minutagem, pós-jogo e relatórios |
| DM | DM/RTP existente, agenda clínica e estoque básico com quantidades, mínimos, validade e entradas/saídas |
| Tática e conteúdo | Nova prancheta com seleção de atletas, ajustes direcionais, quadros guardados e exportação PNG; vídeos existentes continuam aceitando envio individual, por setor ou coletivo |
| Clube e base | Radar resumido por equipes do mesmo clube, calendário agregado e propostas de promoção/convocação para revisão humana |
| Administração | Acessos, auditoria, configurações, integrações e backups existentes |

## Notas e escalação sugerida

A nota de 1 a 5 é do treinador e não substitui o RPE/PSE informado pelo atleta. O Top 5 considera as notas dos últimos sete dias. A sugestão tenta preencher a formação 4-3-3, 4-4-2 ou 3-5-2 com base nas posições cadastradas; posições ausentes são completadas pelos melhores avaliados disponíveis. A decisão final continua com o treinador.

## Respostas do atleta

O portal já envia `clientMutationId` nas ações seguras. O endpoint atualizado grava a resposta e o marcador na mesma transação do Firestore, reduzindo duplicações quando uma operação é repetida após falha de rede. A sincronização real deve ser confirmada na Preview com Firebase.

## Situação

O pacote foi reconstituído nesta conversa a partir do ZIP base 211 salvo na Library e preparado como versão 213. A integração GitHub retorna 403 ao criar a branch; não há branch, PR ou deploy de Preview. Foram conferidos a sintaxe dos endpoints JavaScript, o JSON do manifesto e a integridade do ZIP. Não foi feito teste autenticado nem revisão visual no Vercel.
