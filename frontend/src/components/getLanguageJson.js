import { createContext, useContext, useEffect, useState } from "react";
import getLanguage from "../utils/language/getLanguage";

const JsonContext = createContext(null)

export function JsonProvider({children}){
    const [language, setLanguage] = useState(getLanguage())
    const [json, setJson] = useState()
    useEffect(() =>{
        const fn = async function(){
            let language = getLanguage()
            const module = await import(`@/textContent/${language}.json`)
            setJson(module.default)

        } 
        fn()
    }, [language])

    function updateLanguage(lang){
        localStorage.setItem("lang", lang)
        setLanguage(lang)
    }

    return(
        <JsonContext.Provider value = {{json, language, updateLanguage}}>
            {children}
        </JsonContext.Provider>    
    )
}

export function useJson(){
    return useContext(JsonContext)
}