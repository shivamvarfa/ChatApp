import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreategroupService {
  addMemberShow: boolean = false;
  addMemberUser: any[] = [];
  groupId: string = '';
  private CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($createGroupDto: CreateGroupDto!) {
    createGroup(createGroupDto: $createGroupDto) {
      id
      name
      adminId {
        id
        username
      }
      members {
        id
        username
      }
    }
  }
`;


  // for group 
  private GET_GROUP_BY_USER_ID_QUERY = gql`
  query GetGroupByUserId($userId: String!) {
    getGroupByUserId(userId: $userId) {
      id
      name
      adminId {
        id
        username
      }
      members {
        id
        username
      }
    }
  }
`;

  private CREATE_GROUP_MESSAGE_MUTATION = gql`
  mutation CreateGroupMessage($createGroupMessageDto: CreateGroupMessageDto!) {
    createGroupMessage(createGroupMessageDto: $createGroupMessageDto) {
      id
      content
      sender {
        id
        username
      }
      group {
        id
        name
        members {
          id
          username
        }
      }
      createdAt
      imageData
    }
  }
`;
  private GET_GROUP_MESSAGES_QUERY = gql`
  query GetGroupMessages($groupId: String!) {
    getGroupMessages(groupId: $groupId) {
      id
      content
      sender {
        id
        username
      }
      group {
        id
        name
      }
      createdAt
      imageData
      deletedUser
      deleteUserForEveryone
    }
  }
`;

  private GROUP_MESSAGE_CREATED = gql`
  subscription {
    groupMessageCreated {
      message {
        id
        content
        createdAt
        imageData
        sender {
          id
          username
        }
      }
      group {
        id
        name
      }
    }
  }
`;
  private GET_MEMBERS_BY_GROUP_ID = gql`
  query GetMembersByGroupId($groupId: String!) {
    getMembersByGroupId(groupId: $groupId) {
       user{
       id
       username
       profileImage
       }
       admin
    }
  }
`;

  private editGroupMessageMutation = gql`
mutation EditGroupMessage($id: String!, $updateGroupMessageDto: UpdateGroupMessageDto!) {
  editGroupMessage(id: $id, updateGroupMessageDto: $updateGroupMessageDto) {
    id
    content
  }
}
`;

  private DELETE_GROUP_MESSAGE_MUTATION = gql`
  mutation DeleteGroupMessage($id: String!, $userId: String!) {
    deleteGroupMessage(id: $id, userId: $userId) {
      id
      content
      createdAt
    }
  }
`;

private deleteGroupMessageMe = gql`
mutation DeleteGroupMessageForMe($id: String!, $userId: String!) {
  deleteGroupMessageForMe(id: $id, userId: $userId)
}
`;


  private UPDATE_GROUP = gql`
  mutation UpdateGroup($id: String!, $updateGroupDto: UpdateGroupDto!) {
    updateGroup(id: $id, updateGroupDto: $updateGroupDto) {
      id
      name
      adminId {
        id
        username
      }
      members {
        id
        username
      }
    }
  }
`;

  constructor(private apollo: Apollo) { }

  createGroup(createGroupDto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: this.CREATE_GROUP_MUTATION,
      variables: {
        createGroupDto
      }
    });
  }

  getGroupByUserId(userId: string): Observable<any> {
    return this.apollo.query({
      query: this.GET_GROUP_BY_USER_ID_QUERY,
      variables: {
        userId
      }
    });
  }

  createGroupMessage(createGroupMessageDto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: this.CREATE_GROUP_MESSAGE_MUTATION,
      variables: {
        createGroupMessageDto
      },
    });
  }

  getGroupMessages(groupId: string): Observable<any> {
    return this.apollo.watchQuery({
      query: this.GET_GROUP_MESSAGES_QUERY,
      variables: {
        groupId
      },
      fetchPolicy: 'network-only' // Ensure fresh data is fetched from the server
    }).valueChanges;
  }

  getGroupMessageCreated(): Observable<any> {
    return this.apollo.subscribe({
      query: this.GROUP_MESSAGE_CREATED,
    })
  }

  getMembersByGroupId(groupId: string): Observable<any> {
    return this.apollo.query({
      query: this.GET_MEMBERS_BY_GROUP_ID,
      variables: {
        groupId
      },
      fetchPolicy: 'network-only'  // Ensure data is always fetched from the network
    });
  }

  editGroupMessage(id: string, updateGroupMessageDto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: this.editGroupMessageMutation,
      variables: {
        id,
        updateGroupMessageDto,
      },
    });
  }

  deleteGroupMessage(id: string,userId:string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.DELETE_GROUP_MESSAGE_MUTATION,
      variables: {
        id,
        userId
      },
    });
  }


  addMember(addMemberShow: boolean, addMember: any[], groupId: string) {
    this.addMemberShow = addMemberShow;
    this.addMemberUser = addMember;
    this.groupId = groupId;
  }
  getAddMember() {
    return this.addMemberShow;
  }
  getaddMemberUser() {
    return this.addMemberUser;
  }
  getGroupId() {
    return this.groupId;
  }

  updateGroup(id: string, updateGroupDto: any): Observable<any> {
    return this.apollo.mutate({
      mutation: this.UPDATE_GROUP,
      variables: {
        id,
        updateGroupDto,
      }, fetchPolicy: 'network-only' // Ensure fresh data is fetched from the server
    });
  }

  deleteGroupMessageForMe(id: string,userId:string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.deleteGroupMessageMe,
      variables: {
        id,
        userId
      },
    });
  }
}
