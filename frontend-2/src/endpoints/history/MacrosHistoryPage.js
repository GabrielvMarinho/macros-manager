import { useEffect, useState } from 'react';
import fetchWrapper from '@/utils/fetchWrapper';
import LoadingHistory from '@/components/loading/LoadingHistory';
import HistoryTable from '@/components/HistoryTable';

export default function({api, json}){

    const [history, setHistory] = useState()

    useEffect(() => {
        if (api?.get_history) {
        fetchWrapper(api.get_history()).then(data =>{
            setHistory(data.history)
        })
        
        }
    }, []);

 

    return(
    <div className='mainContainer'>  
          
            
                
                    {!history?
                        <LoadingHistory/>

                    :
                    <div style={{display:"flex", height:"100%", flexDirection:"column"}}>
                    <h1 className='pageTitle'>{json.history}</h1>

                    <div className='historyWrapper'>
                        <div className='historyContainer'>
                        <HistoryTable json={json} api={api} history={history}/>
                        </div>
                    </div>
                    </div>
                    }
                    
                    
                
        
    </div>
    )
}