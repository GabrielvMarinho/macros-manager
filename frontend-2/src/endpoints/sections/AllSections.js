import { useEffect, useState } from "react";
import fetchWrapper from "@/utils/fetchWrapper";
import "@/style.css"
import getApi from "@/utils/api";
import { useNavigate } from 'react-router-dom';
import { useJson } from "@/components/getLanguageJson";
import Dashboard from "@/components/Dashboard";
import Credits from "@/components/Credits";
import SideBar from "@/components/SideBar";
import { Button, Divider } from "antd";
import LoadingSections from "@/components/loading/LoadingSections";
import QueueMacros from "@/components/queue/QueueMacros";
import { wsManager } from "@/utils/WebSocketManager";
import onMessageMacroDashboard from "@/utils/onMessageMacro";
import { resolvePromise } from "@/utils/toastPromiseManager";

export default function AllSections({api, json}) {
  const [sections, setSections] = useState([])
  const navigate = useNavigate(); 
  const [queryValue, queryValueAgain] = useState(true)
  const [executingMap, setexecutingMap] = useState({})
  const [progressoMap, setProgressoMap] = useState({})
  const [queueMacros, setQueuedMacros] = useState({})
  const [listProcess, setListProcesses] = useState({})
  const [processesLastMessage, setProcessesLastMessage] = useState({})

  useEffect(() =>{     
        
      if (
        api?.get_queue &&
        api?.get_list_processes &&
        api?.get_processes_last_message &&
        api?.get_folders
      ) {
        fetchWrapper(api.get_folders()).then(data =>{
            setSections(data.folders)
        })
        fetchWrapper(api.get_queue()).then((data) => {

          setQueuedMacros({})

          data.queue.forEach((macro) => {
            setQueuedMacros(prev =>({
                ...prev,
                [macro.section+macro.file]: {"section":macro.section, "file":macro.file}
              }))
          });
          
          
        });
        fetchWrapper(api.get_list_processes()).then((data) =>{
          setListProcesses(data)
          Object.entries(data).forEach(([key, value]) => {

              setexecutingMap(prev =>({
                ...prev,
                [key]: true
              }))


              const socket = wsManager.createWsConnection(value.section, value.file)
              wsManager.addListener(value.section, value.file, 
                (event) =>{onMessageMacroDashboard(
                  event,
                  key,
                  setexecutingMap,
                  setProgressoMap,
                  () =>queryValueAgain(!queryValue),
                  socket,
                  json,
                  value.file, 
                  () =>resolvePromise(value.section, value.file)
                )})

          });
        });
        fetchWrapper(api.get_processes_last_message()).then(setProcessesLastMessage);
      }
  }, [api, queryValue])


  
  


  if(!json){
      return(
        <></>
      )
  }
  
  return (
    
      <div className='mainContainer'> 
        <div style={{display:"flex", flexDirection:"column", height:"100%", width:"20%"}}> 
          <h1 className="pageTitle">Queue of Macros</h1>
          <QueueMacros queueMacros={queueMacros} json={json}/>
        </div>

          <div className="containerMainPage">
            <h1 className="pageTitle">{json.section_list}</h1>

            {sections?.length==0? 
            <LoadingSections/>
            :  
            <div className="sectionContainer">
                {sections && sections.map(section =>(

                      <Button size="large" onClick={() => navigate(`/section/${section}`)}>
                        {section}
                      </Button>
                ))}
            </div>
            }
            <Divider/>
            
            <Dashboard queryValueAgain={() =>queryValueAgain(!queryValue)} progressoMap={progressoMap} json={json} api={api} executingMap={executingMap} listProcess={listProcess} processesLastMessage={processesLastMessage}/>
        </div>
        

        <Credits json={json}/>
            
      </div>
  );
  
  
  
  

  
}

