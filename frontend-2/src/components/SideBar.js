import { Button, theme } from "antd";
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
                
                <h2>{json.actions}</h2>

                <OpenSap json={json} api={api}/>
                
                <h2>{json.configuration}</h2>

                <Settings json={json} api={api}/>

                <h2>{json.languages}</h2>

                <Language></Language>

            </div>
        </div>
    )
}