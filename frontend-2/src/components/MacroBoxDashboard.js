import cancel_macro from "@/utils/cancelMacro";
import onMessageMacro from "@/utils/onMessageMacro";
import { findByLabelText } from "@testing-library/dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useJson } from "./getLanguageJson";
import { Button } from "antd";
import { getPromise, resolvePromise } from "@/utils/toastPromiseManager";
import { wsManager } from "@/utils/WebSocketManager";
import cancelMacroDashboard from "@/utils/cancelMacroDashboard";
export function MacroBoxDashboard({ json, lastMessage, section, file, stopMacro, executando, progresso, queryValueAgain }) {
  // const [executando, setExecutando] = useState(true);
  // const [progresso, setProgresso] = useState(null);
  const socketRef = useRef(null);
  // const {json, language, updateLanguage} = useJson()

    // useEffect(() =>{
        
    //     const socket = wsManager.getWsConnection(section, file)
    //     wsManager.addListener(section, file, (event) =>onMessageMacro(event, null, setExecutando, setProgresso, socket, json, file, () =>{resolvePromise(section, file)}))
        
    //     socketRef.current = socket;
        
    //     // socket.onopen = () => {
    //     //     setProgresso(lastMessage)
    //     //     console.log("WebSocket conectado para macro:", file);
    //     // };

    //     // socket.onmessage = (event) => {
    //     //     console.log("message")
    //     //     onMessageMacro(event, null, setExecutando, setProgresso, socket, json, file, () =>{resolvePromise(section, file)}, setApi)
    //     // };

    //     // socket.onclose = () => {
    //     //     console.log("WebSocket fechado para macro:", file);
    //     // };
    //     // console.log("socket", socket)
    //     // return () => {
    //     //   wsManager.removeListener(section, file, handleMessage);
    //     // };
    // }, [])
    
    
  
  if(!executando){
    return <></>
  }
  return (
    <Button className={`macroBox ${executando ? "macroAcionada" : ""}`} id={file}>
      <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
        <label className="title">{file}</label>
        
      </div>

      
        <div style={{ display: "flex", gap: "5px", flexDirection: "column", width: "100%" }}>
          <label>{progresso !== null ? `${Math.round(progresso)}%` : "Executando..."}</label>
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
      

     

        <Button type="primary" danger size="medium"
          id={"cancelButton_" + file}
          className="cancelButtonMacro"
          onClick={() =>{cancelMacroDashboard(() =>stopMacro(section, file), file, json, queryValueAgain)}}
        >
          {json.cancel_macro}
        </Button>
      
    </Button>
  );
}
