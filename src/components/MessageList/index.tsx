import { api } from '../../services/api';
import { io } from 'socket.io-client';
import styles from './styles.module.scss';
import logoImg from '../../assets/logo.svg'
import { useEffect, useState } from 'react';

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

const messagesQueue: Message[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage: Message) => {
  messagesQueue.push(newMessage);
})

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]); // valor inicial um array vazio

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0],//dados novo
          prevState[0],//dados antigos
          prevState[1],//dados antigos
        ].filter(Boolean)) //remove undefined/false/null

        messagesQueue.shift();//remover o item mais antigo da fila
      }
    }, 3000)
  }, [])

  useEffect(() => { // chamada api
    api.get<Message[]>('messages/last3').then(response => {
      setMessages(response.data);
    })
  }, [])// [] para fazer ao carregar 
  return (
    <div className={styles.messageListWarpper}>
      <img src={logoImg} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map(message => {
          return (
            <li key={message.id} className={styles.message}>
              <p className={styles.messageContent}>{message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={message.user.avatar_url} alt={message.user.name} />
                </div>
                <span>{message.user.name}</span>
              </div>
            </li>
          )
        })}

      </ul>
    </div>
  )
}