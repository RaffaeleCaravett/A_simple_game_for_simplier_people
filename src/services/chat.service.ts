import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Chat, Message } from "../interfaces/interfaces";
import { RxStompService, StompService } from "@stomp/ng2-stompjs";
import { environment } from "../core/environment";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private chat: string = '/chat';
    private messaggio: string = '/messaggi';
    private chatSubject = new Subject<string>();
    private messages: string = '/messages';
    public selectedChat: Chat | null = null;
    constructor(private http: HttpClient, private stompService: RxStompService) { }
    //to call when user send message
    sendMessage(message: Message) {
        if (message) {
            this.stompService.publish({
                destination: '/app/messages', body:
                    JSON.stringify({
                        message
                    })
            });
        }
        return this.http.post(environment.API_URL + this.messaggio, message);
    }
    //to call on focus on chat or on input
    readMessages(chatId: number, viewer: number) {
        return this.http.post(environment.API_URL + this.messaggio + this.messages, { chatId: chatId, senderId: viewer });
    }

    getAllChatsByUserId(userId: number) {
        return this.http.get(environment.API_URL + this.chat + `?userId=${userId}`);
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
    setSelectedChat(chat: Chat) {
        this.selectedChat = chat;
    }
};