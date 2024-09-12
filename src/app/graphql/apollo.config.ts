// import { ApolloClient, InMemoryCache } from '@apollo/client/core';
// import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';

// export function createApollo() {
//   return new ApolloClient({
//     uri: 'http://172.20.1.91:3000/graphql', 
//     cache: new InMemoryCache(),
//   });
// }

// export const APOLLO_PROVIDERS = [
//   {
//     provide: APOLLO_OPTIONS,
//     useFactory: createApollo,
//   },
// ];

// import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core';
// import { WebSocketLink } from '@apollo/client/link/ws';
// import { ApolloLink } from '@apollo/client/core';
// import { getMainDefinition } from '@apollo/client/utilities';

// const httpLink = new HttpLink({
//   uri: 'http://localhost:3000/graphql', 
// });


// const wsLink = new WebSocketLink({
//   uri: 'ws://localhost:3000/graphql', 
//   options: {
//     reconnect: true,
//   },
// });

// const link = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   httpLink,
// );

// export const apolloClient = new ApolloClient({
//   link: ApolloLink.from([link]),
//   cache: new InMemoryCache(),
// });




