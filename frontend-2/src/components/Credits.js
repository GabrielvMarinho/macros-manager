import { useJson } from "./getLanguageJson"

export default function (){
    const {json, language, updateLanguage} = useJson()
    return(
        <h2 className="disclaimer">{json.credits_disclaimer}</h2>
    )
}