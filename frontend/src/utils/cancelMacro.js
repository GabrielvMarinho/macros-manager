import { toast } from "sonner";

export default function cancelMacro(stopMacro, section, file, setExecutando, setProgresso, socketRef, json){
    
    toast.error(json.canceled_macro_toast + file)
    stopMacro(section, file); 
    setExecutando(false);
    setProgresso(null);

    if (socketRef.current) {
      socketRef.current.close();
    }
}