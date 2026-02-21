import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ChatComponent } from './chat-room/chat-room';
import { ChatParticipantService } from '../../core/services/chat/chat-participant.service';
import { ChatRoomService } from '../../core/services/chat/chat-room.service';
import { ChatWebSocketService } from '../../core/services/chat/chat.websocket.service';
import { MessageService } from '../../core/services/chat/message.service';
import { ChatRoutingModule } from './chat-routing.module';

@NgModule({ 
  imports: [
    CommonModule,
    FormsModule,
    ChatRoutingModule,
    ChatComponent
  ],
  providers: [
    ChatRoomService,
    MessageService,
    ChatParticipantService,
    ChatWebSocketService
  ]
})
export class ChatModule { }