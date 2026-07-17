import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { ChatService } from './services/chat.service';

describe('AppComponent', () => {
  let chatService: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    chatService = jasmine.createSpyObj('ChatService', ['send', 'deployCertificate']);
    chatService.deployCertificate.and.returnValue(of({ reply: 'Deployment started' }));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: ChatService, useValue: chatService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should ask for the VM IP after a certificate creation reply', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.handleBotReply('Certificate created successfully.');

    expect(app.awaitingVmIp).toBeTrue();
    expect(app.messages[app.messages.length - 1].text).toContain('VM IP');
  });

  it('should request deployment after the VM IP and PEM key are provided', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.handleBotReply('Certificate created successfully.');

    app.userInput = '203.0.113.10';
    app.sendMessage();

    app.userInput = '-----BEGIN PRIVATE KEY-----';
    app.sendMessage();

    expect(chatService.deployCertificate).toHaveBeenCalledWith('203.0.113.10', '-----BEGIN PRIVATE KEY-----');
  });
});
