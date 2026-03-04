
const express=require("express");
const http=require("http");
const WebSocket=require("ws");
const path=require("path");

const app=express();
const server=http.createServer(app);
const wss=new WebSocket.Server({server});

app.use(express.static(path.join(__dirname,"public")));

let players={};
let questions=[
 {q:"Why might online learning reduce collaboration?",a:"interaction"},
 {q:"Give one advantage of traditional classrooms.",a:"social"},
 {q:"Why is critical thinking important in debates?",a:"evaluate"},
 {q:"What skill helps students organise arguments?",a:"structure"},
 {q:"Why should writers consider counterarguments?",a:"balance"},
 {q:"What helps readers trust an article?",a:"evidence"}
];

let currentBattle=null;

function broadcast(){
 const payload=JSON.stringify({type:"state",players,currentBattle});
 wss.clients.forEach(c=>c.readyState===1 && c.send(payload));
}

wss.on("connection",ws=>{
 ws.on("message",msg=>{
  try{
   const data=JSON.parse(msg);

   if(data.type==="join"){
     players[data.name]={gold:0};
     broadcast();
   }

   if(data.type==="startBattle"){
     const q=questions[Math.floor(Math.random()*questions.length)];
     currentBattle={attacker:data.attacker,defender:data.defender,question:q.q,answer:q.a};
     broadcast();
   }

   if(data.type==="answer"){
     if(!currentBattle)return;

     const correct=data.answer.toLowerCase().includes(currentBattle.answer);

     if(correct){
        players[data.name].gold+=2;

        if(data.name===currentBattle.attacker){
            if(players[currentBattle.defender].gold>0){
                players[currentBattle.defender].gold--;
                players[currentBattle.attacker].gold++;
            }
        }
     }

     currentBattle=null;
     broadcast();
   }

  }catch(e){}
 });
});

const PORT=process.env.PORT||10000;
server.listen(PORT,()=>{
 console.log("Battle classroom game running on "+PORT);
});
