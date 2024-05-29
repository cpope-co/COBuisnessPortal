import {Injectable, signal} from "@angular/core";
import { Message, MessageSeverity } from "../models/messages.model";


@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  #messageSignal = signal<Message | null>(null);

  message = this.#messageSignal.asReadonly();

  showMessage(text: string, severity: MessageSeverity, duration?: number) {
    this.#messageSignal.set({text, severity});
    if (duration) {
      setTimeout(() => this.clear(), duration);
    }
  }

  clear() {
    this.#messageSignal.set(null);
  }
}
