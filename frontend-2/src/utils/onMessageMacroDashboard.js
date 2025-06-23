import { useJson } from "@/components/getLanguageJson";
import { toast } from "sonner";


export default function onMessageMacroDashboard(event, key, setExecutandoMap, setProgressoMap, queryValueAgain, socket, json, file, resolvePromise){
    const msg = event.data;
    switch (msg){
        case "macro_started":
            resolvePromise()
            setExecutandoMap(prev =>({
                ...prev,
                [key]: true
            }))
            
        break;
        
        case "macro_executed":
            console.log("finish this")
            toast.success(json.finished_macro_toast + file)
            setExecutandoMap(prev =>({
                ...prev,
                [key]: false
            }))
            queryValueAgain()
            setProgressoMap(prev =>({
                ...prev,
                [key]: null
            }))
            
            

            socket.close();

           
        break;

        case "macro_error":
            toast.error(json.error_macro_toast + file)
            setExecutandoMap(prev =>({
                ...prev,
                [key]: false
            }))
            socket.close();
        break;
        default:
            const value = parseFloat(msg);
            if (!isNaN(value)) {
                setProgressoMap(prev =>({
                    ...prev,
                    [key]: value
                }))
            }
        break;
    }
}