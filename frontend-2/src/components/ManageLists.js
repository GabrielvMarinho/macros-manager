import fetchWrapper from "@/utils/fetchWrapper"
import { useState } from "react"

export default function({api, section, file}){
    const [lists, setLists] = useState()
    const listIcon = require("@/icons/list.png")
    const queryLists = () => {
        console.log("query")
        fetchWrapper(api.get_lists_macro(section, file)).then(setLists)
    }

    if(lists){
        <div>
            <div onClick={() =>queryLists()}>manage lists</div>
        </div>
    }
    return(
        <img className="iconList" onClick={() =>queryLists()} src={listIcon}/>
    )
}