import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private VERIFY_TOKEN_MUTATION = gql`
  mutation verifyToken($token: String!) {
    verifyToken(token: $token) {
      valid
    }
  }
`;

private LOG_OUT_MUTATION = gql`
  mutation LogOut($id: String!) {
    logOut(id: $id) {
      logOutTimer
      isLogin
    }
  }
`;
  constructor(private apollo: Apollo,private router:Router) { }

  verifyToken(token: string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.VERIFY_TOKEN_MUTATION,
      variables: {
        token
      }
    });
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    this.router.navigate(['/']);
  }

  logOutTimer(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.LOG_OUT_MUTATION,
      variables: {
        id: id,
      },
    });
  }
}
