import { useJson } from "@/components/getLanguageJson";
import { toast } from "sonner";


export default function onMessageMacroDashboard(event, key, setexecutingMap, setProgressoMap, queryValueAgain, socket, json, file, resolvePromise){
    const msg = event.data;
    
    switch (msg){
        case "macro_started":
            resolvePromise()
            setexecutingMap(prev =>({
                ...prev,
                [key]: true
            }))
            queryValueAgain()

            
        break;
        
        case "macro_executed":
            toast.success(json.finished_macro_toast + file)
            setexecutingMap(prev =>({
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
            setexecutingMap(prev =>({
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