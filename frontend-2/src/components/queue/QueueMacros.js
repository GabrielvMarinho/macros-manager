import fetchWrapper from "@/utils/fetchWrapper"
import { useEffect, useState } from "react"
import QueueMacro from "./QueueMacro"

export default function({json, queueMacros}){
    
    return(
        <div className="queueMacros">
            {Object.entries(queueMacros) !={}?
                (Object.entries(queueMacros).length>0?

                Object.entries(queueMacros).map(([key, value]) =>(
                    
                    <QueueMacro json={json} section={value["section"]} file={value["file"]} ></QueueMacro>
                    

                ))
                :
                <h1>No queue</h1>
                )
            :
                <h1>loading</h1>
            }
            
        </div>
    )
}