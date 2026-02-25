// statistics.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsRoutingModule } from './statistics-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StatisticsRoutingModule
  ],
})
export class StatisticsModule { }