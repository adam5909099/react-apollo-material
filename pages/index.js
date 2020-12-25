import Head from "next/head";
import AssetTree from "../components/AssetTree";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AssetTree />
    </div>
  );
}
