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
export default function SectionMacros() {

  const { section } = useParams();
  
  const [api, setAapi] = useState(null)
  const [macros, setMacros] = useState()
  const [macrosDesc, setmacrosDesc] = useState([])
  const [inputs, setInputs] = useState({})
  const [listProcess, setListProcesses] = useState({})
  const [processesLastMessage, setProcessesLastMessage] = useState({})
  const {json, language, updateLanguage} = useJson()


  useEffect(() => {
    async function AwaitApi(){
      setAapi(await getApi())
    }
    AwaitApi()

    if (api) {
      fetchWrapper(api.get_folders(encodeURIComponent(section))).then(data =>{
        setMacros(data?.folders)
        // setmacrosDesc(data.dados_macros)
        // setInputs(data.inputs)

      })
      
      fetchWrapper(api.get_list_processes()).then(setListProcesses)
      fetchWrapper(api.get_processes_last_message()).then(setProcessesLastMessage)
    }
  }, [api]);



 
 

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
            <img src={Arrow}></img>
          </Link>
      </div>
      {!macros?
        
        
        <LoadingMacros/>
        :
      <div className='macroWrapper'>
        <div className="macroContainer">
            {macros.length==0?
            <h1>no macros found</h1>
            :
            macros && macros.map((i) =>{
              
              return <MacroBox 
              // actualFileName = {macrosDesc[i].name} 
              process={listProcess[section+i]?true:false} 
              lastMessage={processesLastMessage[i]} 
              file={i} 
              section={section} 
              // desc={macrosDesc[i]} 
              startMacro={api.start_macro} 
              stopMacro={api.stop_macro}
              api={api}></MacroBox>
            })
            }
            
        </div>
      </div>
      
      }
        </div>
    </div>
  );
}