import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForgotpasswordService {


  private SENT_OTP_QUERY = gql`
  query SentOtp($email: String!) {
    sentOtp(email: $email)
  }
`;

private  VERIFY_OTP_QUERY = gql`
query VerifyOtp($otp: String!) {
  verifyOtp(otp: $otp)
}
`;


  constructor(private apollo: Apollo) { }

  getotp(email: string): Observable<any> {
    return this.apollo.query({
      query: this.SENT_OTP_QUERY,
      variables: {
        email: email
      }
    });
  }

  verifyOtp(otp: string): Observable<any> {
    return this.apollo.query({
      query: this.VERIFY_OTP_QUERY,
      variables: {
        otp: otp
      }
    });
  }

}
