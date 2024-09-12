import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MessageService } from './message.service';
import { Subscription, map } from 'rxjs';
import { CustomDatePipe } from '../custom-date.pipe';
import { Router, RouterOutlet } from '@angular/router';
import { CreategroupService } from '../creategroup/creategroup.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, CustomDatePipe, RouterOutlet],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit, OnDestroy, AfterViewInit {

  user: any = []; //these is used to retrieve the single login user 
  users: any[] = [];
  filteredUsers: any[] = [];
  avatarUrl: string = 'profile.png';
  selectedUser: any = null;
  messageContent: string = '';
  searchUserName: string = '';
  userId: string = '';
  receiverId: string = '';
  receiverIds: string[] = [];
  unReadCount: any[] = [];
  isLogin: boolean = false;
  imageData: string | ArrayBuffer | null = null;
  imageName: string | null = null;
  fileSelected: boolean = false;
  selectedMessage: any = null;
  isEdit: boolean = false;
  editedId: string = '';
  // currentUserMessages$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private subscription: Subscription = new Subscription();
  dropdownVisible: boolean = false;
  groupedMessages: { [date: string]: any[] } = {};
  fullScreenImageUrl: string | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  receiverImage: string | ArrayBuffer | null = null;
  dropdownVisibleGroup: boolean = false;
  showGroupHeader: boolean = false;
  showUserHeader: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private authService: AuthService, private messageService: MessageService, private router: Router, private createGroupService: CreategroupService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) { }
  ngOnInit() {
    console.log("inside the ngOnInit");
    this.userId = localStorage.getItem('id') || '';
    this.loadUser(this.userId);
    setTimeout(() => {
      this.getUnreadCount(this.userId, this.receiverIds);
      this.onstartSubscritpion();
    }, 1000)
    this.messageService.getUser(this.userId).subscribe({
      next: (response) => {
        this.user = response.data.getUser;
      }
    })

    // subscription for the personal chat 
    this.subscription.add(
      this.messageService.messageCreated().subscribe({
        next: (result) => {
          const newMessage = result.data.messageCreated;
          const newGroupedMessages = this.messageService.groupMessagesByDate([newMessage]);
          this.scrollToBottom();
          // || this.userId===newMessage.sender.id
          if (this.receiverId === newMessage.receiver.id || this.receiverId === newMessage.sender.id) {
            // these is call markAsRead API when other user already open chat
            this.messageService.markAsRead(this.userId, this.receiverId).subscribe({
              next: (updatedMessages) => {
                // this.currentUserMessages$.next(updatedMessages.data.markAsRead)
              },
              error: (error) => {
                console.error('Error marking messages as read:', error);
              }
            });
            for (const [date, messages] of Object.entries(newGroupedMessages)) {
              if (this.groupedMessages[date]) {
                // If the date key already exists, concatenate the new messages
                this.groupedMessages[date] = [...this.groupedMessages[date], ...messages];
              } else {
                // If the date key does not exist, add the new date and messages
                this.groupedMessages[date] = messages;
              }
            }
          }
          this.convertTimestampsToDates();
          this.sortUsersByLastMessage();
        },
        error: (error) => console.error('Subscription error', error),
      })
    );


    //  subscription for the read/unread message
    this.subscription.add(
      this.messageService.messagesMarkedAsRead().subscribe({
        next: (response) => {
          this.handleMessagesMarkedAsRead(response.data.messagesMarkedAsRead);
        },
        error: (error) => {
          console.log('subscription error in markAsRead', error);
        }
      })
    )

    // subscription for deleted message
    this.subscription.add(
      this.messageService.onMessageDeleted().subscribe({
        next: (response) => {
          const deletedMessageId = response.data.messageDeleted.id;
          this.handleMessageDeletion(deletedMessageId);
        },
        error: (error) => {
          console.log('subscription error while deleted message', error);
        }
      })
    )

    // load the group in which the user is involved
    if (this.userId) {
      this.createGroupService.getGroupByUserId(this.userId).subscribe({
        next: (result) => {
          this.groups = result.data.getGroupByUserId;
          console.log('Group details:', this.groups);
        },
        error: (error) => {
          console.error('Error fetching group details', error);
        }
      });
    }

    // subscription for the group chat 
    this.subscription.add(
      this.createGroupService.getGroupMessageCreated().subscribe({
        next: (result) => {
          const newMessage = result.data.groupMessageCreated;
          const newGroupedMessages = this.messageService.groupMessagesByDate([newMessage.message]);
          this.scrollToBottom();
          if (this.groupId == newMessage.group.id) {
            for (const [date, messages] of Object.entries(newGroupedMessages)) {
              if (this.groupedMessages[date]) {
                // If the date key already exists, concatenate the new messages
                this.groupedMessages[date] = [...this.groupedMessages[date], ...messages];
              } else {
                // If the date key does not exist, add the new date and messages
                this.groupedMessages[date] = messages;
              }
            }
          }
        },
        error: (error) => console.error('Subscription error', error),
      })
    );

  }


  handleMessageDeletion(deletedMessageId: string): void {
    for (const date in this.groupedMessages) {
      if (this.groupedMessages.hasOwnProperty(date)) {
        this.groupedMessages[date] = this.groupedMessages[date].filter(message => message.id !== deletedMessageId);
      }
    }
  }
  private handleMessagesMarkedAsRead(messagesMarkedAsRead: { id: string, read: boolean }[]): void {
    // Create a map for quick lookup
    const readStatusMap = new Map<string, boolean>();
    messagesMarkedAsRead.forEach(({ id, read }) => {
      readStatusMap.set(id, read);
    });

    // Iterate through groupedMessages and update the read status
    Object.keys(this.groupedMessages).forEach(date => {
      this.groupedMessages[date] = this.groupedMessages[date].map((msg: any) => {
        // Check if there's a new read status for this message
        if (readStatusMap.has(msg.id)) {
          return { ...msg, read: readStatusMap.get(msg.id) };
        }
        return msg;
      });
    });
  }
  convertTimestampsToDates() {
    this.users = this.users.map(user => ({
      ...user,
      lastMessageTimestamp: new Date(user.lastMessageTimestamp),
    }));
  }

  sortUsersByLastMessage() {
    this.filteredUsers = [];
    this.filteredUsers = [...this.users]
      .filter(user => user.lastMessageTimestamp instanceof Date && !isNaN(user.lastMessageTimestamp.getTime()))
      .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
    this.getUnreadCount(this.userId, this.receiverIds)
  }
  ngAfterViewInit() {
    this.scrollToBottom();
    this.initFancybox();
  }

  ngOnDestroy() {
    this.authService.logOutTimer(this.userId).subscribe({
      next: (result) => {
        console.log('Log out successful', result.data);
      },
      error: (error) => {
        console.error('Error logging out', error);
      },
    });
    this.subscription.unsubscribe();
  }
  scrollToBottom(): void {
    try {
      this.cdr.detectChanges();
      setTimeout(() => {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 300); // A small delay to ensure DOM updates
    } catch (error) {
      console.log('scroll error:', error);
    }
  }
  openFullScreenImage(imageUrl: string, event: Event): void {
    event.stopPropagation();
    this.fullScreenImageUrl = imageUrl;
  }

  closeFullScreenImage(): void {
    this.fullScreenImageUrl = null;
  }

  getUnreadCount(senderId: string, receiverIds: string[]) {
    this.messageService.getUnreadcount(senderId, receiverIds).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  onstartSubscritpion() {
    this.subscription.add(
      this.messageService.getUnreadCounts(this.userId, this.receiverIds).subscribe({
        next: (response) => {
          if (response) {
            this.unReadCount = response.data.unreadCounts;
            this.filteredUsers = this.filteredUsers.map(user => {
              const unread = this.unReadCount.find(count => count.receiverId === user.id);
              return {
                ...user,
                unreadCount: unread ? unread.unreadCount : 0 // Add unread count to user object
              };
            });
          } else {
            console.warn('No unread counts found in response');
          }
        },
        error: (error) => {
          console.error('Subscription error while fetching unread count:', error);
        }
      })
    );
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
  loadUser(id: string): void {
    this.messageService.getAllUser(id).subscribe({
      next: (response) => {
        this.users = response?.data?.getAllUser;
        this.filteredUsers = this.users;
        this.convertTimestampsToDates();
        this.sortUsersByLastMessage();
        this.receiverIds = this.users.map(user => user.id);
      },
      error: (error) => {
        console.error('Error loading user', error);
      },
    });

  }

  selectUser(user: any) {
    this.scrollToBottom();
    this.showUserHeader = true;
    this.showGroupHeader = false;
    this.selectedUser = user;
    this.receiverImage = this.selectedUser.profileImage;
    this.isLogin = this.selectedUser.isLogin;
    this.receiverId = this.selectedUser.id;
    this.getUnreadCount(this.userId, this.receiverIds)
    this.messageService.getMessagesBetween(this.userId, this.receiverId).pipe(
      map(response => response.data.getMessagesBetween)
    ).subscribe(messages => {
      this.groupedMessages = this.messageService.groupMessagesByDate(messages);
    });
    this.markMessagesAsRead(this.userId, this.receiverId)
  }


  getDates(): string[] {
    return Object.keys(this.groupedMessages).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }


  markMessagesAsRead(senderId: string, receiverId: string): void {

    this.messageService.markAsRead(senderId, receiverId).subscribe({
      next: (updatedMessages) => {
      },
      error: (error) => {
        console.error('Error marking messages as read:', error);
      }
    });
  }



  capitalizeFirstLetter(username: string): string {
    if (!username) return username;
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  onKeyDown(event: KeyboardEvent): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (event.key === 'Enter') {
      if (event.shiftKey) {

        event.preventDefault();
        const cursorPos = textarea.selectionStart || 0;
        this.messageContent =
          this.messageContent.slice(0, cursorPos) + '\n' +
          this.messageContent.slice(cursorPos);

        // Move cursor to the position after the newline
        setTimeout(() => {
          textarea.selectionStart = cursorPos + 1;
          textarea.selectionEnd = cursorPos + 1;
        }, 0);
      } else {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileSelected = true;
      this.imageName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageData = reader.result as string;
        this.imageSrc = e.target.result;
        setTimeout(() => {
          this.initFancybox();
        }, 0);
      };
      reader.readAsDataURL(file);
    }
  }
  initFancybox() {
    (window as any).Fancybox.bind('[data-fancybox="image"]');
  }
  cancelFile() {
    this.fileSelected = false;
    this.imageName = null;
    this.imageSrc = null;
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }


  sendMessage(): void {
    if (this.isEdit) {
      return;
    }
    if (this.messageContent.trim() === '' && !this.imageData) {
      console.warn('Message content is empty and no image selected, not sending.');
      return;
    }
    this.imageSrc = null;
    this.fileSelected = false;
    const createMessageDto = {
      content: this.messageContent,
      sender: this.userId,
      receiver: this.selectedUser.id,
      imageData: this.imageData ? (this.imageData as string).split(',')[1] : null // Remove 'data:image/*;base64,' prefix
    };

    this.messageService.createMessage(createMessageDto).subscribe({
      next: (response) => {
        console.log('Message sent:', response.data.createMessage);
        this.messageContent = ''; // Clear input after sending
        this.imageData = null; // Clear selected image
        this.imageName = null; // Clear image name
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }


  // code for the edit and delete message
  toggleDropdown(id: string, message: string) {
    this.editedId = id;
    this.dropdownVisible = true;
    this.selectedMessage = message;
  }

  removeDropDown() {
    this.dropdownVisible = false;
  }
  editMessage(): void {
    if (this.selectedMessage) {
      console.log('aefrasd', this.selectedMessage)
      this.messageContent = this.selectedMessage;
      this.isEdit = true;
      this.editedId = this.editedId;
    }
    this.removeDropDown();
  }
  updateMessageDto = {
    content: 'Updated content',
  };
  messageEdited() {
    console.log("edited", this.editedId)
    if (this.messageContent.trim() && this.editedId) {
      this.updateMessageDto.content = this.messageContent
      this.messageService.editMessage(this.editedId, this.updateMessageDto).subscribe({
        next: (response) => {
          const editedMessage = response.data.editMessage;
          console.log('Message updated successfully:', response.data.editMessage);
          this.groupedMessages = Object.keys(this.groupedMessages).reduce((acc, date) => {
            acc[date] = this.groupedMessages[date].map(message => {
              if (message.id === editedMessage.id) {
                return {
                  ...message,
                  content: editedMessage.content // Update the content
                };
              }
              return message;
            });
            return acc;
          }, {} as { [date: string]: any[] });
          this.editedId = '';
          this.messageContent = '';
          this.isEdit = false;
        },
        error: (error) => {
          console.error('Error updating message:', error);
        },
      });
    } else {
      console.log("enter message and correct id")
    }
  }


  deleteMessage(): void {
    if (this.editedId) {
      this.messageService.deleteMessage(this.editedId).subscribe({
        next: (response) => {
          console.log("deleted message successfully");
          this.snackBar.open('Message Deleted Successfully', 'OK', {
            duration: 500,
          })
          this.removeDropDown();
        },
        error: (error) => {
          console.log("error while deleting message", error);
        }
      });
    } else {
      console.warn("selected the deleted id");
    }
  }


  logout() {
    this.authService.logout();
  }
  openProfile() {
    this.router.navigate(['chat-dashboard/user-profile']);
  }


  // code for create Group

  // for groups
  groups: any[] = [];
  groupUrl: string = 'group.png';
  selectedGroup: any;
  groupId: string = '';
  members: any[] = [];
  showGroupUser: boolean = false;
  showAddMember: boolean = true;
  addUsers: any[] = [];
  selectedUsers: string[] = [];
  opengroup() {
    this.dropdownVisibleGroup = true;
  }
  removeDropDownGroup() {
    this.dropdownVisibleGroup = false;
  }
  createGroup() {
    this.createGroupService.addMember(false, [],'');
    this.router.navigate(['chat-dashboard/create-group']);
    this.dropdownVisibleGroup = false;
  }

  selectGroup(group: any) {
    this.scrollToBottom();
    this.showUserHeader = false;
    this.showGroupHeader = true;
    this.selectedGroup = group;
    this.groupId = this.selectedGroup.id;
    // get the messages of the group 
    this.createGroupService.getGroupMessages(this.groupId).pipe(
      map(response => response.data.getGroupMessages)
    ).subscribe(messages => {
      this.groupedMessages = this.messageService.groupMessagesByDate(messages);

      // this.currentUserMessages$.next(messages); // Update the BehaviorSubject
    });
  }

  sendGroupMessage() {
    if (this.messageContent.trim() === '' || !this.groupId) {
      console.log('Message content or group ID is missing.');
      return;
    }

    const createGroupMessageDto = {
      content: this.messageContent,
      senderId: this.userId,
      groupId: this.groupId
    };

    this.createGroupService.createGroupMessage(createGroupMessageDto).subscribe({
      next: (response) => {
        console.log('Message created:', response.data.createGroupMessage);
        this.messageContent = ''; // Clear the input field
      },
      error: (error) => {
        console.error('Error creating message:', error);
      }
    });
  }

  getGroupMember() {
    if (this.groupId) {
      this.showGroupUser = true;
      this.createGroupService.getMembersByGroupId(this.groupId).subscribe({
        next: (response) => {
          this.members = response.data.getMembersByGroupId;
          console.log(this.members)
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  }
  closeGroupUserList() {
    this.showGroupUser = false;
  }

  // edit and update group message
  updateGroupMessageDto = {
    content: 'Updated content',
  };
  messageGroupEdited() {
    console.log("edited", this.editedId)
    if (this.messageContent.trim() && this.editedId) {
      this.updateGroupMessageDto.content = this.messageContent
      this.createGroupService.editGroupMessage(this.editedId, this.updateGroupMessageDto).subscribe({
        next: (response) => {
          console.log('Message updated successfully:', response.data.editGroupMessage);
          const editedMessage = response.data.editGroupMessage;
          this.groupedMessages = Object.keys(this.groupedMessages).reduce((acc, date) => {
            acc[date] = this.groupedMessages[date].map(message => {
              if (message.id === editedMessage.id) {
                return {
                  ...message,
                  content: editedMessage.content // Update the content
                };
              }
              return message;
            });
            return acc;
          }, {} as { [date: string]: any[] });
          this.editedId = '';
          this.messageContent = '';
          this.isEdit = false;
        },
        error: (error) => {
          console.error('Error updating message:', error);
        },
      });
    } else {
      console.log("enter message and correct id")
    }
  }

  deleteGroupMessage(): void {
    if (this.editedId) {
      this.createGroupService.deleteGroupMessage(this.editedId).subscribe({
        next: (response) => {
          this.snackBar.open('Message Deleted Successfully', 'OK', {
            duration: 500,
          })
          this.handleMessageDeletion(this.editedId);
          this.removeDropDown();
        },
        error: (error) => {
          console.log("error while deleting message", error);
        }
      });
    } else {
      console.warn("selected the deleted id");
    }
  }


  filterOutExistingMembers(filteredUsers: any[], members: any[]): any[] {
    const memberIds = new Set(members.map(member => member.user.id));
    return filteredUsers.filter(user => {
      return !memberIds.has(user.id);
    });
  }


  addMember() {
    this.addUsers = this.filterOutExistingMembers(this.filteredUsers, this.members)
    this.createGroupService.addMember(this.showAddMember, this.addUsers,this.groupId);
    this.router.navigate(['/chat-dashboard/create-group']);
  }

  onUserSelectionChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const userId = input.value;

    if (input.checked) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    }
    console.log(this.selectedUsers)
  }

  removeMember(){
    if(this.groupId){
      const updateGroupDto={
        removeMembers:this.selectedUsers,
        adminId:''
      }
      this.createGroupService.updateGroup(this.groupId,updateGroupDto).subscribe({
        next:(response)=>{
          console.log(response.data.updateGroup)
          this.snackBar.open('Member Removed successfully!', 'OK', {
            duration: 500,
          })
          this.showGroupUser=false;
        },
        error:(error)=>{
          console.log("error while updating the group",error);
        }
      })
    }else{
       console.log("group id not found");
    }
  }
  
}

