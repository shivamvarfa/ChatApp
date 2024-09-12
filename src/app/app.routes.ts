import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MessageComponent } from './message/message.component';
import { AuthGuard } from './auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { CreategroupComponent } from './creategroup/creategroup.component';

export const routes: Routes = [
    {path:'',component:LoginComponent},
    {path:'signup-form',component:SignupComponent},
    {path:'chat-dashboard',component:MessageComponent,canActivate: [AuthGuard],
        children: [
            { path: 'user-profile', component: ProfileComponent },
            {path:'create-group',component:CreategroupComponent}
          ]
    },
    {path:'forgot-password',component:ForgotpasswordComponent}
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }


