

class WebSocketManager{
    socketsRef = {}
    listeners = {}
    createWsConnection(section, file){
        const id = section+"/"+file
        const socket = new WebSocket(`ws://localhost:8765/receiver/${id}`);
        this.socketsRef[id] = socket;
        this.listeners[id] = new Set();
        socket.onmessage = (event) =>{
            this.listeners[id](event)
        }
        socket.onclose = () =>{
            delete this.listeners[id]
            delete this.socketsRef[id] 
        }
        

        return socket
        
    }
    // getWsConnection(section, file){

    //     const id = section+"/"+file
    //     const socket = this.socketsRef[id] 
    //     if(!socket){
    //         return this.createWsConnection(section, file)
    //     }
    //     return socket

    // }
    addListener(section, file, onMessage) {
        const id = `${section}/${file}`;
    
        this.listeners[id] = onMessage;
   
    }
}

export const wsManager = new WebSocketManager() 