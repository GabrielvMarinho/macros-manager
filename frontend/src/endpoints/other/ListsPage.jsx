import ListEspecificMacros from "@/components/ListEspecificMacros";
import fetchWrapper from "@/utils/fetchWrapper";
import { Button, Empty, Form, Input, Menu, Modal, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Trashbin from "@/icons/Trashbin";
export default function({api, json}){
    const [lists, setLists] = useState()
    const [listId, setListId] = useState()
    const [modalAddList, setModalAddList] = useState(false)
    const [name, setName] = useState()
    const [nameError, setNameError] = useState()
    const [queryValueAgain, setQueryValueAgain] = useState(false)

    const _setName = (name) =>{
        setName(name)
        setNameError("")
        lists.forEach(list => {
            if(list.label == name){
                setNameError("Name already exists!")
            } 
        });
    }
    const setListIdFunction = (e) =>{
        if(e){
            setListId(e.key)
        }
    }
    const deleteList = async (id) =>{
        var res = await fetchWrapper(api.delete_list(id))
        if(res.status == "success"){
            toast.success("List deleted")
            setQueryValueAgain(!queryValueAgain)
        }else{
            toast.error("Error deleting list")
            setQueryValueAgain(!queryValueAgain)
        }
    }
    const createList = async () =>{
        let res = await fetchWrapper(api.create_new_list(name))
        if(res["status"] == "success"){
            toast.success("list created")
            
            setQueryValueAgain(!queryValueAgain)
            setModalAddList(false)
            setName("")

        }else{
            toast.error("error creating list")
            setQueryValueAgain(!queryValueAgain)
            setName("")

        }
    }
    useEffect(() =>{
        if(api?.get_lists){
            fetchWrapper(api.get_lists()).then(data => {
                const formatted = (data || []).map(item => ({
                    key: item.id,
                    label: item.name,
                    icon: <Popconfirm okText="Yes" cancelText="No"title="Delete list" description={`Do you wish to delete ${item.name}?`} onConfirm={() =>deleteList(item.id)}>
                        <div className="trashBin">
                            <Trashbin></Trashbin>
                        </div>
                        </Popconfirm>
                }));
                
                
                setLists(formatted);
            });
            
        }
    }, [api, queryValueAgain])

    return(
        <>

        <div className='mainContainer'>  
            

            <div style={{display:"flex", flexDirection:"row", gap:"20px", alignItems:"center", maxHeight:"100%"}}>

                <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
                    
                    <Button onClick={() =>setModalAddList(true)}size="large">{json.new_list}</Button>
                    <div style={{overflow:"scroll", height:"50vh", width:"15vw"}}>
                    {lists && lists.length > 0 ? 
                    
                        <Menu
                            onClick={(e) => setListIdFunction(e)}
                            items={lists}
                            
                        />
                        : null
                    }
                    </div>
                </div>

                {listId ? 
                    <>
                        <ListEspecificMacros api={api} json={json} listId={listId}></ListEspecificMacros>
                    </>
                :
                <>

                <div className="macroWrapperNoData">
                    <Empty description={json.no_list}></Empty>
                </div>
                </>
                }
            </div>
            <div className="listContainer">
                
            </div>



            <Modal footer={null} width="400px" title={"Type the new List's name"} open={modalAddList} onCancel={() =>setModalAddList(false)}>
                <Form style={{marginTop:"25px"}}>
                    <Form.Item help={nameError?nameError:""} validateStatus={nameError?"error":""} label="name">
                        <Input type="name" onChange={(e) =>_setName(e.target.value)} value={name}></Input>
                    </Form.Item>
                    <Form.Item>
                        {nameError || !name?
                        <Button style={{pointerEvents:"none", opacity:"0.3"}} htmlType="submit">Create</Button>
                            :
                        <Button htmlType="submit" onClick={createList}>Create</Button>
                            }

                    </Form.Item>
                </Form>
                
            </Modal>
        </div>
        </>
    )
}