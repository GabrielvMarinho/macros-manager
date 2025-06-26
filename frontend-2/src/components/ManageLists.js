import fetchWrapper from "@/utils/fetchWrapper"
import { Checkbox, Modal } from "antd"
import { useState } from "react"
import { toast } from "sonner"

export default function({api, section, file}){
    const [lists, setLists] = useState()
    const [modal, setModal] = useState(false)
    const listIcon = require("@/icons/list.png")
    const queryLists = () => {
        fetchWrapper(api.get_lists_macro(section, file)).then(setLists)
        setModal(true)
        
    }
    const updateLists = async (e) =>{
        let res ={}
        if(e.target.checked){
            res = await fetchWrapper(api.add_macro_to_list(e.target.id, section, file))
            if(res.status=="success"){
                toast.success("macro added of list")
            }
            else{
                toast.error("error adding macro")
            }
        }else{
            res = await fetchWrapper(api.remove_macro_of_list(e.target.id, section, file))
            if(res.status=="success"){
                toast.error("macro removed of list")
            }
            else{
                toast.error("error removing macro")
            }
        }

        
    }
    
    return(
        <>
        <img className="icon" onClick={() =>queryLists()} src={listIcon}/>
        <Modal open={modal} footer={null} onCancel={() =>setModal(false)}>
            {lists && lists.length>0?
                lists.map((list) =>(
                    
                    <Checkbox id = {list.id} defaultChecked={list.has_this_macro} onChange={updateLists}>{list.name}</Checkbox>
                ))

                
                :
                <h1>no lists</h1>
            }
        </Modal>
        </>
    )
}