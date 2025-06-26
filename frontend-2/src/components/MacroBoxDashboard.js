import cancel_macro from "@/utils/cancelMacro";
import onMessageMacro from "@/utils/onMessageMacro";
import { findByLabelText } from "@testing-library/dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useJson } from "./getLanguageJson";
import { Button, Card } from "antd";
import { getPromise, resolvePromise } from "@/utils/toastPromiseManager";
import { wsManager } from "@/utils/WebSocketManager";
import cancelMacroDashboard from "@/utils/cancelMacroDashboard";
import cancelMacroAndUpdate from "@/utils/cancelMacroDashboard";
import ManageLists from "./ManageLists";

export function MacroBoxDashboard({ api, json, lastMessage, section, file, stopMacro, executando, progresso, queryValueAgain }) {

  
    
  
  if(!executando){
    return <></>
  }
  return (
    <Card title={file} extra={<ManageLists api={api} section={section} file={file}/>} className={`macroBox`} id={file}>
    
    

      
        <div>
          <div style={{display:"flex", gap:"10px", justifyContent:"space-between"}}>
            
          <Button type="primary" danger size="medium"
          id={"cancelButton_" + file}
          className="cancelButtonMacro"
          
          onClick={() =>{cancelMacroAndUpdate(() =>stopMacro(section, file), file, json, queryValueAgain)}}
          >
            {json.cancel_macro}
          </Button>
          <div style={{display:"flex", gap:"10px", width:"60%", alignItems:"center"}}>
            <label className="label-loading-bar">{progresso !== null ? `${Math.round(progresso)}%` : "0%"}</label>
              <div className="loading-container">
                <div
                    className="loading-bar"
                    style={{
                      width: `${progresso || 0}%`,
                      backgroundColor: "black",
                    }}
                  ></div>
              </div>
            </div>
          </div>


        </div>
     

    </Card>
  );
}
