const {json,verifyAthlete,athletePayload}=require('./_lib');
module.exports=async(req,res)=>{try{
 if(req.method!=='GET')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
 const {workspaceId,playerId}=req.query||{},ctx=await verifyAthlete(req,workspaceId,playerId);
 return json(res,200,await athletePayload(ctx));
}catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}};