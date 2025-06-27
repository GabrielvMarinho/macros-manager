import { useEffect, useState } from "react";
import LoadingMacros from "./loading/LoadingMacros";
import { MacroBox } from "./macroBox";
import fetchWrapper from "@/utils/fetchWrapper";
import { wsManager } from "@/utils/WebSocketManager";
import onMessageMacroDashboard from "@/utils/onMessageMacroDashboard";
import { resolvePromise } from "@/utils/toastPromiseManager";
import { Link } from "react-router-dom";
import Arrow from "@/icons/arrow.png"
import { Empty } from "antd";

export default function({api, json, listId}){
    const [macros, setMacros] = useState()
    const [queryValue, queryValueAgain] = useState(true)
    const [executingMap, setExecutingMap] = useState({})
    const [progressoMap, setProgressoMap] = useState({})
    const [queueMacros, setQueuedMacros] = useState({})
    const [processesLastMessage, setProcessesLastMessage] = useState({})

    console.log("listId", listId)
    useEffect(() =>{        
            if (
            api?.get_queue_in_list &&
            api?.get_list_processes_in_list &&
            api?.get_processes_last_message_in_list &&
            api?.get_folders_in_list
            ) {
            fetchWrapper(api.get_folders_in_list(listId)).then(data =>{

                setMacros(data?.folders)
                fetchWrapper(api.get_queue_in_list(data?.folders)).then((dataQueue) => {
                    setQueuedMacros({})
                    console.log(dataQueue)
                    dataQueue.queue.forEach((macro) => {
                    setQueuedMacros(prev =>({
                        ...prev,
                        [macro.section+macro.file]: {"section":macro.section, "file":macro.file}
                        }))
                    });
                });
                fetchWrapper(api.get_list_processes_in_list(data?.folders)).then((dataProcess) =>{
                    
                    setExecutingMap({})
                    Object.entries(dataProcess).forEach(([key, value]) => {

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
                fetchWrapper(api.get_processes_last_message_in_list(data?.folders)).then(setProcessesLastMessage);

            })
            
            
            }
        }, [api, listId, queryValue])
    if(!json){
       return(
        <></>
      )
    }
    return (
        <div>
    
        {!macros?
            
            
            <LoadingMacros/>
            :
        
                macros.length==0?
                <div className="macroWrapperNoData">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No macro in list"></Empty>
                </div>
                :
                <div className='macroWrapper'>
                    <div className="macroContainer">
                        {macros && macros.map((i) =>{
                        const progresso = progressoMap[i.section+i.file]
                    
                        const queue = Object.values(queueMacros).some(
                            (value) => value.section + value.file === i.section + i.file
                        );
                        
                        return <MacroBox 
                        json={json}
                        executing={executingMap[i.section+i.file]?true:false} 
                        setExecutingMap={setExecutingMap}
                        lastMessage={processesLastMessage[i.file]} 
                        file={i.file} 
                        section={i.section}
                        showSection={true}
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
    );
}