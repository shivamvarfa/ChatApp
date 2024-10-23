import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  email:string='';
  constructor(private apollo: Apollo) { }

  register(username: string, password: string, email: string,phoneNumber:string): Observable<any> {
    const CREATE_USER_MUTATION = gql`
      mutation CreateUser($createUserDto: CreateUserDto!) {
        createUser(createUserDto: $createUserDto) {
          id
          username
          email
          phoneNumber
        }
      }
    `;

    return this.apollo.mutate({
      mutation: CREATE_USER_MUTATION,
      variables: {
        createUserDto: {
          username,
          password,
          email,
          phoneNumber
        },
      },
    });
  }
  forgotEmail(email:string){
    this.email=email;
  }

  getforgotEmail():string{
    return this.email;
  }
}

