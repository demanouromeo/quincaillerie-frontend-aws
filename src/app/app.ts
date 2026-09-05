import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ChangerMotDePasseModal } from './shared/changer-mot-de-passe-modal/changer-mot-de-passe-modal';
import { ToastHost } from './shared/toast-host/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost, ChangerMotDePasseModal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
