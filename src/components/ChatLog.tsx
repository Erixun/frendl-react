import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { ZoneChatLogEntry, ZoneStore } from '../store/zoneStore';

const ChatLog = ({ zone }: { zone?: ZoneStore }) => {
  if (!zone) return null;

  useEffect(() => {
    console.log('ChatLog mounted');
    const chatLog = document.getElementById('chat-log');
    chatLog?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [zone.chatLog]);

  if (!zone.chatLog.length)
    return (
      <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
        No messages yet
      </p>
    );

  const isCurrentUser = (username: string) => {
    return username === zone.map.currentUser.username;
  };

  const getTimeStamp = (entry: ZoneChatLogEntry) => {
    return new Date(entry.createdAt).toLocaleTimeString('sv', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAnotherUser = (
    entry: ZoneChatLogEntry,
    i: number,
    arr: ZoneChatLogEntry[]
  ) => {
    if (i === 0) return true;
    return entry.username !== arr[i - 1].username;
  };

  return (
    <div
      id="chat-log"
      style={{
        display: 'grid',
        gridTemplateColumns: '100%',
        gap: '0.5rem',
        fontSize: '1rem',
        paddingBlockEnd: '1rem',
      }}
    >
      {zone.chatLog.map((entry, i, arr) => {
        
        const isDifferentUser = isAnotherUser(entry, i, arr);
        
        const logEntry = isCurrentUser(entry.username) ? {
          headerColor: '#5a4cff',
          bodyColor: '#deffde',
          marginInline: '15% 0',
        } : {
          headerColor: '#975524',
          bodyColor: '#e6e6ff',
          marginInline: '0 15%',
        };
        
        return (
          <div
          key={i}
          className="chatlog-entry"
          style={{
            boxShadow:" #b5b5b5 0px 0px 1px 1px",
            borderRadius: '4px',
            padding: '4px 8px',
              background: logEntry.bodyColor,
              position: 'relative',
              marginInline: `${
                //TODO: if current user, show on right side
                //TODO: if not current user, show on left side
                isCurrentUser(entry.username) ? '15% 0' : '0 15%'
              }`,
              marginTop: `${isDifferentUser ? '0.5rem' : '0'}`,
            }}
            >
            {isDifferentUser && (
              //If previous message is from another user, show username
              <div
              className="username"
                style={{ fontWeight: 'bold', color: logEntry.headerColor }}
              >
                {entry.username}
              </div>
            )}
            <div className="msg-body">
              {entry.message}
              <div
                className="timestamp"
                style={{
                  fontSize: '10px',
                  position: 'absolute',
                  bottom: '2px',
                  right: '6px',
                  float: 'right',
                  clear: 'right',
                }}
              >
                {getTimeStamp(entry)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ChatLogObserver = observer(ChatLog);
