import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  userInput = '';
  awaitingVmIp = false;
  awaitingPemKey = false;
  pendingDeployment = false;
  deploymentVmIp = '';

  messages = [
    {
      sender: 'bot',
      text: '👋 Hey! I am CertiBot. Ask me anything about certificates.'
    }
  ];

  constructor(private chatService: ChatService) {}

  sendMessage() {

    if (!this.userInput.trim()) {
      return;
    }

    const question = this.userInput;

    this.messages.push({
      sender: 'user',
      text: question
    });

    this.userInput = '';

    if (this.awaitingVmIp) {
      this.deploymentVmIp = question;
      this.awaitingVmIp = false;
      this.awaitingPemKey = true;
      this.messages.push({
        sender: 'bot',
        text: '🔑 Great. Please send the PEM private key for the VM so I can deploy the certificate.'
      });
      return;
    }

    if (this.awaitingPemKey) {
      this.pendingDeployment = true;
      this.awaitingPemKey = false;
      this.messages.push({
        sender: 'bot',
        text: '⏳ Deploying the certificate to your VM now...'
      });

      this.chatService.deployCertificate(this.deploymentVmIp, question)
        .subscribe({
          next: (response: any) => {
            this.pendingDeployment = false;
            this.messages.push({
              sender: 'bot',
              text: response.reply || '✅ Certificate deployment request completed.'
            });
          },
          error: (error) => {
            this.pendingDeployment = false;
            this.messages.push({
              sender: 'bot',
              text: '❌ ' + (error?.message || 'Deployment failed.')
            });
          }
        });
      return;
    }

    this.messages.push({
      sender: 'bot',
      text: '⏳ Thinking...'
    });

    this.chatService.send(question)
      .subscribe({

        next: (response: any) => {

          this.messages.pop();
          this.handleBotReply(response.reply);

        },

        error: (error) => {

          this.messages.pop();

          this.messages.push({
            sender: 'bot',
            text: '❌ ' + error.message
          });

        }

      });
  }

  handleBotReply(reply: string) {
    const normalizedReply = (reply || '').toLowerCase();

    if (normalizedReply.includes('certificate created') || normalizedReply.includes('certificate is created') || normalizedReply.includes('certificate created successfully')) {
      this.awaitingVmIp = true;
      this.messages.push({
        sender: 'bot',
        text: '✅ Certificate created successfully. Please provide the VM IP address so I can deploy it to your application.'
      });
      return;
    }

    this.messages.push({
      sender: 'bot',
      text: reply
    });
  }
}