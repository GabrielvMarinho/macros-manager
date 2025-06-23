import { useEffect, useState } from "react";
import fetchWrapper from "@/utils/fetchWrapper";
import "@/style.css"
import getApi from "@/utils/api";
import { useNavigate } from 'react-router-dom';
import { useJson } from "@/components/getLanguageJson";
import Dashboard from "@/components/Dashboard";
import Credits from "@/components/Credits";
import SideBar from "@/components/SideBar";
import { Button } from "antd";
import LoadingSections from "@/components/loading/LoadingSections";
import QueueMacros from "@/components/queue/QueueMacros";
import { wsManager } from "@/utils/WebSocketManager";
import onMessageMacro from "@/utils/onMessageMacro";
import onMessageMacroDashboard from "@/utils/onMessageMacroDashboard";
import { resolvePromise } from "@/utils/toastPromiseManager";

export default function AllSections() {
  const [api, setAapi] = useState(null)
  const [sections, setSections] = useState([])
  const {json, language, updateLanguage} = useJson()

  const navigate = useNavigate(); 


  const [queryValue, queryValueAgain] = useState(true)

  const [executandoMap, setExecutandoMap] = useState({})
  const [progressoMap, setProgressoMap] = useState({})

  const [queueMacros, setQueuedMacros] = useState({})

  const [listProcess, setListProcesses] = useState({})
  const [processesLastMessage, setProcessesLastMessage] = useState({})

  useEffect(() =>{          
      if (
        api?.get_queue &&
        api?.get_list_processes &&
        api?.get_processes_last_message
      ) {
        fetchWrapper(api.get_queue()).then((data) => {
          console.log("data finale", data)
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

              setExecutandoMap(prev =>({
                ...prev,
                [key]: true
              }))


              const socket = wsManager.createWsConnection(value.section, value.file)
              wsManager.addListener(value.section, value.file, 
                (event) =>{onMessageMacroDashboard(
                  event,
                  key,
                  setExecutandoMap,
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


  
  useEffect(() => {
    
    async function AwaitApi(){
      setAapi(await getApi())
    }
    AwaitApi()



    if (api?.get_sections) {
        fetchWrapper(api.get_folders()).then(data =>{
        setSections(data.folders)
        })
      }

    
  }, [api]);


  if(!json){
      return(
        <></>
      )
  }
  
  console.log("parent component", queueMacros)
  return (
    
      <div className='mainContainer'>  
          
        <QueueMacros queueMacros={queueMacros} json={json}/>
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
            <div className="lineBreaker"></div>
            
            <Dashboard queryValueAgain={() =>queryValueAgain(!queryValue)} progressoMap={progressoMap} json={json} api={api} executandoMap={executandoMap} listProcess={listProcess} processesLastMessage={processesLastMessage}/>
        </div>
        
        <SideBar json={json} api={api}/>

        <Credits/>
            
      </div>
  );
  
  
  
  

  
}

