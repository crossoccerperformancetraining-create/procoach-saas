const {admin,db,json,verifyAthlete,safeObj,safeArr}=require('./_lib');
const cleanId=v=>String(v||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,160);
module.exports=async(req,res)=>{
 try{
  if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
  const {workspaceId,playerId,action,payload={},date,clientMutationId}=req.body||{},ctx=await verifyAthlete(req,workspaceId,playerId),pid=ctx.playerId,ref=ctx.ref,body=safeObj(payload);
  const mutationId=cleanId(clientMutationId||body.clientMutationId),mutationRef=mutationId?ref.collection('athleteMutations').doc(mutationId):null;
  const day=String(date||new Date().toISOString().slice(0,10)),now=new Date().toISOString();
  const allowed=['wellness','agendaAck','water','rpe','notificationAck','postGame','medicalRequest','appointmentResponse','commitmentResponse','consentAck','routineProgress','cycleHealth','medicationAck'];
  if(!allowed.includes(action))return json(res,400,{error:'ACTION_NOT_ALLOWED'});
  if(action==='routineProgress'&&!safeObj(body.state).assignmentId)return json(res,400,{error:'ASSIGNMENT_REQUIRED'});
  const outcome=await db.runTransaction(async tx=>{
   if(mutationRef){const marker=await tx.get(mutationRef);if(marker.exists)return {deduplicated:true};}
   const privateAction=action==='cycleHealth'||action==='medicationAck';
   const rootSnap=privateAction?null:await tx.get(ref),data=rootSnap?.data()||{};
   if(['wellness','agendaAck','water','rpe'].includes(action)){
    const old=safeObj(safeObj(safeObj(data.trainingLog)[day])[pid]),clean={...body};delete clean.clientMutationId;delete clean.period;
    tx.update(ref,new admin.firestore.FieldPath('trainingLog',day,pid),{...old,...clean,updatedAt:now,source:'athlete-secure'});
   }else if(action==='notificationAck'){
    tx.update(ref,new admin.firestore.FieldPath('athleteNotificationReads',pid,String(body.notificationId||'broadcast').slice(0,180)),now);
   }else if(action==='postGame'){
    tx.update(ref,new admin.firestore.FieldPath('postGameResponses',day,pid),{...body,submittedAt:now,source:'athlete-secure'});
   }else if(action==='medicalRequest'){
    const all={...safeObj(data.athleteRequests)},rows=safeArr(all[pid]);all[pid]=[{...body,createdAt:body.createdAt||now,clientMutationId:mutationId||null},...rows].slice(0,100);tx.update(ref,{athleteRequests:all});
   }else if(action==='appointmentResponse'){
    tx.update(ref,{careAppointments:safeArr(data.careAppointments).map(x=>x.id===body.appointmentId?{...x,athleteResponse:body.response,athleteRespondedAt:now}:x)});
   }else if(action==='commitmentResponse'){
    const all={...safeObj(data.commitmentResponses)},row={...safeObj(all[body.commitmentId])};row[pid]={response:body.response,by:'athlete',at:now};all[body.commitmentId]=row;tx.update(ref,{commitmentResponses:all});
   }else if(action==='consentAck'){
    const all={...safeObj(data.consentRecords)},athlete={...safeObj(all[pid])},row={...safeObj(athlete[body.templateId])};row.athlete={accepted:!!body.accepted,version:body.version||'',at:now,uid:ctx.user.uid};athlete[body.templateId]=row;all[pid]=athlete;tx.update(ref,{consentRecords:all});
   }else if(action==='routineProgress'){
    const state=safeObj(body.state);tx.update(ref,new admin.firestore.FieldPath('athleteRoutineProgress',pid,String(state.assignmentId)),{...state,updatedAt:now});
   }else if(action==='cycleHealth'){
    const privateRef=ref.collection('privateHealth').doc(pid),snap=await tx.get(privateRef),old=snap.exists?snap.data():{};tx.set(privateRef,{menstrualLogs:{...safeObj(old.menstrualLogs),[day]:{...body,recordedAt:now}}},{merge:true});
   }else if(action==='medicationAck'){
    const privateRef=ref.collection('privateHealth').doc(pid),snap=await tx.get(privateRef),old=snap.exists?snap.data():{},all={...safeObj(old.medicationAdherence)},med={...safeObj(all[body.medicationId])},key=day+'_'+String(body.timeKey||'').replace(':','');med[key]={status:body.status||'Confirmado',at:now};all[body.medicationId]=med;tx.set(privateRef,{medicationAdherence:all},{merge:true});
   }
   if(mutationRef)tx.create(mutationRef,{action,playerId:pid,createdAt:admin.firestore.FieldValue.serverTimestamp()});
   return {deduplicated:false};
  });
  return json(res,200,{ok:true,action,deduplicated:!!outcome.deduplicated,updatedAt:now});
 }catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}
};
