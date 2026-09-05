import { Component, inject } from '@angular/core';

import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-host',
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss'
})
export class ToastHost {
  protected readonly toastService = inject(ToastService);
}
