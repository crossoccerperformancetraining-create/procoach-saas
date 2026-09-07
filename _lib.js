const admin=require('firebase-admin');
const crypto=require('crypto');

function initAdmin(){
  if(admin.apps.length)return admin;
  let credential;
  if(process.env.FIREBASE_SERVICE_ACCOUNT_JSON){
    const raw=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if(raw.private_key)raw.private_key=raw.private_key.replace(/\\n/g,'\n');
    credential=admin.credential.cert(raw);
  }else if(process.env.FIREBASE_PROJECT_ID&&process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY){
    credential=admin.credential.cert({
      projectId:process.env.FIREBASE_PROJECT_ID,
      clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')
    });
  }else{
    credential=admin.credential.applicationDefault();
  }
  admin.initializeApp({credential,projectId:process.env.FIREBASE_PROJECT_ID||'prosaude-e9130'});
  return admin;
}
initAdmin();
const db=admin.firestore();

const json=(res,status,payload)=>res.status(status).setHeader('cache-control','no-store').json(payload);
const bearer=req=>String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
async function requireUser(req){
  const token=bearer(req);if(!token)throw Object.assign(new Error('AUTH_REQUIRED'),{status:401});
  try{return await admin.auth().verifyIdToken(token)}catch(_){throw Object.assign(new Error('TOKEN_INVALID'),{status:401})}
}
const emailKey=email=>String(email||'').trim().toLowerCase();
const safeObj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const safeArr=v=>Array.isArray(v)?v:[];
const roleOf=(workspace,user)=>{
  if(!user)return'viewer';
  if(workspace.ownerUid===user.uid)return'owner';
  return safeObj(workspace.memberRoles)[emailKey(user.email)]?.role||'viewer';
};
const ROLE_PERMS={
  owner:['*'],admin:['dashboard','squad','training','performance','medical','clinical','care','consent','integration','scout','reports','director','access','clubs'],
  headCoach:['dashboard','squad','training','performance','scout','reports'],performance:['dashboard','squad','training','performance','reports'],
  medical:['dashboard','squad','medical','clinical','care','performance','reports'],nutrition:['dashboard','squad','clinical','care','reports'],
  psychology:['dashboard','squad','clinical','care','reports'],analyst:['dashboard','squad','performance','scout','reports'],director:['director','reports'],viewer:['dashboard','reports']
};
const can=(role,perm)=>safeArr(ROLE_PERMS[role]).includes('*')||safeArr(ROLE_PERMS[role]).includes(perm);
async function workspaceContext(workspaceId){
  if(!workspaceId)throw Object.assign(new Error('WORKSPACE_REQUIRED'),{status:400});
  const ref=db.collection('coachData').doc(String(workspaceId)),snap=await ref.get();
  if(!snap.exists)throw Object.assign(new Error('WORKSPACE_NOT_FOUND'),{status:404});
  return{ref,data:snap.data()};
}
function findPlayer(data,playerId){
  const key=String(playerId||'');
  const players=safeArr(data.players);
  const index=players.findIndex((p,i)=>String(p?.id||i)===key||safeArr(p?.legacyIds).map(String).includes(key));
  if(index<0)throw Object.assign(new Error('PLAYER_NOT_FOUND'),{status:404});
  return{player:players[index],index,playerId:String(players[index]?.id||key)};
}
const tokenHash=token=>crypto.createHash('sha256').update(String(token||'')).digest('hex');
const newInviteToken=()=>crypto.randomBytes(32).toString('base64url');
function origin(req){
  const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0];
  const host=req.headers['x-forwarded-host']||req.headers.host;
  return `${proto}://${host}`;
}
function mapDateForPlayer(source,pid,index){
  const out={};Object.entries(safeObj(source)).forEach(([date,row])=>{
    const r=safeObj(row),value=r[pid]??r[String(index)];
    if(value!==undefined)out[date]={[pid]:value};
  });return out;
}
function mapForPlayer(source,pid,index){
  const s=safeObj(source),value=s[pid]??s[String(index)];
  return value===undefined?{}:{[pid]:value};
}
function filterRoutineAssignments(items,pid,player,data){
  const groups=safeArr(data.athleteGroups);
  return safeArr(items).filter(item=>{
    if(item?.archivedAt)return false;
    const ids=safeArr(item?.recipientIds).map(String);
    if(ids.length)return ids.includes(String(pid));
    if(item?.targetType==='team')return true;
    if(item?.targetType==='athlete')return String(item?.target||'')===String(pid)||String(item?.target||'').trim().toLowerCase()===String(player?.name||'').trim().toLowerCase();
    if(item?.targetType==='group'){
      const t=String(item?.target||'').trim().toLowerCase();
      const g=groups.find(g=>String(g.id)===String(item?.target)||String(g.name||'').trim().toLowerCase()===t);
      return safeArr(g?.playerIds||g?.recipientIds).map(String).includes(String(pid));
    }
    return false;
  });
}
async function verifyAthlete(req,workspaceId,playerId){
  const user=await requireUser(req),ctx=await workspaceContext(workspaceId),found=findPlayer(ctx.data,playerId);
  const access=safeObj(ctx.data.athleteAccess)[found.playerId]||safeObj(ctx.data.athleteAccess)[String(playerId)]||{};
  if(!access.enabled||access.authUid!==user.uid)throw Object.assign(new Error('ATHLETE_ACCESS_DENIED'),{status:403});
  return{user,...ctx,...found,access};
}
async function verifyGuardian(req,workspaceId,playerId){
  const user=await requireUser(req),ctx=await workspaceContext(workspaceId),found=findPlayer(ctx.data,playerId);
  const access=safeObj(ctx.data.guardianAccess)[found.playerId]||{};
  if(!access.enabled||access.authUid!==user.uid)throw Object.assign(new Error('GUARDIAN_ACCESS_DENIED'),{status:403});
  return{user,...ctx,...found,access};
}
async function athletePayload(ctx){
  const {data,player,index,playerId}=ctx;
  const privateSnap=await ctx.ref.collection('privateHealth').doc(playerId).get().catch(()=>null);
  const privateHealth=privateSnap?.exists?privateSnap.data():{};
  const reads=safeObj(data.athleteNotificationReads)[playerId]||{};
  const requests=safeObj(data.athleteRequests)[playerId]||[];
  const documents=safeObj(data.athleteDocuments)[playerId]||[];
  const consent=safeObj(data.consentRecords)[playerId]||{};
  const routineProgress=safeObj(data.athleteRoutineProgress)[playerId]||{};
  const commitments={};
  Object.entries(safeObj(data.commitmentResponses)).forEach(([cid,row])=>{const v=safeObj(row)[playerId];if(v!==undefined)commitments[cid]={[playerId]:v}});
  return{
    workspaceId:ctx.ref.id,dataSchemaVersion:data.dataSchemaVersion||8,players:[player],
    trainingLog:mapDateForPlayer(data.trainingLog,playerId,index),
    exercises:safeArr(data.exercises),exerciseHistory:mapForPlayer(data.exerciseHistory,playerId,index),
    activationExercises:safeArr(data.activationExercises),
    dmRecords:safeArr(data.dmRecords).filter(r=>String(r?.playerUid||'')===playerId||Number(r?.playerId)===index),
    assessments:mapForPlayer(data.assessments,playerId,index),
    matchMinutes:mapDateForPlayer(data.matchMinutes,playerId,index),
    postGameResponses:mapDateForPlayer(data.postGameResponses,playerId,index),
    externalMetrics:mapDateForPlayer(data.externalMetrics,playerId,index),
    postWorkout:data.postWorkout||'IA',nextGame:data.nextGame||{},coachMsg:data.coachMsg||data.coachMessage||'',
    themeColor:data.themeColor||'#1e3a8a',videoUrl:data.videoUrl||'',logo:data.logo||null,
    teamName:data.header?.teamName||data.organization?.shortName||'PROCOACH',days:safeArr(data.days),
    lastAlertSent:data.lastAlertSent||0,trainingStatus:data.trainingStatus||'pre',
    notificationCenter:safeArr(data.notificationCenter).filter(n=>!n.target||n.target==='all'||String(n.target)===playerId),
    athleteDocuments:documents,athleteRequests:requests,athleteNotificationReads:reads,
    careAppointments:safeArr(data.careAppointments).filter(x=>!x.playerId||String(x.playerId)===playerId),
    teamCommitments:safeArr(data.teamCommitments).filter(c=>!safeArr(c.recipientIds).length||safeArr(c.recipientIds).map(String).includes(playerId)),
    commitmentResponses:commitments,
    consentTemplates:safeArr(data.consentTemplates).filter(t=>t.active!==false&&['athlete','both'].includes(t.audience||'both')),
    consentRecords:consent,privateHealth,
    videoAssignments:safeArr(data.videoAssignments).filter(v=>!v.archivedAt&&safeArr(v.recipientIds).map(String).includes(playerId)),
    routineAssignments:filterRoutineAssignments(data.routineAssignments,playerId,player,data),
    athleteRoutineProgress:routineProgress
  };
}
module.exports={admin,db,json,requireUser,workspaceContext,roleOf,can,findPlayer,tokenHash,newInviteToken,origin,safeObj,safeArr,verifyAthlete,verifyGuardian,athletePayload,emailKey};
