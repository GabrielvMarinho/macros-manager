import { Button, Divider, theme } from "antd";
import Language from "./Language";
import OpenSap from "./OpenSap";
import Settings from "./Settings";
import useToken from "antd/es/theme/useToken";
import Arrow from "@/icons/arrow.png"
export default function({json, api}){
    const {token} = theme.useToken()

    return(
        <div className="sideBarContainer">
            
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
        </div>
    )
}