import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import fetchWrapper from '@/utils/fetchWrapper';
import { MacroBox } from '@/components/macroBox';
import getApi from '@/utils/api';
import { Toaster, toast } from 'sonner';
import { useJson } from '@/components/getLanguageJson';
import Table_ from '@/components/Table_';
import Credits from '@/components/Credits';
import LoadingMacros from '@/components/loading/LoadingMacros';
import Arrow from "@/icons/arrow.png"
import { wsManager } from '@/utils/WebSocketManager';
import onMessageMacroDashboard from '@/utils/onMessageMacroDashboard';
import { resolvePromise } from '@/utils/toastPromiseManager';
import { Empty } from 'antd';
export default function SectionMacrosPage({api, json}) {

  const { section } = useParams();
  const [macros, setMacros] = useState()
  const [queryValue, queryValueAgain] = useState(true)
  const [executingMap, setExecutingMap] = useState({})
  const [progressoMap, setProgressoMap] = useState({})
  const [queueMacros, setQueuedMacros] = useState({})
  const [processesLastMessage, setProcessesLastMessage] = useState({})


  useEffect(() =>{        
        if (
          api?.get_queue &&
          api?.get_list_processes &&
          api?.get_processes_last_message &&
          api?.get_folders
        ) {
          fetchWrapper(api.get_folders(encodeURIComponent(section))).then(data =>{
            setMacros(data?.folders)
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
                
            setExecutingMap({})
            Object.entries(data).forEach(([key, value]) => {

                setExecutingMap(prev =>({
                  ...prev,
                  [key]: true
                }))


                const socket = wsManager.createWsConnection(value.section, value.file)
                wsManager.addListener(value.section, value.file, 
                  (event) =>{onMessageMacroDashboard(
                    event,
                    key,
                    setExecutingMap,
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
    <div>
     <div className='divTitleBack'>
           <h1 className='pageTitleBack'>{section}</h1>

          <Link className="returnArrow" to="/">
            <img className="icon" src={Arrow}></img>
          </Link>
      </div>
      {!macros?
        
        
        <LoadingMacros/>
        :
            macros.length==0?
            <div className='macroWrapperNoData'>

                <Empty description="No macros Found"></Empty>
            </div>
            :
            <div className='macroWrapper'>

                <div className="macroContainer">

                {macros && macros.map((i) =>{
                  const progresso = progressoMap[section+i]
              
                  const queue = Object.values(queueMacros).some(
                    (value) => value.section + value.file === section + i
                  );
                  
                  return <MacroBox 
                  json={json}
                  executing={executingMap[section+i]?true:false} 
                  setExecutingMap={setExecutingMap}
                  lastMessage={processesLastMessage[i]} 
                  file={i} 
                  section={section}
                  queued={queue}
                  progresso={progresso}
                  queryValueAgain={() =>queryValueAgain(!queryValue)}
                  startMacro={api.start_macro} 
                  stopMacro={api.stop_macro}
                  api={api}></MacroBox>
                })}
                  </div>
          </div>
            
            
      
      }
        </div>
    </div>
  );
}