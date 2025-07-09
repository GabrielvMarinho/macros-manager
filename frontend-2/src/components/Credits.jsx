import { useJson } from "./getLanguageJson"

export default function ({json}){
    return(
        <h2 className="disclaimer">{json.credits_disclaimer}</h2>
    )
}