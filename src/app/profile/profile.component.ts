import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from '../message/message.service';
import { BlockScrollStrategy } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from './profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = [];
  fullImage:boolean=false;
  isOpen:boolean=true;
  editMode:boolean=false;
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  changePasswordMode = false;
  imageData: string | ArrayBuffer | null = null;
  imageName: string | null = null;
  isEdit:boolean=false;
constructor(private messageService:MessageService,private router:Router,private fb: FormBuilder,private profileService:ProfileService,private snackBar: MatSnackBar){
  this.profileForm = this.fb.group({
    username: ['', Validators.required],
    email: [ '', [Validators.required, Validators.email]],
    phoneNumber: ['', [
      Validators.required, // Phone number is required
      Validators.pattern(/^\+?[0-9]{1,15}$/) // Pattern for valid phone numbers
    ]]
  });

  this.changePasswordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validator: this.passwordMatchValidator });

  setTimeout(()=>{
    this.profileForm = this.fb.group({
      username: [this.user.username || '', Validators.required],
      email: [ this.user.email||'', [Validators.required, Validators.email]],
      phoneNumber:[this.user.phoneNumber ||'',Validators.required]
    });
  },1000)
}


  ngOnInit(): void {
    this.messageService.getUser(localStorage.getItem('id') || '').subscribe({
      next:(response)=>{
        this.user=response.data.getUser;
        console.log(this.user)
      }
    })
  }

  closeModal() {
    this.router.navigate(['chat-dashboard'])
  }

  editProfile() {
    console.log(this.user)
    this.editMode=true;
  }

  changePassword() {
    this.changePasswordMode = true;
    this.editMode = false;
  }

  cancelImage(){
    this.imageData='';
    this.imageName='';
    this.isEdit=false
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageData = reader.result as string;
      };
      reader.readAsDataURL(file); // Read the file as Base64

      // Set the image name
      this.isEdit=true;
      this.imageName = file.name;
    }
  }
  openfullImage(){
    this.fullImage=true;
    this.isOpen=false;
  }
  back(){
    this.router.navigate(['chat-dashboard/user-profile'])
    this.fullImage=false;
    this.isOpen=true;
  }

  updateUserDto = {
    username: '',
    email:'',
    oldPassword:'',
    password:'',
    phoneNumber:''
  };
 
  submitForm() {
        const formData = this.profileForm.value;
      const updateUserDto={
        username:formData.username,
        email:formData.email,
        profileImage: this.imageData ? (this.imageData as string).split(',')[1] : null,
        phoneNumber:formData.phoneNumber
      }
       this.profileService.updateUser(this.user.id,updateUserDto).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.snackBar.open('Profile updated successfully!', 'OK', {
            duration: 0.8,
          })
          this.imageName=''
          this.isEdit=false;
          this.editMode = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
        },
      });
  }



  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  submitChangePasswordForm() {
    if (this.changePasswordForm.valid) {
      const formData=this.changePasswordForm.value;
      this.updateUserDto.oldPassword=formData.currentPassword;
      this.updateUserDto.password=formData.newPassword;
      this.profileService.updateUser(this.user.id,this.updateUserDto).subscribe({
        next: (response) => {
          console.log('password updated successfully:', response);
          this.snackBar.open('Password updated successfully!', 'OK', {
            duration: 0.8,
          })
          this.changePasswordMode = false; 
          this.changePasswordForm.reset();
        },
        error: (error) => {
          console.error('Error updating password:', error);
          this.snackBar.open('Incorrect current password,try again', 'OK', {
            duration: 1000,
          })
        },
      });
    }else{
      console.log("please enter all the feild");
    }
  }
}
