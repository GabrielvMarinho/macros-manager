import { Button, Divider, Drawer, theme } from "antd";
import Language from "./Language";
import OpenSap from "./OpenSap";
import Settings from "./Settings";
import Arrow from "@/icons/arrow.png"
import { useState } from "react";
export default function({json, api}){
    const [openDrawer, setOpenDrawer] = useState(false) 

    return(
        <>
        <button onClick={() =>setOpenDrawer(true)}>open drawer</button>
            <Drawer open={openDrawer} onClose={() =>setOpenDrawer(false)}>
                
                <div className="sideBar">
                    
                    <h2 className="sidebarTitle">{json.actions}</h2>

                    <OpenSap json={json} api={api}/>
                    
                    <Divider/>

                    <h2 className="sidebarTitle">{json.configuration}</h2>

                    <Settings json={json} api={api}/>

                    <Divider/>

                    <h2 className="sidebarTitle">{json.languages}</h2>

                    <Language></Language>

                </div>
            </Drawer>
        </>
    )
}