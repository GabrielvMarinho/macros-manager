import { useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import getApi from "@/utils/api";
import fetchWrapper from "@/utils/fetchWrapper";
import { MacroBox } from "./macroBox";
import { MacroBoxDashboard } from "./MacroBoxDashboard";
import Refresh from "@/icons/refresh.png"
import { Empty } from "antd";


export default function Dashboard({json, api, executingMap, progressoMap, listProcess, processesLastMessage, queryValueAgain}){


  return (
   <>
    <div style={{display:"flex", gap:"10px"}}>
      <h1 className="pageTitle">{json.dashboard}</h1>
      <img style={{marginTop:"5px"}} onClick={() =>queryValueAgain()} className="icon" src={Refresh}></img>
    </div>
        <div className="dashboardMacroContainer">
          {Object.entries(listProcess).length >0 ?
            Object.entries(listProcess).map(([key, value]) => {
              const file = value["file"]
              const section = value["section"]
              const executing = executingMap[section+file]
              const progresso = progressoMap[section+file]
              return (
                <MacroBoxDashboard
                api={api}
                progresso={progresso}
                  json={json}
                  executando={executing}
                  section={section}
                  lastMessage={processesLastMessage[key]}
                  file={file}
                  stopMacro={api?.stop_macro}
                  queryValueAgain={queryValueAgain}
                />
              );
            })
          :
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Macros Running"></Empty>

          } 
    </div>
   </> 
  );
    
}