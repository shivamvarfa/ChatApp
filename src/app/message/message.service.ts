import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private getUserQuery = gql`
  query GetAllUser($id: String!) {
    getAllUser(id: $id) {
      id
      username
      email
      logOutTimer
      isLogin
      profileImage
      lastMessageTimestamp
    }
  }
`;


private CREATE_MESSAGE_MUTATION = gql`
    mutation CreateMessage($createMessageDto: CreateMessageDto!) {
      createMessage(createMessageDto: $createMessageDto) {
        id
        content
        createdAt
        sender {
          id
          username
        }
        receiver {
          id
          username
        }
        imageData
      }
    }
  `;

private GET_MESSAGES_BETWEEN = gql`
    query GetMessagesBetween($senderId: String!, $receiverId: String!) {
      getMessagesBetween(senderId: $senderId, receiverId: $receiverId) {
        id
        content
        createdAt
        sender {
          id
          username
        }
        receiver {
          id
          username
          
        }
          read
          imageData
      }
    }
  `;

  
  private MESSAGE_CREATED_SUBSCRIPTION = gql`
  subscription {
    messageCreated {
      id
      content
      createdAt
      sender {
          id
          username
        }
        receiver {
          id
          username
        }
          imageData
          read
    }
  }
`;

private readonly markAsReadMutation = gql`
    mutation MarkAsRead($senderId: String!, $receiverId: String!) {
      markAsRead(senderId: $senderId, receiverId: $receiverId) {
        id
        content
        createdAt
        sender {
          id
          username
        }
        receiver {
          id
          username
        }
        read
        imageData
      }
    }
  `;

  private UNREAD_COUNTS = gql`
  query UnReadCounts($senderId: String!, $receiverIds: [String!]!) {
    unReadCounts(senderId: $senderId, receiverIds: $receiverIds) {
      receiverId
      unreadCount
    }
  }
`;
private editMessageMutation = gql`
mutation EditMessage($id: String!, $updateMessageDto: UpdateMessageDto!) {
  editMessage(id: $id, updateMessageDto: $updateMessageDto) {
    id
    content
  }
}
`;
private deleteMessageMutation = gql`
mutation DeleteMessage($id: String!) {
  deleteMessage(id: $id)
}
`;
private MESSAGES_MARKED_AS_READ_SUBSCRIPTION = gql`
  subscription {
    messagesMarkedAsRead {
      id
      content
      read
      createdAt
      imageData
      sender{
         id
         username 
      }
      receiver{
      id
      username
      }
    }
  }
`;

private UNREAD_COUNTS_SUBSCRIPTION = gql`
  subscription UnreadCounts($senderId: String!, $receiverIds: [String!]!) {
    unreadCounts(senderId: $senderId, receiverIds: $receiverIds) {
      receiverId
      unreadCount
    }
  }
`;

private  MESSAGE_DELETED_SUBSCRIPTION = gql`
    subscription MessageDeleted {
      messageDeleted {
        id
      }
    }
  `;

  constructor(private apollo: Apollo) { }

  
  getAllUser(id: string): Observable<any> {
    return this.apollo.query({
      query: this.getUserQuery,
      variables: { id },
    });
  }

  createMessage(createMessageDto: {
    content: string;
    sender: string;
    receiver: string;
    imageData?: string | null;
  }): Observable<any> {
    return this.apollo.mutate({
      mutation: this.CREATE_MESSAGE_MUTATION,
      variables: {
        createMessageDto
      }
    });
  }

  getMessagesBetween(senderId: string, receiverId: string): Observable<any> {
    return this.apollo.watchQuery({
      query: this.GET_MESSAGES_BETWEEN,
      variables: {
        senderId,
        receiverId
      }
    }).valueChanges;
  }

  messageCreated(): Observable<any> {
    return this.apollo.subscribe({
      query: this.MESSAGE_CREATED_SUBSCRIPTION
    });
  }

  getUser(id: string): Observable<any> {
    return this.apollo.query({
      query: gql`
        query GetUser($id: String!) {
          getUser(id: $id) {
            id
            username
            email
            logOutTimer
            profileImage
          }
        }
      `,
      variables: {
        id,
      },
    });
  }

 markAsRead(senderId: string, receiverId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.markAsReadMutation,
      variables: {
        senderId,
        receiverId
      }
    });
  }
  
   getUnreadcount(senderId:string,receiverIds:String[]):Observable<any>{
    return this.apollo.query({
      query: this.UNREAD_COUNTS,
      variables: {
        senderId,
        receiverIds
      },
      fetchPolicy: 'network-only' // Forces a fresh request to the server
    });
   }
  

    editMessage(id: string, updateMessageDto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: this.editMessageMutation,
      variables: {
        id,
        updateMessageDto,
      },
    });
  }

  deleteMessage(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.deleteMessageMutation,
      variables: {
        id,
      },
    });
  }


   groupMessagesByDate(messages: any[]): { [date: string]: any[] } {
    return messages.reduce((acc, message) => {
      const date = new Date(message.createdAt).toDateString(); // Group by date
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  }

  messagesMarkedAsRead(): Observable<any> {
    return this.apollo.subscribe({
      query: this.MESSAGES_MARKED_AS_READ_SUBSCRIPTION
    });
  }

  getUnreadCounts(senderId: string, receiverIds: string[]): Observable<any> {
    return this.apollo.subscribe({
      query: this.UNREAD_COUNTS_SUBSCRIPTION,
      variables: {
        senderId,
        receiverIds
      }
    });
  }


  onMessageDeleted(): Observable<any> {
    return this.apollo.subscribe({
      query: this.MESSAGE_DELETED_SUBSCRIPTION
    });
  }
}
