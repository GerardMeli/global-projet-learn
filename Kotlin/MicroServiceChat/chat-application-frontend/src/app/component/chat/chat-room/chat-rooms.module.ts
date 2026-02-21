import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ChatComponent } from './chat-room';
import { ChatRoomRoutingModule } from './chat-rooms-routing.module';
import { ChatParticipantService } from '../../../core/services/chat/chat-participant.service';
import { ChatWebSocketService } from '../../../core/services/chat/chat.websocket.service';
import { MessageService } from '../../../core/services/chat/message.service';
import { FileManagerService } from '../../../core/services/file/file.service';
import { TokenService } from '../../../core/services/users/token.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChatRoomRoutingModule, 
    // ChatComponent
  ],
  providers: [
    MessageService,
    ChatParticipantService,
    ChatWebSocketService,
    FileManagerService,
    TokenService
  ]
})
export class ChatRoomModule { }