import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../libs/apolloClient";
import "fontsource-roboto";

export default function App({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <div style={{ margin: "20px" }}>
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}
