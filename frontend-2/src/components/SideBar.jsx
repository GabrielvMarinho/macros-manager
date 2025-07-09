import { Button, Divider, Drawer, theme } from "antd";
import Language from "./Language";
import OpenSap from "./OpenSap";
import Settings from "./Settings";
import { useState } from "react";
import ChangeTheme from "./ChangeTheme";
import Setting from "@/icons/Setting";
import Gamepad from "@/icons/Gamepad";
export default function({json, api}){
    const [openDrawerConfig, setOpenDrawerConfig] = useState(false) 
    const [openDrawerActions, setOpenDrawerActions] = useState(false) 

    if(!json){
        return <></>
    }
    return(
        <>
        <div style={{position:"absolute", right: "5%", top:"50%", flexDirection:"column", display:"flex", gap:"15px"}}>
        <div onClick={() =>setOpenDrawerActions(true)}>
            <Gamepad></Gamepad>
        </div>
        <div onClick={() =>setOpenDrawerConfig(true)}>
            <Setting></Setting>
        </div>
        
        </div>
        <Drawer open={openDrawerActions} onClose={() =>setOpenDrawerActions(false)}>
            
            <div className="sideBar">
                <h2 className="sidebarTitle">{json.actions}</h2>

                <OpenSap json={json} api={api}/>






            </div>
        </Drawer>

        <Drawer open={openDrawerConfig} onClose={() =>setOpenDrawerConfig(false)}>
            
            <div className="sideBar">
          
                <h2 className="sidebarTitle">{json.settings}</h2>

                <Settings json={json} api={api}/>

                <Divider/>
                <h2 className="sidebarTitle">{json.theme}</h2>

                <ChangeTheme></ChangeTheme>

                <Divider/>

                <h2 className="sidebarTitle">{json.languages}</h2>

                <Language></Language>

            </div>
        </Drawer>
        </>
    )
}