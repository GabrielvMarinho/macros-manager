import { useRef } from "react"
import { useJson } from "./getLanguageJson"

export default function({ setInputesHook, columnsObj, inputHook }) {
    const { json } = useJson()
    const inputsRef = useRef({})

    const pasteInput = (e, value, index) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").split("\n");

        setTimeout(() => {
            const nextInput = inputsRef.current?.[`${value}-${index + pastedData.length}`];
            if (nextInput) nextInput.focus();
        }, 0);

        setInputesHook(prev => {
            const current = prev[value] || [];
            return {
                ...prev,
                [value]: [
                    ...current.slice(0, index),
                    ...pastedData,
                    ...current.slice(index)
                ]
            };
        });
    };

    const newCell = (e, value, index) => {
        if (e.key !== "Enter") return;

        setTimeout(() => {
            const nextInput = inputsRef.current?.[`${value}-${index + 1}`];
            if (nextInput) nextInput.focus();
        }, 0);

        setInputesHook(prev => {
            const current = [...(prev[value] || [])]; // copia do array atual
            current.splice(index + 1, 0, ""); // insere "" após o índice atual

            return {
                ...prev,
                [value]: current
            };
        });

    };
    const deleteCell = (e, value, index) => {
        if (e.key !== "Backspace" || index ==0 || inputHook[value][index] != "") return;
        e.preventDefault()
        setInputesHook(prev => {
            const list = { ...prev }; // copia o objeto
            
            list[value] = [...list[value]]; // copia o array interno
            list[value].splice(index, 1); // agora pode alterar
            
        setTimeout(() =>{
            const beforeInput = inputsRef.current?.[`${value}-${index-1}`]
            if(beforeInput) beforeInput.focus()
        })
        return list;
    });
    }
    const UpdateCell = (e, value, index) => {
        const newValue = e.target.value;

        if (e.clipboardData) return;

        setInputesHook(prev => ({
            ...prev,
            [value]: prev[value].map((item, i) => i === index ? newValue : item)
        }));
    };

    const cleanInput = (value) => {
        setInputesHook(prev => ({
            ...prev,
            [value]: ['']
        }));
    };

    return (
        <div style={{display:"flex", gap:"20px"}}>
            
            <div className="inputTable">
                <table>
                    <tr className="mainTableRow">
                        {Object.entries(columnsObj).map(([key, value]) => (
                            
                            
                            <td key={value}>
                                <div
                                    onClick={() => cleanInput(value)}
                                    className={`${inputHook[value]?.[0] || inputHook[value].length>1 ? "cleanButton" : "cleanButtonHidden"}`}>
                                    {inputHook[value]?.[0] || inputHook[value].length>1 ? json.clean : ""}
                                </div>

                                <div className="dataTitle">{key}</div>

                                {inputHook[value]?.map((data, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => inputsRef.current[`${value}-${index}`] = el}
                                        onKeyDown={(e) => {newCell(e, value, index); deleteCell(e, value, index)}}
                                        onChange={(e) => UpdateCell(e, value, index)}
                                        onPaste={(e) => pasteInput(e, value, index)}
                                        value={data}
                                        className="dataCell"
                                    />
                                ))}
                            </td>
                            
                        ))}
                    </tr>
                </table>
            </div>
            <div className="hintsTable">
                <h3>{json.hint1_table}</h3>
                <h3>{json.hint2_table}</h3>
                <h3>{json.hint3_table}</h3>
            </div>
        </div>
    )
}
