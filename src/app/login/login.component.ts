import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { SignupService } from '../signup/signup.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private snackBar: MatSnackBar, private loginService: LoginService,private signup:SignupService) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     const formData = this.loginForm.value;
  //     this.signup.login(formData).subscribe({
  //       next:(response)=>{
  //         console.log('login successful', response);
  //         this.snackBar.open('Login successful!', 'OK', {
  //           duration: 0.5, 
  //         }).afterDismissed().subscribe(() => {
  //           this.router.navigate(['/dashboard']);
  //         });
  //       },
  //       error: (error) => {
  //         console.log('error while login',error);
  //         this.snackBar.open('Invalid Credentials please try again', 'OK', {
  //           duration: 3000, 
  //         }).afterDismissed().subscribe(() => {

  //         });
  //       }
  //     });
  //   }else {
  //     this.snackBar.open('Please enter username and password.', 'OK', {
  //       duration: 3000,
  //     });
  //   }
  // }
  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.loginService.login(formData.email, formData.password).subscribe({
        next: (response) => {
          console.log('Login successful', response);
           localStorage.setItem('token', response.data.login.access_token);
           localStorage.setItem('id',response.data.login.id);
          this.snackBar.open('Login successful!', 'OK', {
            duration: 1000,
          }).afterDismissed().subscribe(() => {
            this.router.navigate(['/chat-dashboard']);
          });
        },
        error: (error) => {
          console.error('Login failed', error);
          this.snackBar.open('Invalid Credentials please try again', 'OK', {
            duration: 3000,
          })
        },
      });
    } else {
      this.snackBar.open('Enter all required field please try again', 'OK', {
        duration: 3000,
      })
    }
  }

  onSignup() {
    console.log('Redirect to Signup');
    this.router.navigate(['/signup-form']);
  }

  forgotpassword(){
    const email=this.loginForm.get('email')?.value;
    if(email){
      this.signup.forgotEmail(email);
      this.router.navigate(['/forgot-password']);
    }else{
      this.snackBar.open('Enter Emial ID for forgot password', 'OK', {
        duration: 1000, 
  })
    }
  }
  get control() {
    return this.loginForm.controls;
  }
}
