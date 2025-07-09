
import fetchWrapper from "@/utils/fetchWrapper"
import { Button, Form } from "antd"

import Input from "antd/es/input/Input"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function({json, api}){

    const [prevUser, setPrevUser] = useState()
    const [user, setUser] = useState()
    const [prevPassword, setPrevPassword] = useState()
    const [password, setPassword] = useState()
    
    useEffect(() =>{
       
        if(api){
            fetchWrapper(api.get_credentials()).then(data =>{
                const password = data.password
                const login = data.login
                setUser(login)
                setPrevUser(login)
                setPassword(password)
                setPrevPassword(password)
                
            })
            
        }
    }, [api])

    const updateData = () =>{

        api.update_credentials(user, password)
        setPrevPassword(password)
        setPrevUser(user)
        toast.success(json.configuration_saved)
    }
    return(
    
        <Form layout="vertical">

            

            <Form.Item label={json.login}>
                <Input type="text" onChange={(e) =>setUser(e.target.value)} value={user}></Input>
            </Form.Item>
            

            <Form.Item label={json.password}>
                <Input type="password" onChange={(e) =>setPassword(e.target.value)} value={password}></Input>
            </Form.Item>

            {user != prevUser || password != prevPassword ?
                <Form.Item style={{left:"0%"}}onClick={() =>updateData()} label={null}>
                    <Button htmlType="submit">
                        {json.save_changes}
                    </Button>
                </Form.Item>
            :
                <div style={{pointerEvents:"none", opacity:"0.3"}}>
                    <Form.Item label={null}>
                        <Button htmlType="submit">
                            {json.save_changes}
                        </Button>
                    </Form.Item>
                </div>
            }
            
        
        </Form>  
      
    )
}