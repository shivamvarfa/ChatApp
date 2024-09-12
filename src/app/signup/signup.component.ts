import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm!:FormGroup;
  constructor(private fb: FormBuilder,private router:Router,private snackBar: MatSnackBar,private signup:SignupService) {
   this.signupForm = this.fb.group({
     username: ['', Validators.required],
     password: ['', [Validators.required, Validators.minLength(6)]],
     email: ['', [Validators.required, Validators.email]],
   });
 }

 onRegister(): void {
   if (this.signupForm.valid) {
     const formData = this.signupForm.value;
     this.signup.register(formData.username,formData.password,formData.email).subscribe({
       next: (response) => {
         console.log('Registration successful', response);
         this.snackBar.open('Registration successful!', 'OK', {
           duration: 3000, 
         }).afterDismissed().subscribe(() => {
           this.router.navigate(['/']);
         });
         this.signupForm.reset();
       },
       error: (error) => {
         console.error('Registration error', error);
       }
     });
   } else {
    this.snackBar.open('Enter all required field', 'OK', {
      duration: 3000, 
    })
   }
 }


 get control() {
   return this.signupForm.controls;
 }
 onBack(){
   this.router.navigate(['/']);
 }
}
