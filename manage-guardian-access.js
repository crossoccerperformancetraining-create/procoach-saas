const {json,requireUser,workspaceContext,roleOf,can,findPlayer,newInviteToken,tokenHash,origin,safeObj}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const user=await requireUser(req),{workspaceId,playerId,email,guardianName,relationship}=req.body||{},ctx=await workspaceContext(workspaceId),role=roleOf(ctx.data,user);
 if(!can(role,'access')&&!can(role,'consent'))return json(res,403,{error:'ACCESS_PERMISSION_REQUIRED'});
 const found=findPlayer(ctx.data,playerId),token=newInviteToken(),all={...safeObj(ctx.data.guardianAccess)};
 all[found.playerId]={...safeObj(all[found.playerId]),email:String(email||'').trim().toLowerCase(),guardianName:guardianName||'',relationship:relationship||'',enabled:true,status:'invited',inviteHash:tokenHash(token),invitedBy:user.uid,invitedAt:new Date().toISOString()};
 await ctx.ref.update({guardianAccess:all});
 const inviteUrl=`${origin(req)}/atleta.html?id=${encodeURIComponent(workspaceId)}&uid=${encodeURIComponent(found.playerId)}&guardian=1&secure=1&guardianInvite=${encodeURIComponent(token)}&v=209`;
 return json(res,200,{ok:true,inviteUrl});
}catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};