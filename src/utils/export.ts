import { Conversation } from '../types';
import { format } from 'date-fns';

export const exportConversation = {
  toText: (conversation: Conversation): string => {
    const header = `Vyone & Hubertus Love Story - ${conversation.title}\n`;
    const date = `Exported on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\n`;
    const separator = '=' + '='.repeat(50) + '\n\n';
    
    const messages = conversation.messages
      .filter(msg => !msg.isTyping)
      .map(msg => {
        const time = format(msg.timestamp, 'HH:mm');
        const sender = msg.isUser ? 'You' : 'Love Story Bot';
        return `[${time}] ${sender}: ${msg.content}`;
      })
      .join('\n\n');

    return header + date + separator + messages;
  },

  toJSON: (conversation: Conversation): string => {
    return JSON.stringify({
      title: conversation.title,
      exportDate: new Date().toISOString(),
      messages: conversation.messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp.toISOString()
        }))
    }, null, 2);
  },

  toHTML: (conversation: Conversation): string => {
    const messages = conversation.messages
      .filter(msg => !msg.isTyping)
      .map(msg => {
        const time = format(msg.timestamp, 'HH:mm');
        const className = msg.isUser ? 'user-message' : 'bot-message';
        const sender = msg.isUser ? 'You' : 'Love Story Bot';
        return `
          <div class="message ${className}">
            <div class="message-header">
              <strong>${sender}</strong>
              <span class="time">${time}</span>
            </div>
            <div class="message-content">${msg.content.replace(/\n/g, '<br>')}</div>
          </div>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${conversation.title}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #667eea; font-family: 'Playfair Display', serif; }
          .message { margin-bottom: 20px; padding: 15px; border-radius: 15px; }
          .user-message { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-left: 20%; }
          .bot-message { background: #f8fafc; border: 1px solid #e2e8f0; margin-right: 20%; }
          .message-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; opacity: 0.8; }
          .message-content { line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💕 Vyone & Hubertus Love Story</h1>
            <h2>${conversation.title}</h2>
            <p>Exported on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          ${messages}
        </div>
      </body>
      </html>
    `;
  }
};

export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};