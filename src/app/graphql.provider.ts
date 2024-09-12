// import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
// import { HttpLink } from 'apollo-angular/http';
// import { ApplicationConfig, inject } from '@angular/core';
// import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';

// const uri = 'http://172.20.1.91:3000/graphql'; 
// const wsUri = 'ws://172.20.1.91:3000/graphql';


// export function apolloOptionsFactory(): ApolloClientOptions<any> {
//   const httpLink = inject(HttpLink);
//   return {
//     link: httpLink.create({ uri }),
//     cache: new InMemoryCache(),
//   };
// }

// export const graphqlProvider: ApplicationConfig['providers'] = [
//   Apollo,
//   {
//     provide: APOLLO_OPTIONS,
//     useFactory: apolloOptionsFactory,
//   },
// ];





import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApplicationConfig, inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const uri = 'http://172.20.1.91:3000/graphql'; 
const wsUri = 'ws://172.20.1.91:3000/graphql';


export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const httpLink = inject(HttpLink);
  const httpLinkInstance = httpLink.create({ uri });

  const wsLink = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
    },
  });
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLinkInstance
  );

  // Return Apollo Client options
  return {
    link: splitLink,
    cache: new InMemoryCache(),
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: apolloOptionsFactory,
  },
];

