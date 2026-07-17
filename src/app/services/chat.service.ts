import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {}

  send(message: string) {
    return this.http.post<any>(
      'http://localhost:9001/chat',
      {
        message: message
      }
    );
  }

  deployCertificate(vmIp: string, pemKey: string) {
    return this.http.post<any>(
      'http://localhost:9001/deploy-certificate',
      {
        vmIp,
        pemKey
      }
    );
  }
}