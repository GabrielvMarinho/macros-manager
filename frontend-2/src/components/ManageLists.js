import List from "@/icons/List"
import fetchWrapper from "@/utils/fetchWrapper"
import { Button, Checkbox, Modal } from "antd"
import { useState } from "react"
import { toast } from "sonner"

export default function({api, updateList, section, file}){
    const [lists, setLists] = useState()
    const [modal, setModal] = useState(false)
    const queryLists = () => {
        fetchWrapper(api.get_lists_macro(section, file)).then(setLists)
        setModal(true)
        
    }
    const updateLists = async (e) =>{
        let res ={}
        if(e.target.checked){
            res = await fetchWrapper(api.add_macro_to_list(e.target.id, section, file))
            if(res.status=="success"){
                toast.success("macro added to list")
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
        <div className="icon" onClick={() =>queryLists()}>
            <List/>
        </div>
        <Modal width={"350px"} closable={false} title={"Your Lists"} open={modal} footer={[
        <Button
            key="submit"
            type="primary"
            onClick={() => {
            setModal(false);
            if (updateList) {
                updateList();
            }
            }}
        >
            Ok
        </Button>
        ]}  onCancel={() =>setModal(false)}>
	   
	    
	    <div style={{display:"flex", flexDirection:"column", gap:"2px", height:"120px", overflow:"scroll"}}>
	    {lists && lists.length>0?
                lists.map((list) =>(
                    
                    <Checkbox  id = {list.id} defaultChecked={list.has_this_macro} onChange={updateLists}>{list.name}</Checkbox>
                ))

                
                :
                <h1>no lists</h1>
            }
        </div>
        </Modal>
        </>
    )
}
