const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

function ids(list) {
  return new Set(Array.isArray(list) ? list.map(x => String(x && x.id || '')) : []);
}

exports.procoachAthletePush = onDocumentUpdated('athletePortal/{accessToken}', async event => {
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  const token = after.responses && after.responses.push && after.responses.push.token;
  if (!token) return;

  const beforeActivities = ids(before.activities);
  const beforeVideos = ids(before.videos);
  const beforeMessages = ids(before.messages);
  const beforeGym = ids(before.gymPrograms);
  const beforeRoutines = ids(before.routineSessions);

  const newActivities = (after.activities || []).filter(x => !beforeActivities.has(String(x.id)));
  const newVideos = (after.videos || []).filter(x => !beforeVideos.has(String(x.id)));
  const newMessages = (after.messages || []).filter(x => !beforeMessages.has(String(x.id)));
  const newGym = (after.gymPrograms || []).filter(x => !beforeGym.has(String(x.id)));
  const newRoutines = (after.routineSessions || []).filter(x => !beforeRoutines.has(String(x.id)));

  let title = '';
  let body = '';
  if (newRoutines.length) {
    title = 'Novo treino no ProCoach';
    body = newRoutines[0].name || 'Sua nova rotina de treino está disponível.';
  } else if (newActivities.length) {
    title = 'Nova atividade no ProCoach';
    body = newActivities[0].title || 'Você recebeu uma nova atividade.';
  } else if (newVideos.length) {
    title = 'Novo vídeo da comissão';
    body = newVideos[0].title || 'Há um novo vídeo para você.';
  } else if (newGym.length) {
    title = 'Novo treino individual';
    body = newGym[0].title || 'Sua sessão de academia foi atualizada.';
  } else if (newMessages.length) {
    title = 'Nova mensagem da comissão';
    body = newMessages[0].text || 'Você recebeu uma nova mensagem.';
  } else {
    return;
  }

  await getMessaging().send({
    token,
    notification: { title, body },
    data: { url: `/atleta.html?token=${event.params.accessToken}` },
    webpush: {
      notification: { icon: '/procoach-icon.svg', badge: '/procoach-icon.svg' }
    }
  });
});
