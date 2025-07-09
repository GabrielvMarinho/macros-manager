
import QueueMacro from "./QueueMacro"
import { Empty } from "antd"

export default function({json, queueMacros}){
    
    return(
        <div className="queueMacros">
            {Object.entries(queueMacros) !={}?
                (Object.entries(queueMacros).length>0?

                Object.entries(queueMacros).map(([, value]) =>(
                    
                    <QueueMacro key={value} json={json} section={value["section"]} file={value["file"]} ></QueueMacro>
                    

                ))
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={json.no_queue}></Empty>
                )
            :
                <h1>loading</h1>
            }
            
        </div>
    )
}