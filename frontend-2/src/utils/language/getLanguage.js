export default function(){
    if(localStorage.getItem("lang")==null){
        localStorage.setItem("lang", "EN")
    }
    return localStorage.getItem("lang")
}