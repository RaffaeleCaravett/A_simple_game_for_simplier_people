import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { Chat, ChatDTO, Message, SocketDTO } from "../interfaces/interfaces";
import { RxStompService, StompService } from "@stomp/ng2-stompjs";
import { environment } from "../core/environment";
import { WebsocketService } from "./websocket.service";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private chat: string = '/chat';
    private params: string = '/params'
    private messaggio: string = '/messaggi';
    private chatSubject = new Subject<string>();
    private messages: string = '/messages';
    public selectedChat: Chat | null = null;
    public selectChat: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private read: string = '/read'
    constructor(private http: HttpClient, private ws: WebsocketService) { }
    //to call when user send message
    sendMessage(message: Message) {
        let socketDTO: SocketDTO = {
            messageDTO: message,
            moveDTO: null,
            gameConnectionDTO: null,
            connectionDTO: null,
            connectionRequestDTO: null
        }
        this.ws.send(socketDTO);

        // let messag: Message = {
        //     message: "PROVA SOCKET",
        //     riceventi: [1],
        //     mittente: 3,
        //     chat: 2
        // }
        // socketDTO.messageDTO = messag;
        // setTimeout(() => {
        //     this.ws.send(socketDTO);

        // }, 2000)
        //return this.http.post(environment.API_URL + this.messaggio, message, { headers: new HttpHeaders({ timeout: `${600000}` }) });
    }
    //to call on focus on chat or on input
    readMessages(chatId: number) {
        return this.http.get(environment.API_URL + this.messaggio + this.read + `?chatId=${chatId}`);
    }

    getAllChatsByUserId(userId: number) {
        return this.http.get(environment.API_URL + this.chat + this.params + `?userId=${userId}`);
    }
    /* TO IMPLEMENT
      showNotification(message: Message) {
          const snackBarRef = this.snackBar.open('New message from ' + message.sender, 'Show', { duration: 3000 });
          this.highlightedUsers.push(message.sender);
          snackBarRef.onAction().subscribe(() => {
              this.receiver = message.sender;
              this.receiverUpdated.emit(message.sender);
              this.channel = ChannelService.createChannel(this.username, message.sender);
              this.channelService.refreshChannel(this.channel);
          });
      }
      startChatWithUser(user) {
          const channelId = ChannelService.createChannel(this.username, user.username);
          this.channelService.refreshChannel(channelId);
          this.receiver = user.username;
          this.highlightedUsers = this.highlightedUsers.filter(u => u !== user.username);
          this.receiverUpdated.emit(user.username);
          this.messageService.sendReadReceipt(channelId, user.username);
      }
  */

    getSelectedChat() {
        return this.selectedChat;
    }
    setSelectedChat(chat: Chat | null) {
        this.selectedChat = chat;
    }

    createChat(chat: ChatDTO, multipartFile: File | null) {
        let formData = new FormData();
        formData.append('body', new Blob([JSON.stringify(chat)], {
            type: 'application/json'
        }));
        if (multipartFile) {
            formData.append('file', multipartFile);
        }
        return this.http.post(environment.API_URL + this.chat, formData);
    }

    getAvailableUsersForChat() {
        return this.http.get(environment.API_URL + this.chat + '/availableContacts');
    }
};