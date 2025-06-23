import { useState } from "react"
import { useJson } from "./getLanguageJson"


export default function (){
    const [open, setOpen] = useState(false)
    const {json, language, updateLanguage} = useJson()


    const brazil = require(`@/icons/brazil.png`)
    const germany = require(`@/icons/germany.png`)
    const france = require(`@/icons/france.png`)
    const english = require(`@/icons/united-states.png`)
    const spain = require(`@/icons/spain.png`)
    
    let icons = {
        "EN":english,
        "DE":germany,
        "ES":spain,
        "FR":france,
        "PT":brazil,
    }
    

    return(
        <div className="flagContainer">
        {!open ? (
            <img
            onClick={() => setOpen(true)}
            src={icons[language]}
            className="flagIcon"
            />
        ) : (
            Object.entries(icons).map(([key, value]) =>
                <img
                key={key}
                onClick={() => {
                    updateLanguage(key);
                    setOpen(false);
                }}
                src={value}
                className="flagIcon"
                />
            )
        )}
        </div>
    )
}