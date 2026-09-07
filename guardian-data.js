const {json,verifyGuardian,athletePayload}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='GET')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const ctx=await verifyGuardian(req,req.query?.workspaceId,req.query?.playerId),payload=await athletePayload(ctx);
 delete payload.privateHealth;delete payload.athleteRequests;
 return json(res,200,{...payload,guardianProfile:ctx.access});
}catch(e){return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};