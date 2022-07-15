import { PreferencesPage } from "components/preferences";
import { UserAdmin } from "declarations";
import localeSubset from "locales/preferences.json";
import { InferGetServerSidePropsType } from "next";
import { getAuthUser } from "services/authenticator";
import { UnauthorizedError } from "services/error";
import { dbAdmin } from "services/firebaseAdmin";
import { getLocaleStrings } from "services/locale";
import { withContextErrorHandler } from "services/middleware";

export type PreferencesPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page = (props: PreferencesPageProps) => <PreferencesPage {...props} />;

export const getServerSideProps = withContextErrorHandler(async (context) => {
  const strings = getLocaleStrings(localeSubset, context.locale);
  if (context.req.cookies.authToken) {
    const decodedToken = await getAuthUser(context);
    if (decodedToken !== null) {
      const userDoc = dbAdmin.collection("users").doc(decodedToken.uid);
      const { checks, ...userData } = (await userDoc.get()).data() as UserAdmin;

      return { props: { strings, userData } };
    }
  }
  throw new UnauthorizedError();
});

export default Page;
