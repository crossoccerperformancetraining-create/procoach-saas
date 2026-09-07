const {json,verifyGuardian,safeObj}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const {workspaceId,playerId,action,payload={}}=req.body||{},ctx=await verifyGuardian(req,workspaceId,playerId),pid=ctx.playerId,now=new Date().toISOString();
 if(action!=='consentAck')return json(res,400,{error:'ACTION_NOT_ALLOWED'});
 const snap=await ctx.ref.get(),all={...safeObj(snap.data()?.consentRecords)},player={...safeObj(all[pid])},row={...safeObj(player[payload.templateId])};row.guardian={accepted:!!payload.accepted,version:payload.version||'',at:now,uid:ctx.user.uid};player[payload.templateId]=row;all[pid]=player;await ctx.ref.update({consentRecords:all});return json(res,200,{ok:true});
}catch(e){return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};