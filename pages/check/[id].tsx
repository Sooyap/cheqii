import { styled } from "@material-ui/core/styles";
import { ArrowBack } from "@material-ui/icons";
import { Account } from "components/Account";
import { ActionButton } from "components/check/ActionButton";
import { CheckDisplay, CheckDisplayProps } from "components/check/CheckDisplay";
import { LinkIconButton } from "components/Link";
import { ValidateForm, ValidateTextField } from "components/ValidateForm";
import { Check, StyledProps } from "declarations";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { InferGetServerSidePropsType } from "next";
import { ChangeEventHandler, FocusEventHandler, useCallback, useEffect, useState } from "react";
import { verifyAuthToken } from "services/authenticator";
import { UnauthorizedError } from "services/error";
import { db } from "services/firebase";
import { dbAdmin } from "services/firebaseAdmin";
import { withContextErrorHandler } from "services/middleware";
import { useAuth } from "utilities/AuthContextProvider";
import { useLoading } from "utilities/LoadingContextProvider";
import { useSnackbar } from "utilities/SnackbarContextProvider";

const Page = styled(
  (props: InferGetServerSidePropsType<typeof getServerSideProps> & StyledProps) => {
    const userInfo = useAuth();
    const { loading, setLoading } = useLoading();
    const { setSnackbar } = useSnackbar();
    const [contributors, setContributors] = useState(props.check.contributors);
    const [items, setItems] = useState(props.check.items);
    const [name, setName] = useState(props.check.name);
    let unsubscribe: undefined | (() => void);

    const handleActionButtonClick = useCallback(async () => {
      const newItems = items.concat({
        cost: 0,
        name: "",
        buyer: 0,
        split: props.check.contributors.map(() => 1),
      });
      setItems(newItems);
    }, []);

    const handleContributorBlur: CheckDisplayProps["onContributorBlur"] = async (e, index) => {
      if (e.target.checkValidity() && contributors[index] !== e.target.value) {
        const newContributors = contributors.slice();
        newContributors[index] = e.target.value;
        setContributors(newContributors);
        const checkDoc = doc(db, "checks", props.check.id);
        await updateDoc(checkDoc, {
          contributors: newContributors,
        });
      }
    };

    const handleNameBlur: FocusEventHandler<HTMLInputElement> = async (e) => {
      if (e.target.checkValidity() && name !== props.check.name) {
        const checkDoc = doc(db, "checks", props.check.id);
        await updateDoc(checkDoc, {
          name,
        });
      }
    };

    const handleNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setName(e.target.value);
    };

    const handleSubmit = () => {};

    useEffect(() => {
      unsubscribe = onSnapshot(doc(db, "checks", props.check.id), (snapshot) => {
        if (!snapshot.metadata.hasPendingWrites) {
          const checkData = snapshot.data() as Check;
          if (checkData.name !== name) {
            setName(checkData.name);
          }
        }
      });

      return () => {
        unsubscribe!();
      };
    }, []);

    return (
      <ValidateForm className={props.className} onSubmit={handleSubmit}>
        <header className="Header-root">
          <LinkIconButton className="Header-back" NextLinkProps={{ href: "/" }}>
            <ArrowBack />
          </LinkIconButton>
          <ValidateTextField
            className="Header-title"
            label="Name"
            onBlur={handleNameBlur}
            onChange={handleNameChange}
            size="small"
            value={name}
          />
          <Account onSignOut={unsubscribe} />
        </header>
        <main className="Body-root">
          <CheckDisplay
            contributors={contributors}
            items={items}
            onContributorBlur={handleContributorBlur}
          />
        </main>
        <ActionButton checkId={props.check.id} onClick={handleActionButtonClick} />
      </ValidateForm>
    );
  }
)`
  ${({ theme }) => `
    & .Body-root{
      overflow: auto;
    }

    & .Header-root {
      display: flex;
      margin: ${theme.spacing(2)};

      & .Header-title {
        margin-left: ${theme.spacing(2)};

        & .MuiInputLabel-root {
          margin-left: ${theme.spacing(1)};
        }

        & .MuiOutlinedInput-input {
          margin: ${theme.spacing(0, 1)};
        }

        & .MuiOutlinedInput-notchedOutline legend {
          margin-left: ${theme.spacing(1)};
        }
      }
    }
  `}
`;

export const getServerSideProps = withContextErrorHandler(async (context) => {
  if (context.req.cookies.authToken) {
    const decodedToken = await verifyAuthToken(context);
    if (decodedToken !== null) {
      const checkData: Check = (
        await dbAdmin
          .collection("checks")
          .doc(context.query.id as string)
          .get()
      ).data()!;
      if (
        checkData &&
        (checkData.owners?.[decodedToken.uid] ||
          checkData.editors?.[decodedToken.uid] ||
          checkData.viewers?.[decodedToken.uid])
      ) {
        return {
          props: {
            auth: decodedToken,
            check: { ...checkData, id: context.query.id },
          },
        };
      }
    }
  }
  throw new UnauthorizedError();
});

export default Page;
