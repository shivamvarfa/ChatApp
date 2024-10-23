import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '../message/message.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreategroupService } from './creategroup.service';

@Component({
  selector: 'app-creategroup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './creategroup.component.html',
  styleUrl: './creategroup.component.css'
})
export class CreategroupComponent implements OnInit {

  users: any[] = [];
  userId: string = '';
  selectedUsers: string[] = [];
  avatarUrl: string = 'profile.png';
  groupName: string = '';
  searchUserName: string = ''
  filteredUsers: any[] = [];
  addMember:boolean=false;
  addMemberUser:any[]=[];
  groupId:string='';
  bool:boolean=false;
  constructor(private router: Router, private messageService: MessageService, private snackBar: MatSnackBar, private createGroupService: CreategroupService) { }



  ngOnInit() {
    this.userId = localStorage.getItem('id') || '';
    this.loadUser(this.userId);
    this.addMember=this.createGroupService.getAddMember();
    this.addMemberUser=this.createGroupService.getaddMemberUser();
    this.groupId=this.createGroupService.getGroupId();
    console.log(this.addMemberUser)
  }



  loadUser(id: string): void {
    this.messageService.getAllUser(id).subscribe({
      next: (response) => {
        this.users = response?.data?.getAllUser;
        this.filteredUsers = this.users;
      },
      error: (error) => {
        console.error('Error loading user', error);
      },
    });
  }
  onSearchChange(): void {
    if (this.searchUserName.trim() === '') {
      this.filteredUsers = this.users; // Show all users if search term is empty
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(this.searchUserName.toLowerCase())
      );
    }
  }


  onSearchChangeAddMember(): void {
    if (this.searchUserName.trim() === '') {
      this.addMemberUser = this.addMemberUser; // Show all users if search term is empty
    } else {
      this.addMemberUser = this.addMemberUser.filter(user =>
        user.username.toLowerCase().includes(this.searchUserName.toLowerCase())
      );
    }
  }


// for select the user inside the group
  onUserSelectionChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const userId = input.value;

    if (input.checked) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    }
  }

  // Emits the selected users to the parent component to handle group creation
   createGroup() {
    if (this.groupName != '' && this.userId && this.selectedUsers.length != 0) {
      this.selectedUsers.push(this.userId);
      const createGroupDto = {
        name: this.groupName,
        adminId: this.userId,
        members: this.selectedUsers
      }
      this.createGroupService.createGroup(createGroupDto).subscribe({
        next:(response)=>{
           console.log(response);
           this.snackBar.open('Group Created successfully!', 'OK', {
            duration: 500,
          })
           this.router.navigate(['chat-dashboard'])
        },
        error:(error)=>{
          console.log(error);
        }
      })
    } else {
      this.snackBar.open('Enter Group Name! & select member', 'OK', {
        duration: 1000,
      })
    }
  }
 
  updateGroupMember(){
      if(this.groupId){
        console.log(this.selectedUsers)
        const updateGroupDto={
          name:this.groupName,
          addMembers:this.selectedUsers,
          removeMembers:[],
          adminId:''
        }
        this.createGroupService.updateGroup(this.groupId,updateGroupDto).subscribe({
          next:(response)=>{
            console.log(response)
            this.createGroupService.getMembersByGroupId(this.groupId);
            this.router.navigate(['chat-dashboard'])
            this.snackBar.open('Member added successfully!', 'OK', {
              duration: 500,
            })
            this.addMember=false;
            this.bool=true;
          },
          error:(error)=>{
            console.log("error while updating the group",error);
          }
        })
      }else{
         console.log("group id not found");
      }
  }

  closeCreateGroupModal() {
    this.addMember=false;
    this.router.navigate(['chat-dashboard'])
  }
}
