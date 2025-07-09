import { useState } from "react"

export default function(){
    const [hover, setHover] = useState(false)
    return (
        <svg onMouseEnter={() =>setHover(true)} onMouseLeave={() =>setHover(false)} className="icon" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M683.337 200H116.667" stroke={hover?"var(--button-error-color)":"var(--text-dark)"} strokeWidth="50" strokeLinecap="round"/>
            <path d="M627.773 283.333L612.44 513.303C606.54 601.8 603.59 646.05 574.757 673.023C545.923 700 501.577 700 412.883 700H387.107C298.412 700 254.065 700 225.231 673.023C196.398 646.05 193.448 601.8 187.548 513.303L172.217 283.333" stroke={hover?"var(--button-error-color)":"var(--text-dark)"} strokeWidth="50" strokeLinecap="round"/>
            <path d="M316.667 366.667L333.333 533.333" stroke={hover?"var(--button-error-color)":"var(--text-dark)"} strokeWidth="50" strokeLinecap="round"/>
            <path d="M483.333 366.667L466.667 533.333" stroke={hover?"var(--button-error-color)":"var(--text-dark)"} strokeWidth="50" strokeLinecap="round"/>
            <path d="M216.667 200C218.529 200 219.461 200 220.305 199.979C247.753 199.283 271.967 181.83 281.307 156.011C281.595 155.216 281.889 154.333 282.478 152.566L285.714 142.857C288.477 134.569 289.858 130.425 291.69 126.907C299 112.869 312.525 103.121 328.154 100.626C332.071 100 336.44 100 345.177 100H454.823C463.56 100 467.93 100 471.847 100.626C487.477 103.121 501 112.869 508.31 126.907C510.143 130.425 511.523 134.569 514.287 142.857L517.523 152.566C518.11 154.331 518.407 155.217 518.693 156.011C528.033 181.83 552.247 199.283 579.697 199.979C580.54 200 581.47 200 583.333 200" stroke={hover?"var(--button-error-color)":"var(--text-dark)"} strokeWidth="50"/>
        </svg>
    )
}