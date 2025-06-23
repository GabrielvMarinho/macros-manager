import { useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import getApi from "@/utils/api";
import fetchWrapper from "@/utils/fetchWrapper";
import { MacroBox } from "./macroBox";
import { MacroBoxDashboard } from "./MacroBoxDashboard";



export default function Dashboard({json, api, executandoMap, progressoMap, listProcess, processesLastMessage, queryValueAgain}){

  



  

  // useEffect(() => {
  //   async function AwaitApi(){
  //     setApi(await getApi())
  //   }
  //   AwaitApi()
    
  // }, [api]);

  return (
   <>
    <h1 className="pageTitle">{json.dashboard}</h1>
        <div className="dashboardMacroContainer">
          {Object.entries(listProcess).map(([key, value]) => {
            const file = value["file"]
            const section = value["section"]
            const executando = executandoMap[section+file]
            const progresso = progressoMap[section+file]
            return (
              <MacroBoxDashboard
              progresso={progresso}
                json={json}
                executando={executando}
                section={section}
                lastMessage={processesLastMessage[key]}
                file={file}
                stopMacro={api?.stop_macro}
                queryValueAgain={queryValueAgain}
              />
            );
          })}
          
    </div>
   </> 
  );
    
}