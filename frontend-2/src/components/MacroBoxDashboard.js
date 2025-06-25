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
    <Card title={file} extra={<ManageLists api={api} section={section} file={file}/>} className={`macroBox ${executando ? "macroAcionada" : ""}`} id={file}>
    
    

      
        <div style={{ display: "flex", alignItems:"center", justifyContent:"center", gap: "10px", flexDirection: "column", width: "100%" }}>
                    <label>{progresso !== null ? `${Math.round(progresso)}%` : "executing..."}</label>
                    <div className="loading-container">
                      <div
                        className="loading-bar"
                        style={{
                          width: `${progresso || 0}%`,
                          backgroundColor: "black",
                        }}
                      ></div>
                    </div>
                    <Button type="primary" danger size="medium"
                      id={"cancelButton_" + file}
                      className="cancelButtonMacro"
                      onClick={() =>{cancelMacroAndUpdate(() =>stopMacro(section, file), file, json, queryValueAgain)}}
                    >
                          {json.cancel_macro}
              </Button>
        
                  </div>
      

     

    </Card>
  );
}
