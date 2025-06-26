import ListEspecificMacros from "@/components/ListEspecificMacros";
import fetchWrapper from "@/utils/fetchWrapper";
import { Button, Flex, Form, Input, Menu, Modal } from "antd";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function({api, json}){
    const [lists, setLists] = useState()
    const [listId, setListId] = useState()
    const [modalAddList, setModalAddList] = useState(false)
    const [name, setName] = useState()
    const [nameError, setNameError] = useState()

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
    const createList = async () =>{
        let res = await fetchWrapper(api.create_new_list(name))
        if(res["status"] == "success"){
            toast.success("list created")
        }else{
            toast.error("error creating list")
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
            <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
                <Button onClick={() =>setModalAddList(true)}size="large">Create List</Button>
                {lists && lists.length > 0 ? 
                    <Menu
                        onClick={(e) => setListIdFunction(e)}
                        items={listId ? lists.filter(item => item.key === listId) : lists}
                    />
                    : null
                    }
                    {listId && (
                        <Button onClick={() => setListId(null)}>Show All Lists</Button>
                        )}
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