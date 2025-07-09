
import { Button } from "antd";

export default function({section, file}){

 
   
    return(
        <Button className="macroBoxQueue">
            <h2>section: {section}</h2>
            <h2>macro: {file}</h2>
        </Button>
    )
}