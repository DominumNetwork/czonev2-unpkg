import React from 'react';
import WidgetBot from '@widgetbot/react-embed';
import { AlertCircle } from 'lucide-react';

export const ChatPage = () => {
    return (
        <div className="w-full h-[80vh] p-6 lg:p-10 flex flex-col gap-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
            <div className="text-blue-100 text-sm">
              <strong>Having trouble entering the chat?</strong> If you see a <span className="text-red-400">"Captcha verification is required"</span> error when trying to join as a GUEST, it means your browser is blocking the security check. 
              Please click <strong>"Discord account? Log in"</strong> at the bottom of the prompt instead.
            </div>
          </div>
          <div className="flex-1 min-h-0 relative">
            <WidgetBot
              server="1450136714600382496"
              channel="1491521827888173107"
              className="w-full h-full rounded-3xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
    );
};
