import ListEspecificMacros from "@/components/ListEspecificMacros";
import fetchWrapper from "@/utils/fetchWrapper";
import { Button, Flex, Menu } from "antd";
import { useEffect, useState } from "react";

export default function({api, json}){
    const [lists, setLists] = useState()
    const [listId, setListId] = useState()
 
    const setListIdFunction = (e) =>{
        if(e){
            setListId(e.key)
        }
    }
    useEffect(() =>{
        if(api?.get_lists){
            fetchWrapper(api.get_lists()).then(data => {
                const formatted = (data || []).map(item => ({
                    key: item.id,
                    label: item.name
                }));
                
                
                setLists(formatted);
            });
            
        }
    }, [api])

    return(
        <div className='mainContainer'>  
            <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
                <Button size="large">Create List</Button>
                {lists && lists.length>0? 
                        
                        <Menu
                        onClick={(e) =>setListIdFunction(e)}
                        items={lists}
                        />
                    :
                        null
                    
                    
                }
                {listId ? 
                    <ListEspecificMacros api={api} json={json} listId={listId}></ListEspecificMacros>
                :
                <h1>not selected</h1>
                }
            </div>
            <div className="listContainer">
                
            </div>
        </div>
    )
}