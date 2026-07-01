import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: `./unauthorized.html`,
  styleUrls: [`./unauthorized.scss`]
})
export class UnauthorizedComponent {}