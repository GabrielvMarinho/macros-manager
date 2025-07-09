import "@/style.css"
import { useState } from "react"

export default function(){
    const [hover, setHover] = useState(false)

    return (
        <svg  onMouseEnter={() =>setHover(true)} onMouseLeave={() =>setHover(false)} className="icon " viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M666.667 375C680.473 375 691.667 386.193 691.667 400C691.667 413.807 680.473 425 666.667 425H358.333V600C358.333 610.113 352.243 619.227 342.9 623.097C333.56 626.967 322.806 624.83 315.656 617.68L115.656 417.68C110.967 412.99 108.333 406.63 108.333 400C108.333 393.37 110.967 387.01 115.656 382.323L315.656 182.323C322.806 175.173 333.56 173.034 342.9 176.904C352.243 180.773 358.333 189.889 358.333 200.001V375H666.667Z" fill={hover?"var(--color-primary)":"var(--text-dark)"}/>
        </svg>
    )
}