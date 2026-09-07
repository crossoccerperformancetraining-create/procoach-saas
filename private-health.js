const {admin,json,requireUser,workspaceContext,roleOf,findPlayer,safeObj,safeArr}=require('./_lib');
module.exports=async(req,res)=>{try{
 const user=await requireUser(req),workspaceId=req.method==='GET'?req.query?.workspaceId:req.body?.workspaceId,playerId=req.method==='GET'?req.query?.playerId:req.body?.playerId,ctx=await workspaceContext(workspaceId),role=roleOf(ctx.data,user),found=findPlayer(ctx.data,playerId);
 if(!['owner','admin','medical','nutrition','psychology'].includes(role))return json(res,403,{error:'CLINICAL_PERMISSION_REQUIRED'});
 const ref=ctx.ref.collection('privateHealth').doc(found.playerId),snap=await ref.get(),current=snap.exists?snap.data():{};
 if(req.method==='GET'){
   if(role==='nutrition')return json(res,200,{nutritionPlan:current.nutritionPlan||{}});
   return json(res,200,current);
 }
 if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const {action,payload={}}=req.body||{},now=new Date().toISOString();
 if(action==='nutritionPlan'){
   if(!['owner','admin','medical','nutrition'].includes(role))return json(res,403,{error:'NUTRITION_PERMISSION_REQUIRED'});
   await ref.set({nutritionPlan:{...payload,updatedAt:now,updatedBy:user.uid}},{merge:true});
 }else if(action==='medicationUpsert'){
   if(!['owner','admin','medical'].includes(role))return json(res,403,{error:'MEDICAL_PERMISSION_REQUIRED'});
   const id=payload.id||`med_${Date.now()}`,rows=safeArr(current.medications).filter(x=>x.id!==id);rows.unshift({...payload,id,updatedAt:now,updatedBy:user.uid});await ref.set({medications:rows},{merge:true});
 }else if(action==='medicationRemove'){
   if(!['owner','admin','medical'].includes(role))return json(res,403,{error:'MEDICAL_PERMISSION_REQUIRED'});
   await ref.set({medications:safeArr(current.medications).filter(x=>x.id!==payload.id)},{merge:true});
 }else if(action==='clinicalNote'){
   if(!['owner','admin','medical','psychology'].includes(role))return json(res,403,{error:'CLINICAL_PERMISSION_REQUIRED'});
   await ref.set({clinicalNotes:[{...payload,id:`note_${Date.now()}`,createdAt:now,createdBy:user.uid,role},...safeArr(current.clinicalNotes)].slice(0,250)},{merge:true});
 }else return json(res,400,{error:'ACTION_NOT_ALLOWED'});
 const after=await ref.get();return json(res,200,after.data()||{});
}catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};