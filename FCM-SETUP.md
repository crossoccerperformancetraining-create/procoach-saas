# ProCoach Athlete V4.3 — FCM / Storage

## 1. Firebase Storage
No Firebase Console do projeto `procoachoficial`, abra **Storage** e ative o bucket padrão.
Depois publique o arquivo `storage.rules` deste pacote.

Isso libera:
- comissão: GIFs/imagens de academia em `trainingMedia/{coachUid}/...`;
- atleta: vídeos próprios em `athleteUploads/{athleteUid}/...`.

## 2. Chave VAPID do FCM
No Firebase Console:
**Configurações do projeto → Cloud Messaging → Web Push certificates**.
Crie/obtenha a chave pública e cole em `procoach-fcm-config.js`:

```js
window.PROCOACH_VAPID_KEY = 'SUA_CHAVE_PUBLICA_VAPID';
```

A chave VAPID pública não é uma senha.

## 3. Cloud Function de push
A pasta `functions/` contém `procoachAthletePush`.
Com Firebase CLI configurado no projeto:

```bash
firebase deploy --only functions:procoachAthletePush
```

A função dispara push quando entra nova atividade, vídeo, programa de academia ou mensagem no `athletePortal`.

## 4. Regras Firestore
O arquivo `firestore.rules` mantém o padrão atual:
- comissão controla o perfil do atleta;
- atleta anônimo só altera `responses` e `lastAthleteUpdate`.

## 5. Teste
1. Abra o Athlete e vá em **Docs → Ativar FCM Push**.
2. Aceite as notificações.
3. No painel, envie uma nova atividade/vídeo ao atleta.
4. Feche o Athlete e confirme a notificação em segundo plano.
