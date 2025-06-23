import cancelarMacro from "@/utils/cancelMacro";
import onMessageMacro from "@/utils/onMessageMacro";
import { findByLabelText } from "@testing-library/dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useJson } from "./getLanguageJson";
import { Form } from "react-router-dom";
import Table_ from "./Table_";
import { Button } from "antd";
import fetchWrapper from "@/utils/fetchWrapper";
import getApi from "@/utils/api";
import { setPromise } from "@/utils/toastPromiseManager";

export function MacroBox({ process, lastMessage, section, file, startMacro, stopMacro, api }) {
  const [executando, setExecutando] = useState(false);
  const [progresso, setProgresso] = useState(null);
  const socketRef = useRef(null);
  const {json, language, updateLanguage} = useJson()
  const [modal, setModal] = useState(false)

  const [columnsObj, setColumnsObj] = useState()
  const [desc, setDesc] = useState()
  const [fileContent, setFileContent] = useState()
  const [inputForm, setInputForms] = useState({})
  
  const [loading, setLoading] = useState(false)

  useEffect(() =>{
    if(process==true){
        
        const socket = new WebSocket(`ws://localhost:8765/receiver/${section}/${file}`);
        socketRef.current = socket;

        socket.onopen = () => {
          setExecutando(true)
          setProgresso(lastMessage)
        };

        socket.onmessage = (event) => {
          onMessageMacro(event, setLoading, setExecutando, setProgresso, socket, json, file )
        };
    }
    

  }, [lastMessage])
  


  
  const tryStartMacro = () =>{
    setLoading(true)
    fetchWrapper(api.get_files(encodeURIComponent(section)+"/"+encodeURIComponent(file))).then( data =>{
        const columns = data["inputs.json"];
        const desc = data["data.json"];
        const fileContent = data["main.py"];
        setColumnsObj(columns);
        setFileContent(fileContent)
        setDesc(desc);


        

        
        if(Object.entries(columns).length ==0){
          let resolvePromise 
          const promise = new Promise((resolve, reject) =>{
            resolvePromise = resolve;
          })

          toast.promise(promise, {
            loading: json.loading_macro_toast,
            success: json.started_macro_toast,
          })
          setPromise(section, file, resolvePromise)

          __startMacro(fileContent, resolvePromise)
        }
        else{
          const initialForm = Object.entries(columns).reduce((acc, [key, value]) => {
            acc[value] = [""];
            return acc;
          }, {});
          setInputForms(initialForm)
          setLoading(false)
          setModal(true)
        }
    })
    
    
  }




   
  const startMacroWithInput = () => {
    
    setModal(false)


    const lista = Object.fromEntries(
        Object.entries(inputForm).map(([key, value]) => [
          key,
          Array.isArray(value)
            ? value.map((val) =>
                val.replace(/\r/g, "")
              )
            : value
        ])
      );
    startMacro(section, file, fileContent, lista); 

    const socket = new WebSocket(`ws://localhost:8765/receiver/${section}/${file}`);
    socketRef.current = socket;



    let resolvePromise 
    const promise = new Promise((resolve, reject) =>{
      resolvePromise = resolve;
    })

    toast.promise(promise, {
      loading: json.loading_macro_toast,
      success: json.started_macro_toast,
    })
    setPromise(section, file, resolvePromise)

    socket.onopen = () => {
      console.log("WebSocket conectado para macro:", file);
    };
    
    socket.onmessage = (event) => {
      onMessageMacro(event, setLoading, setExecutando, setProgresso, socket, json, file, resolvePromise)
    };

    socket.onclose = () => {
      console.log("WebSocket fechado para macro:", file);
    };
  };



  const __startMacro = (fileContent, resolvePromise) => {
    startMacro(section, file, fileContent); 

    const socket = new WebSocket(`ws://localhost:8765/receiver/${section}/${file}`);
    socketRef.current = socket;



    
    
    socket.onopen = () => {
      console.log("WebSocket conectado para macro:", file);
    };
    

    socket.onmessage = (event) => {
      onMessageMacro(event, setLoading, setExecutando, setProgresso, socket, json, file, resolvePromise)
    };

    socket.onclose = () => {
      console.log("WebSocket fechado para macro:", file);
    };
  };

 
  if(loading){
    return(
      <Button className={`macroBox ${executando ? "macroAcionada" : ""}`} id={file} >
          <div className="spinner"></div>
      </Button>
    )
  }
  return (
    <Button className={`macroBox ${executando ? "macroAcionada" : ""}`} id={file}>

      <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
        <label className="title">{file}</label>
        {/* {!executando && (
          <label id={"descr_" + file} className="desc">
            {desc.descricao}
          </label>
        )} */}
      </div>

      {/* {!executando && (
        <label id={"desc_" + file} className="desc">
          {desc.solicitado}
        </label>
      )} */}

      {executando && (
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
      )}

      {!executando && (
        <Button type="primary" success size="medium"
          id={"executeButton_" + file}
          className="buttonMacro"
          onClick={() => tryStartMacro()}
        >
        {json.execute_macro}

        </Button>
      )}

      {executando && (
        <Button type="primary" danger size="medium"
          id={"cancelButton_" + file}
          className="cancelButtonMacro"
          
          onClick={() =>{cancelarMacro(stopMacro, section, file, setExecutando, setProgresso, socketRef, json)}}
        >
          {json.cancel_macro}
        </Button>
      )}
      {modal && (
        <>
        <div className="overlay">
        </div>

          <div className="modal">
            <div className="containerInputModal">
              <button className="goBackButton" onClick={() =>setModal(false)}>{json.return}</button>

              <Table_ inputHook={inputForm} columnsObj={columnsObj} setInputesHook={setInputForms}></Table_>

              <form onSubmit={(e) => startMacroWithInput(e)}>
                
                
                <button className="buttonMacro" type="submit">{json.execute_macro}</button>
              </form>
            </div>
          </div>
          </>
      )}
    </Button>

  );
}
