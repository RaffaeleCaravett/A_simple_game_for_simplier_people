import { Injectable } from "@angular/core";
import { Message } from "../interfaces/interfaces";
@Injectable({
    providedIn: 'root'
})
export class SocketService {
    socket: any;
    connect() {
        this.socket = new WebSocket('ws://localhost:3031/ws');

        this.socket.onopen = () => {
            this.logMessage('Connected to server');
        };

        this.socket.onmessage = (event: any) => this.logMessage(`Server: ${event.data}`);

        this.socket.onclose = () => {
            this.logMessage('Disconnected from server');
        };

        this.socket.onerror = (error: any) => this.logMessage(`Error: ${error.message}`);
    };

    sendMessage(message: string) {
        this.socket.send(message);
    }
    disconnect() {
        this.socket.close();
    }

    logMessage(message: string) {
        console.log(message)
    }
}