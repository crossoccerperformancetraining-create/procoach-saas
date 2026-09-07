const {json,requireUser,workspaceContext,findPlayer,tokenHash,safeObj}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const user=await requireUser(req),{workspaceId,playerId,inviteToken,email}=req.body||{},ctx=await workspaceContext(workspaceId),found=findPlayer(ctx.data,playerId),all={...safeObj(ctx.data.guardianAccess)},row=safeObj(all[found.playerId]);
 if(!row.enabled||!row.inviteHash||tokenHash(inviteToken)!==row.inviteHash)return json(res,403,{error:'INVITE_INVALID'});
 if(row.email&&String(row.email).toLowerCase()!==String(email||user.email||'').trim().toLowerCase())return json(res,403,{error:'EMAIL_DOES_NOT_MATCH_INVITE'});
 all[found.playerId]={...row,authUid:user.uid,email:user.email||row.email,status:'active',claimedAt:new Date().toISOString()};delete all[found.playerId].inviteHash;await ctx.ref.update({guardianAccess:all});return json(res,200,{ok:true});
}catch(e){return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};