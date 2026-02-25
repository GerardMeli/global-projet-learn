import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateChatComponent } from './private-chat.component';

console.log("Hello private chat")


const routes: Routes = [
  {
    path: '',
    component: PrivateChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateChatRoutingModule { }