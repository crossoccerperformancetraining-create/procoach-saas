# ProCoach V2106 + Athlete V4.3

## Novidades principais
- Plano individual de desenvolvimento com metas, progresso, prazos, exercícios e vídeos vinculados.
- Academia individual completa: séries, repetições, carga alvo, descanso, observação, GIF animado e vídeo demonstrativo.
- GIF de academia por link ou upload para Firebase Storage.
- Atleta registra carga realmente utilizada.
- Check-in: Cheguei, Iniciei, Concluí.
- Atleta pode gravar/enviar vídeo da execução para avaliação da comissão (Firebase Storage).
- Avaliação da comissão: Aprovado, Corrigir, Regravar, nota 0–5 e comentário.
- Confirmações de reunião/convocação: Confirmo presença, Tenho problema, Falar com comissão.
- Caixa de mensagens individual treinador ↔ atleta.
- Metas semanais: sessões individuais, vídeos e PSQ.
- Central de pendências da comissão.
- Painel do dia com PSQ, dor, disponibilidade, prontidão, vídeos e atividades pendentes.
- Alertas inteligentes: dor ≥ 3/5, atleta limitado/indisponível, prontidão baixa e dor pós-treino acima da dor pré-treino.
- Histórico de desenvolvimento conectado ao Perfil 360°.
- FCM Push preparado com token no Athlete + Cloud Function pronta para deploy.

## Firebase
O Firestore continua usando a regra segura em que o Athlete só altera `responses` e `lastAthleteUpdate`.
Para GIFs e vídeos enviados pelo atleta, ative o Firebase Storage e publique `storage.rules`.
Para push com o app fechado, siga `FCM-SETUP.md`.
