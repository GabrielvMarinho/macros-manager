import { toast } from "sonner";

export default function cancelMacroAndUpdate(stopMacro, file, json, queryValueAgain){
    
    toast.error(json.canceled_macro_toast + file)
    queryValueAgain()
    
    stopMacro(); 
  
}