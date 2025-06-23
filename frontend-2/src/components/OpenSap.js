import { Button } from "antd";

export default function({api, json}){

    return(
        <Button size="large" className="StartSapButton" onClick={() => api?.open_sap()}>{json.start_sap}</Button>
    )
}