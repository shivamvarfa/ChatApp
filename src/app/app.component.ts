import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APOLLO_OPTIONS, Apollo, ApolloModule } from 'apollo-angular';
import { CustomDatePipe } from './custom-date.pipe';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ApolloModule,CustomDatePipe],
  // providers: [
  //   {
  //     provide: APOLLO_OPTIONS,
  //     useFactory: (httpLink: HttpLink) => {
  //       return {
  //         cache: new InMemoryCache(),
  //         link: apolloClient.link,
  //       };
  //     },
  //     deps: [HttpLink],
  //   },
  // ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chatapp';
}
