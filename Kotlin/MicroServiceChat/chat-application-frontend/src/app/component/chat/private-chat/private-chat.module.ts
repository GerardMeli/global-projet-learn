import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { PrivateChatComponent } from './private-chat.component'; 
import { FileManagerService } from '../../../core/services/file/file.service';
import { TokenService } from '../../../core/services/users/token.service';
import { ChatWebSocketService } from '../../../core/services/chat/chat.websocket.service';
import { ProfileService } from '../../../core/services/users/profile.service';
import { PrivateChatService } from '../../../core/services/chat/private-chat.service';
import { PrivateChatRoutingModule } from './private-chat-routing.module';

@NgModule({ 
  imports: [
    CommonModule,
    FormsModule,
    PrivateChatRoutingModule,
    PrivateChatComponent,
    FormsModule
  ],
  providers: [
    PrivateChatService,
    ProfileService,
    FileManagerService,
    ChatWebSocketService,
    TokenService
  ]
})
export class PrivateChatModule { }