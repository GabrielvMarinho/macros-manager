import { useJson } from "@/components/getLanguageJson";
import { toast } from "sonner";


export default function onMessageMacro(event, setLoading, setExecutando, setProgresso, socket, json, actualFileName, resolvePromise, setApi){
    console.log(event)
    const msg = event.data;
    switch (msg){
        case "macro_started":
            resolvePromise()
            setExecutando(true);
            //checking setloading because if the macro starts only in the main page it wont have setLoading hook
            if(setLoading !=null){
                setLoading(false)
            }
            
        break;
        
        case "macro_executed":
            
            toast.success(json.finished_macro_toast + actualFileName)
            setExecutando(false);
            setProgresso(null);
            socket.close();

            //to trigger the useffect of the dashboard
            if(setApi){
                setApi(null)
            }
        break;

        case "macro_error":
            toast.error(json.error_macro_toast + actualFileName)
            setExecutando(false)
            socket.close();
        break;
        default:
            const value = parseFloat(msg);
            if (!isNaN(value) && setProgresso) {
                setProgresso(value);
            }
        break;
    }
}