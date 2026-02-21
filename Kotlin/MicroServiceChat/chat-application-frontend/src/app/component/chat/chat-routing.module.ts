import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat-room/chat-room';
import { AuthGuard } from '../../core/guards/auth.guard';

console.log("Hello chat")

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
    // canActivate: [AuthGuard], // Protection au niveau parent
    // children: [
    //   {
    //     path: 'room/:id',
    //     loadChildren: () => import('./chat-room/chat-rooms.module').then(m => m.ChatRoomModule)
    //   },
    //   {
    //     path: 'private',
    //     loadChildren: () => import('./private-chat/private-chat.module').then(m => m.PrivateChatModule)
    //   },
    //   {
    //     path: 'private/:id',
    //     loadChildren: () => import('./private-chat/private-chat.module').then(m => m.PrivateChatModule)
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }