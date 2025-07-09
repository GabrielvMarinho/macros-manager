import { useState } from "react"

export default function(){
    const [hover, setHover] = useState(false)

    return (
        <svg onMouseEnter={() =>setHover(true)} onMouseLeave={() =>setHover(false)} className="icon" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M700 100V266.667M700 266.667H533.333M700 266.667L600 176.389C546.923 128.885 476.837 100 400 100C234.315 100 100 234.315 100 400C100 565.687 234.315 700 400 700C542.773 700 662.25 600.267 692.567 466.667" stroke={hover?"var(--color-primary)":"var(--text-dark)"} strokeWidth="66.6667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}