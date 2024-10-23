import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

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
      isTyping
      phoneNumber
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
          deletedUser
          deleteUserForEveryone
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
private DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($id: String!, $userId: String!) {
    deleteMessage(id: $id, userId: $userId) {
      id
      content
      createdAt
    }
  }
`;
private deleteMessageForMeMutation = gql`
mutation DeleteMessageForMe($id: String!, $userId: String!) {
  deleteMessageForMe(id: $id, userId: $userId)
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
private USER_UPDATED_SUBSCRIPTION = gql`
  subscription UserUpdated($id: String!) {
    userUpdated(id: $id) {
      id
      username
      email
      isTyping
    }
  }
`;

private CHECK_BLOCK_USER = gql`
query CheckBlockUser($userId: String!, $recevierId: String!) {
  checkBlockUser(userId: $userId, recevierId: $recevierId)
}
`;


private BLOCK_USER_MUTATION = gql`
      mutation BlockUser($userId: String!, $blockUserId: String!) {
        blockUser(userId: $userId, blockUserId: $blockUserId) {
          id
          username
          blockedUsers
        }
      }
    `;
    private UNBLOCK_USER_MUTATION = gql`
  mutation UnblockUser($userId: String!, $unblockUserId: String!) {
    unblockUser(userId: $userId, unblockUserId: $unblockUserId) {
      id
      username
      
    }
  }
`;


  constructor(private apollo: Apollo) { }

  
  getAllUser(id: string): Observable<any> {
    return this.apollo.watchQuery({
      query: this.getUserQuery,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges;
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
    }).pipe(
      catchError(error => {
        const status = error.graphQLErrors[0]?.extensions;
        const message = error.graphQLErrors[0]?.message;
        return throwError({ status, message });
      })
    );
   }
 

  getMessagesBetween(senderId: string, receiverId: string): Observable<any> {
    return this.apollo.watchQuery({
      query: this.GET_MESSAGES_BETWEEN,
      variables: {
        senderId,
        receiverId
      },
      fetchPolicy: 'network-only' // Ensure fresh data is fetched from the server
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
            phoneNumber
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

  deleteMessage(id: string,userId:string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.DELETE_MESSAGE_MUTATION,
      variables: {
        id,
        userId
      },
    });
  }

  deleteForMe(id: string,userId:string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.deleteMessageForMeMutation,
      variables: {
        id,
        userId
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

  getUserUpdated(id: string): Observable<any> {
    return this.apollo.subscribe({
      query: this.USER_UPDATED_SUBSCRIPTION,
      variables: { id }
    });
  }

  checkBlockUser(userId: string, recevierId: string): Observable<any> {
    return this.apollo.query({
      query: this.CHECK_BLOCK_USER,
      variables: {
        userId,
        recevierId
      },
      fetchPolicy: 'network-only' // Forces a fresh request to the server
    });
  }

  blockUser(userId: string, blockUserId: string):Observable<any> {
    return this.apollo.mutate({
      mutation:this.BLOCK_USER_MUTATION,
      variables: {
        userId,
        blockUserId,
      },
    });
  }

  unblockUser(userId: string, unblockUserId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.UNBLOCK_USER_MUTATION,
      variables: {
        userId,
        unblockUserId
      }
    });
  }
}
