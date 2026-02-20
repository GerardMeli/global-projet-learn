import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatRoomListComponent } from './chat-room-list.component';
import { ChatRoomComponent } from './chat-room.component';
import { PrivateChatComponent } from './private-chat.component';

const routes: Routes = [
  { path: 'rooms', component: ChatRoomListComponent },
  { path: 'rooms/:id', component: ChatRoomComponent },
  { path: 'private', component: PrivateChatComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}