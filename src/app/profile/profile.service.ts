import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private updateUserMutation = gql`
  mutation UpdateUser($id: String!, $updateUserDto: UpdateUserDto!) {
    updateUser(id: $id, updateUserDto: $updateUserDto) {
      id
      username
      email
      profileImage
    }
  }
`;


constructor(private apollo: Apollo) {}

  updateUser(id: string, updateUserDto:any): Observable<any> {
    return this.apollo.mutate({
      mutation: this.updateUserMutation,
      variables: {
        id,
        updateUserDto
      }
    })
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
          }
        }
      `,
      variables: {
        id,
      },
    });
  }
    
}
