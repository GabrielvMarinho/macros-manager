import { useContext } from "react"
import { useTheme } from "./ThemeProvider"
import Moon from "@/icons/Moon"
import Sun from "@/icons/Sun"

export default function (){
    const {theme_, setTheme} = useTheme()
    
    return (
        <div style={{display:"flex", gap:"10px"}}>
            
            <div className={theme_=="light"?"selectedTheme":"nonSelectedTheme"} classNamr="icon" style={{padding:"4px"}} onClick={() =>setTheme("light")}>
                <Sun/>
            </div>
            <div className={theme_=="dark"?"selectedTheme":"nonSelectedTheme"} classNamr="icon" style={{padding:"4px"}} onClick={() =>setTheme("dark")}>
                <Moon/>
            </div>
        </div>
    )
}