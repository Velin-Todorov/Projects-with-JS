import { type Session } from "next-auth";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from '@clerk/nextjs';
import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ClerkProvider {...pageProps}>
      <Toaster />
      <Component {...pageProps} />
    </ClerkProvider>

  );
};

export default api.withTRPC(MyApp);
