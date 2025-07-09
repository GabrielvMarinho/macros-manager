
export default async function getApi(){
    if (window.pywebview && window.pywebview.api){
        return window.pywebview.api
    }
    return new Promise(resolve =>{
        window.addEventListener("pywebviewready", () => {
            resolve(window.pywebview.api)
        })
    })
    
    
}
