import { useContext } from "react"
import { useTheme } from "./ThemeProvider"

export default function (){
    const {theme_, setTheme} = useTheme()
    
    return (
        <>
            <h1>{theme_}</h1>
            <button onClick={() =>setTheme("dark")}>dark</button>
            <button onClick={() =>setTheme("light")}>light</button>
        </>
    )
}