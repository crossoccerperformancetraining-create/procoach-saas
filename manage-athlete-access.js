const {json,requireUser,workspaceContext,roleOf,can,findPlayer,newInviteToken,tokenHash,origin,safeObj}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const user=await requireUser(req),{workspaceId,playerId,email,playerName}=req.body||{};
 const ctx=await workspaceContext(workspaceId),role=roleOf(ctx.data,user);
 if(!can(role,'access'))return json(res,403,{error:'ACCESS_PERMISSION_REQUIRED'});
 const found=findPlayer(ctx.data,playerId),token=newInviteToken(),access={...safeObj(ctx.data.athleteAccess)};
 access[found.playerId]={...safeObj(access[found.playerId]),email:String(email||'').trim().toLowerCase(),playerName:playerName||found.player.name||'',enabled:true,status:'invited',inviteHash:tokenHash(token),invitedBy:user.uid,invitedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 await ctx.ref.update({athleteAccess:access});
 const inviteUrl=`${origin(req)}/atleta.html?id=${encodeURIComponent(workspaceId)}&uid=${encodeURIComponent(found.playerId)}&secure=1&invite=${encodeURIComponent(token)}&v=209`;
 return json(res,200,{ok:true,inviteUrl,playerId:found.playerId});
}catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};