import fetchWrapper from "@/utils/fetchWrapper"
import { useEffect, useState } from "react"
import QueueMacro from "./QueueMacro"
import { Empty } from "antd"

export default function({json, queueMacros}){
    
    return(
        <div className="queueMacros">
            {Object.entries(queueMacros) !={}?
                (Object.entries(queueMacros).length>0?

                Object.entries(queueMacros).map(([key, value]) =>(
                    
                    <QueueMacro json={json} section={value["section"]} file={value["file"]} ></QueueMacro>
                    

                ))
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No queue"></Empty>
                )
            :
                <h1>loading</h1>
            }
            
        </div>
    )
}