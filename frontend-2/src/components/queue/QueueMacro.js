import onMessageMacro from "@/utils/onMessageMacro";
import { resolvePromise } from "@/utils/toastPromiseManager";
import { wsManager } from "@/utils/WebSocketManager";
import { Button } from "antd";
import { useEffect, useRef, useState } from "react";

export default function({json, section, file}){

 
   
    return(
        <Button className="macroBoxQueue">
            <h2>section: {section}</h2>
            <h2>macro: {file}</h2>
        </Button>
    )
}