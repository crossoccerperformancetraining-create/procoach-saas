const {admin,db,json,verifyAthlete,safeObj,safeArr}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const {workspaceId,playerId,action,payload={},date,clientMutationId}=req.body||{};
 const ctx=await verifyAthlete(req,workspaceId,playerId),pid=ctx.playerId,ref=ctx.ref;
 const mutationId=String(clientMutationId||payload.clientMutationId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,160);
 if(mutationId){const mref=ref.collection('athleteMutations').doc(mutationId),ms=await mref.get();if(ms.exists)return json(res,200,{ok:true,deduplicated:true})}
 const now=new Date().toISOString(),day=String(date||new Date().toISOString().slice(0,10));
 if(['wellness','agendaAck','water','rpe'].includes(action)){
   await db.runTransaction(async tx=>{
     const snap=await tx.get(ref),data=snap.data()||{},row=safeObj(safeObj(data.trainingLog)[day]),current=safeObj(row[pid]);
     const clean={...payload};delete clean.clientMutationId;delete clean.period;
     tx.update(ref,new admin.firestore.FieldPath('trainingLog',day,pid),{...current,...clean,updatedAt:now,source:'athlete-secure'});
     if(mutationId)tx.set(ref.collection('athleteMutations').doc(mutationId),{action,playerId:pid,createdAt:admin.firestore.FieldValue.serverTimestamp()});
   });
 }else if(action==='notificationAck'){
   const id=String(payload.notificationId||'broadcast').slice(0,180);
   await ref.update(new admin.firestore.FieldPath('athleteNotificationReads',pid,id),now);
 }else if(action==='postGame'){
   await ref.update(new admin.firestore.FieldPath('postGameResponses',day,pid),{...payload,submittedAt:now,source:'athlete-secure'});
 }else if(action==='medicalRequest'){
   const snap=await ref.get(),all={...safeObj(snap.data()?.athleteRequests)},rows=safeArr(all[pid]);
   all[pid]=[{...payload,createdAt:payload.createdAt||now},...rows].slice(0,100);await ref.update({athleteRequests:all});
 }else if(action==='appointmentResponse'){
   const snap=await ref.get(),rows=safeArr(snap.data()?.careAppointments).map(x=>x.id===payload.appointmentId?{...x,athleteResponse:payload.response,athleteRespondedAt:now}:x);await ref.update({careAppointments:rows});
 }else if(action==='commitmentResponse'){
   const snap=await ref.get(),all={...safeObj(snap.data()?.commitmentResponses)},row={...safeObj(all[payload.commitmentId])};row[pid]={response:payload.response,by:'athlete',at:now};all[payload.commitmentId]=row;await ref.update({commitmentResponses:all});
 }else if(action==='consentAck'){
   const snap=await ref.get(),all={...safeObj(snap.data()?.consentRecords)},player={...safeObj(all[pid])},row={...safeObj(player[payload.templateId])};row.athlete={accepted:!!payload.accepted,version:payload.version||'',at:now,uid:ctx.user.uid};player[payload.templateId]=row;all[pid]=player;await ref.update({consentRecords:all});
 }else if(action==='routineProgress'){
   const state=safeObj(payload.state);if(!state.assignmentId)return json(res,400,{error:'ASSIGNMENT_REQUIRED'});
   await ref.update(new admin.firestore.FieldPath('athleteRoutineProgress',pid,String(state.assignmentId)),{...state,updatedAt:now});
 }else if(action==='cycleHealth'){
   await ref.collection('privateHealth').doc(pid).set({menstrualLogs:{[day]:{...payload,recordedAt:now}}},{merge:true});
 }else if(action==='medicationAck'){
   const ph=ref.collection('privateHealth').doc(pid),snap=await ph.get(),d=snap.exists?snap.data():{},adh={...safeObj(d.medicationAdherence)},med={...safeObj(adh[payload.medicationId])},key=`${day}_${String(payload.timeKey||'').replace(':','')}`;med[key]={status:payload.status||'Confirmado',at:now};adh[payload.medicationId]=med;await ph.set({medicationAdherence:adh},{merge:true});
 }else return json(res,400,{error:'ACTION_NOT_ALLOWED'});
 if(mutationId&&!['wellness','agendaAck','water','rpe'].includes(action))await ref.collection('athleteMutations').doc(mutationId).set({action,playerId:pid,createdAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
 return json(res,200,{ok:true,action,updatedAt:now});
}catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};