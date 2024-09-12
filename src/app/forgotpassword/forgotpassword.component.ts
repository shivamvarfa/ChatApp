import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupService } from '../signup/signup.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ForgotpasswordService } from './forgotpassword.service';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent implements OnInit {

  forgotForm!: FormGroup;
  otpSent: boolean = false;
  submitButtonHide: boolean = false;
  verifyButtonHide: boolean = true;
  constructor(private router: Router, private signup: SignupService, private fb: FormBuilder, private snackBar: MatSnackBar, private forgotPasswordService: ForgotpasswordService) {
    this.forgotForm = this.fb.group({
      email: [''],
      otp: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });

  }

  ngOnInit(): void {
    this.forgotForm.patchValue({
      email: this.signup.getforgotEmail()
    });
  }


  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }



  onBack() {
    this.router.navigate(['/']);
  }

  get control() {
    return this.forgotForm.controls;
  }


  getotp() {
    const email = this.forgotForm.get('email')?.value;
    if (email) {
      this.forgotPasswordService.getotp(email).subscribe({
        next: (response) => {
          console.log(response);
          alert(response.data.sentOtp);
          this.snackBar.open('OTP sent  successful!', 'OK', {
            duration: 1000,
          })

        },
        error: (error) => {
          console.error('fogot password error', error);
          this.snackBar.open('Enter the registered email!!', 'OK', {
            duration: 2000,
          })
        }
      })
    }
    else {
      this.snackBar.open('Enter Email ID ', 'OK', {
        duration: 2000,
      })
    }
  }


  verifyOtp() {
    const otp = this.forgotForm.get('otp')?.value;
    if (otp) {
      this.forgotPasswordService.verifyOtp(otp).subscribe({
        next: (response) => {
          if (response) {
            this.snackBar.open('OTP verified successful!', 'OK', {
              duration: 1000,
            }).afterDismissed().subscribe(() => {
              this.otpSent = true;
              this.submitButtonHide = true;
              this.verifyButtonHide = false;
            });
          } else {
            this.snackBar.open('Enter correct OTP', 'OK', {
              duration: 1000,
            })
          }
        },
        error: (error) => {
          console.log('otp verified', error);
          this.snackBar.open('Wrong OTP Entered please enter correct OTP', 'OK', {
            duration: 2000,
          })
        }
      })
    }
    else {
      this.snackBar.open('Enter OTP ', 'OK', {
        duration: 2000,
      })
    }
  }

  onSubmit() {
    // const formdata = this.forgotForm.value;
    // console.log(formdata)
    // if (formdata) {
    //   this.forgotPasswordService.updatepassword(formdata).subscribe({
    //     next: (response) => {
    //       console.log(response);
    //       this.snackBar.open('Forgot password successfully!', 'OK', {
    //         duration: 1000,
    //       }).afterDismissed().subscribe(() => {
    //         this.router.navigate(['/login']);
    //       });
    //     },
    //     error: (error) => {
    //       console.log('update password', error)
    //       this.snackBar.open('please enter password and confirmPassword similar', 'OK', {
    //         duration: 2000,
    //       })
    //     }
    //   })
    // } else {
    //   this.snackBar.open('please enter all required fields data', 'OK', {
    //     duration: 2000,
    //   })
    // }
  }
}
