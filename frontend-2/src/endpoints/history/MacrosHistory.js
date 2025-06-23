import { Link } from 'react-router-dom';
import { MacroBox } from '@/components/macroBox';
import { useJson } from '@/components/getLanguageJson';
import LoadingMacros from '@/components/loading/LoadingMacros';
import Arrow from "@/icons/arrow.png"
import { useEffect, useState } from 'react';
import getApi from '@/utils/api';
import fetchWrapper from '@/utils/fetchWrapper';
import LoadingHistory from '@/components/loading/LoadingHistory';
import HistoryTable from '@/components/HistoryTable';

export default function(){
    const json = useJson()
    const [api, setAapi] = useState(null)
    const [history, setHistory] = useState()

    useEffect(() => {
        
        async function AwaitApi(){
        setAapi(await getApi())
        }
        AwaitApi()

        
        if (api?.get_history) {
        fetchWrapper(api.get_history()).then(data =>{
            setHistory(data.history)
        })
        
        }
    }, [api]);

 

    
    return(
    <div className='mainContainer'>  
        <div>
            <div className='divTitleBack'>
                <h1 className='pageTitleBack'>History</h1>
                </div>
            
                
                    {!history?
                        <LoadingHistory/>

                    :
                    <div className='historyWrapper'>
                        <div className='historyContainer'>
                        <HistoryTable api={api} history={history}/>
                        </div>
                    </div>

                    }
                    
                    
                
        
        </div>
    </div>
    )
}