import cancelarMacro from "@/utils/cancelMacro";
import onMessageMacro from "@/utils/onMessageMacro";
import { findByLabelText } from "@testing-library/dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useJson } from "./getLanguageJson";
import { Form, useResolvedPath } from "react-router-dom";
import Table_ from "./Table_";
import { Button, Card, Modal } from "antd";
import fetchWrapper from "@/utils/fetchWrapper";
import { getPromise, resolvePromise, setPromise } from "@/utils/toastPromiseManager";
import cancelMacroAndUpdate from "@/utils/cancelMacroDashboard";
import ManageLists from "./ManageLists";

export function MacroBox({ json, showSection=false, lastMessage, section, queued, executing, setExecuting, file, startMacro, stopMacro, progresso, queryValueAgain, api }) {
  const [modal, setModal] = useState(false)

  const [columnsObj, setColumnsObj] = useState()
  const [desc, setDesc] = useState()
  const [fileContent, setFileContent] = useState()
  const [inputForm, setInputForms] = useState({})
  
  const [loading, setLoading] = useState(false)
  
  useEffect(() =>{
    setLoading(false)
  }, [progresso])
  
  const tryStartMacro = () =>{
    setLoading(true)


    let resolvePromise 
    const promise = new Promise((resolve, reject) =>{
      resolvePromise = resolve;
    })

    toast.promise(promise, {
      loading: json.loading_macro_toast,
      success: json.started_macro_toast,
    })
    setPromise(section, file, resolvePromise)
    

    fetchWrapper(api.get_files(section, file)).then( data =>{
        const columns = data["inputs.json"];
        const desc = data["data.json"];
        const fileContent = data["main.py"];
        setColumnsObj(columns);
        setFileContent(fileContent)
        setDesc(desc);

        if(Object.entries(columns).length ==0){
          
          __startMacro(fileContent, resolvePromise)
        }
        else{
          const initialForm = Object.entries(columns).reduce((acc, [key, value]) => {
            acc[value] = [""];
            return acc;
          }, {});
          setInputForms(initialForm)
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
    resolvePromise(section, file)

    queryValueAgain()
    
  }

  const __startMacro = async (fileContent, resolvePromise) => {
    const res = await startMacro(section, file, fileContent);
    resolvePromise()
    queryValueAgain()

    
  }
  
  if(loading && !queued){
    return(
      <>
      <Button className={`macroBox ${executing ? "macroAcionada" : ""}`} id={file} >
          <div className="spinner"></div>
      </Button>
        
        <>
      

            <Modal
            title="Execute macro"
            closable={true}
            open={modal}
            onCancel={() =>setModal(false)}
            onOk={() =>startMacroWithInput()}
            size="large"
            width={600}
            height={400}
            >
              <div className="containerInputModal">

                <Table_ inputHook={inputForm} columnsObj={columnsObj} setInputesHook={setInputForms}></Table_>

                  
                  
              </div>
          </Modal>
          </>
      </>

    )
  }
  
  
  return (
    <Card title={showSection?section+" | "+file:file} extra={<ManageLists api={api} section={section} file={file}/>} className={`macroBox`} id={file}>

      {/* <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
        <label className="title">{file}</label>
    
      </div> */}
      {queued ? 
        <label className="title">Macro na fila</label>
          

        :

        executing && (
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
              <label className="label-loading-bar">
                {progresso !== null && !isNaN(progresso) ? `${Math.round(progresso)}%` : "0%"}
              </label>
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
        )
    
      }

      
      {!executing && !queued && (
        <Button success size="medium"
          id={"executeButton_" + file}
          className="buttonMacro"
          onClick={() => tryStartMacro()}
        >
        {json.execute_macro}

        </Button>
      )}

      
      
    </Card>

  );
}
