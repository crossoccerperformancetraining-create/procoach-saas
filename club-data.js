const {db,json,requireUser,safeObj,safeArr}=require('./_lib');
const dayKey=value=>String(value||'').slice(0,10);
module.exports=async(req,res)=>{
 try{
  if(req.method!=='GET')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
  const user=await requireUser(req),clubId=String(req.query?.clubId||'').trim();
  if(!clubId)return json(res,400,{error:'CLUB_LINK_REQUIRED'});
  const cut=new Date();cut.setDate(cut.getDate()-28);
  const cutoff=cut.getFullYear()+'-'+String(cut.getMonth()+1).padStart(2,'0')+'-'+String(cut.getDate()).padStart(2,'0');
  const snap=await db.collection('coachData').where('ownerUid','==',user.uid).limit(50).get();
  const teams=snap.docs.map(doc=>{
   const d=doc.data()||{},org=safeObj(d.organization),header=safeObj(d.header);
   const players=safeArr(d.players).map((p,i)=>{
    const id=String(p?.id||('player_'+i)),notes=Object.entries(safeObj(d.coachTrainingRatings)).filter(([date])=>date>=cutoff).map(([,row])=>Number(safeObj(row)[id])).filter(n=>n>=1&&n<=5);
    const attendance=Object.entries(safeObj(d.attendanceLog)).filter(([date])=>date>=cutoff).map(([,row])=>safeObj(row)[id]??safeObj(row)[String(i)]).filter(v=>v!==undefined&&v!=='');
    const attended=attendance.filter(v=>['p','t','present','presente','ok','true','1'].includes(String(v).toLowerCase())).length;
    const dmReview=safeArr(d.dmRecords).some(r=>(String(r?.playerUid||'')===id||String(r?.playerId||'')===id)&&!r.returnedAt&&r.status!=='Closed');
    return {id,name:String(p?.name||`Atleta ${i+1}`),position:String(p?.position||p?.pos||''),rating28:notes.length?Math.round(notes.reduce((a,b)=>a+b,0)/notes.length*10)/10:null,attendance28:attendance.length?Math.round(attended/attendance.length*100):null,medicalReview:dmReview};
   });
   const name=String(org.name||org.shortName||header.teamName||doc.id),events=[];
   safeArr(d.clubCalendarEvents).forEach(e=>events.push({id:String(e.id||'event'),title:String(e.title||'Evento'),date:dayKey(e.date),team:name}));
   Object.entries(safeObj(d.exerciseHistory)).forEach(([date,items])=>{if(safeArr(items).length)events.push({id:`training_${doc.id}_${date}`,title:'Treino planejado',date,team:name})});
   const game=safeObj(d.nextGame);if(game.date)events.push({id:`game_${doc.id}`,title:'Jogo vs '+String(game.opponent||'adversário'),date:dayKey(game.date),team:name});
   return {workspaceId:doc.id,clubId:String(org.clubId||''),name,category:String(org.category||''),players,events};
  }).filter(t=>t.clubId===clubId).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  return json(res,200,{ok:true,asOf:new Date().toISOString(),teams});
 }catch(e){console.error(e);return json(res,e.status||500,{error:e.message||'SERVER_ERROR'})}
};
