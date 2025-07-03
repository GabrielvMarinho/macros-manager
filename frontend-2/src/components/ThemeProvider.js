import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

export default function ({children}){
    const [theme_, setTheme] = useState("light")

    useEffect(() =>{
        document.documentElement.setAttribute('data-theme', theme_);
    }, [theme_])

    return (
        <ThemeContext.Provider value={{theme_, setTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(){
    return useContext(ThemeContext)
}