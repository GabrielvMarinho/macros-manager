
import { MacroBoxDashboard } from "./MacroBoxDashboard";
import { Empty } from "antd";
import Refresh from "@/icons/Refresh";


export default function Dashboard({json, api, executingMap, progressoMap, listProcess, processesLastMessage, queryValueAgain}){


  return (
   <>
    <div style={{display:"flex", gap:"10px"}}>
      <h1 className="pageTitle">{json.dashboard}</h1>
      <div onClick={() =>queryValueAgain()}> 
        <Refresh></Refresh>
      </div>

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
                key={key}
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
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={json.no_macros_running}></Empty>

          } 
    </div>
   </> 
  );
    
}