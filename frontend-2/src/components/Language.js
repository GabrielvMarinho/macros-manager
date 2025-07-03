import { useJson } from "./getLanguageJson"

export default function LanguageSelector() {
    const { language, updateLanguage } = useJson()

    const brazil = require("@/icons/brazil.png")
    const germany = require("@/icons/germany.png")
    const france = require("@/icons/france.png")
    const english = require("@/icons/united-states.png")
    const spain = require("@/icons/spain.png")

    const icons = {
        EN: english,
        DE: germany,
        ES: spain,
        FR: france,
        PT: brazil,
    }
    console.log(language)

    return (
        <div className="flagContainer">
            {Object.entries(icons).map(([key, value]) => (
                <img
                    key={key}
                    onClick={() => updateLanguage(key)}
                    src={value}
                    className={key==language?"flagIconSelected":"flagIcon"}
                    alt={key}
                />
            ))}
        </div>
    )
}
