import { Category, Person } from "@mui/icons-material";
import { AvatarGroup, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "components/AuthContextProvider";
import { CheckPreviewInsertSlot } from "components/home/CheckPreviewInsertSlot";
import { CheckPreviewSkeleton } from "components/home/CheckPreviewSkeleton";
import { CheckPreviewSlot } from "components/home/CheckPreviewSlot";
import { DateIndicator } from "components/home/DateIndicator";
import { HomeHeader } from "components/home/HomeHeader";
import { Page, Paginator, PaginatorProps } from "components/home/Page";
import { LinkButton } from "components/Link";
import { useLoading } from "components/LoadingContextProvider";
import { useSnackbar } from "components/SnackbarContextProvider";
import { UserAvatar } from "components/UserAvatar";
import { BaseProps, Check } from "declarations";
import { add, dinero } from "dinero.js";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { CHECKS_PER_PAGE } from "pages";
import { ReactNode, useState } from "react";
import { db } from "services/firebase";
import { formatCurrency } from "services/formatter";
import { getCurrencyType } from "services/locale";
import { parseDineroAmount } from "services/parser";

export type CheckPreviewType = {
  data: Pick<
    Check,
    "contributors" | "editor" | "items" | "owner" | "title" | "updatedAt" | "viewer"
  >;
  id: string;
};

export type HomePageProps = Pick<BaseProps, "className" | "strings"> & {
  allCheckIds: string[];
  checks: CheckPreviewType[];
};

export const HomePage = styled((props: HomePageProps) => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const { loading, setLoading } = useLoading();
  const { setSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [checks, setChecks] = useState(props.checks);
  const locale = router.locale ?? String(router.defaultLocale);
  const currency = getCurrencyType(locale);
  const totalCheckCount = props.allCheckIds.length;
  const totalPageCount = totalCheckCount === 0 ? 1 : Math.ceil(totalCheckCount / CHECKS_PER_PAGE);
  const disablePagination = userInfo?.isAnonymous || loading.active || totalPageCount <= 1;
  const renderPages: ReactNode[] = [];

  const handlePageChange: PaginatorProps["onChange"] = async (_e, nextPageNumber) => {
    try {
      setLoading({ active: true });
      setPage(nextPageNumber);
      const lowerBound = (nextPageNumber - 1) * CHECKS_PER_PAGE;
      const upperBound = nextPageNumber * CHECKS_PER_PAGE;
      const newCheckIds = props.allCheckIds.filter(
        (checkId, index) =>
          index >= lowerBound && index < upperBound && !checks.some((check) => check.id === checkId)
      );
      if (newCheckIds.length > 0) {
        const newCheckData = await getDocs(
          query(collection(db, "checks"), where(documentId(), "in", newCheckIds))
        );
        const newChecks = [...checks];
        newCheckData.forEach((check) => {
          const checkData = check.data();
          const checkIndex = props.allCheckIds.indexOf(check.id);
          newChecks[checkIndex] = {
            data: {
              contributors: checkData.contributors,
              editor: checkData.editor ?? {},
              items: checkData.items,
              owner: checkData.owner,
              title: checkData.title,
              updatedAt: checkData.updatedAt,
              viewer: checkData.viewer ?? {},
            },
            id: check.id,
          };
        });
        setChecks(newChecks);
      }
    } catch (err) {
      setSnackbar({
        active: true,
        message: err,
        type: "error",
      });
    } finally {
      setLoading({ active: false });
    }
  };

  for (let i = 0; i < totalPageCount; i++) {
    const iteratedChecks = i * CHECKS_PER_PAGE;
    const pageContent = [<CheckPreviewInsertSlot key={iteratedChecks} strings={props.strings} />];
    const pageChecks = checks.slice(iteratedChecks, (i + 1) * CHECKS_PER_PAGE);
    const dateFormatter = Intl.DateTimeFormat(locale, {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      hour12: false,
      year: "numeric",
    });
    for (let j = 0; j < CHECKS_PER_PAGE; j++) {
      const check = pageChecks[j];
      if (typeof check !== "undefined") {
        const UserAvatars: ReactNode[] = [];
        Object.entries(check.data.owner).reduce((acc, user) => {
          const userData = user[1];
          acc.push(
            <UserAvatar
              displayName={userData.photoURL}
              email={userData.email}
              key={`owner-${user[0]}`}
              photoURL={userData.photoURL}
              strings={props.strings}
            />
          );
          return acc;
        }, UserAvatars);
        if (typeof check.data.editor !== "undefined") {
          Object.entries(check.data.editor).reduce((acc, user) => {
            const userData = user[1];
            acc.push(
              <UserAvatar
                displayName={userData.photoURL}
                email={userData.email}
                key={`editor-${user[0]}`}
                photoURL={userData.photoURL}
                strings={props.strings}
              />
            );
            return acc;
          }, UserAvatars);
        }
        if (typeof check.data.viewer !== "undefined") {
          Object.entries(check.data.viewer).reduce((acc, user) => {
            const userData = user[1];
            acc.push(
              <UserAvatar
                displayName={userData.photoURL}
                email={userData.email}
                key={`viewer-${user[0]}`}
                photoURL={userData.photoURL}
                strings={props.strings}
              />
            );
            return acc;
          }, UserAvatars);
        }
        const totalCost = check.data.items.reduce(
          (totalCost, item) => add(totalCost, dinero({ amount: item.cost, currency })),
          dinero({ amount: 0, currency })
        );
        pageContent.push(
          <Card
            className={`CheckPreview-item ${loading.active ? "disabled" : ""}`}
            component="article"
            key={check.id}
          >
            <LinkButton
              className="CheckPreview-button"
              NextLinkProps={{ href: `/check/${check.id}` }}
            >
              <CardHeader
                disableTypography
                subheader={
                  <DateIndicator
                    className="CheckPreview-subtitle"
                    dateTime={check.data.updatedAt}
                    formatter={dateFormatter}
                  />
                }
                title={
                  <Typography className="CheckPreview-title" component="h2" variant="h5">
                    {check.data.title}
                  </Typography>
                }
              />
              <CardContent>
                <AvatarGroup max={5}>{UserAvatars}</AvatarGroup>
                <div className="CheckDigest-root">
                  <div className="CheckDigest-item">
                    <Person />
                    <Typography>{check.data.contributors.length}</Typography>
                  </div>
                  <Typography>•</Typography>
                  <div className="CheckDigest-item">
                    <Category />
                    <Typography>{check.data.items.length}</Typography>
                  </div>
                  <Typography>•</Typography>
                  <div className="CheckDigest-item">
                    <Typography>{formatCurrency(locale, parseDineroAmount(totalCost))}</Typography>
                  </div>
                </div>
              </CardContent>
            </LinkButton>
          </Card>
        );
      } else if (iteratedChecks + j < totalCheckCount) {
        pageContent.push(<CheckPreviewSkeleton key={iteratedChecks + j + 1} />);
      } else {
        pageContent.push(<CheckPreviewSlot key={iteratedChecks + j + 1} />);
      }
    }
    renderPages.push(<Page key={i}>{pageContent}</Page>);
  }

  return (
    <div className={props.className}>
      <HomeHeader strings={props.strings} />
      <main className="Body-root">
        <Paginator
          className="CheckPreview-root"
          disablePagination={disablePagination}
          onChange={handlePageChange}
          openedPage={page}
        >
          {renderPages}
        </Paginator>
      </main>
    </div>
  );
})`
  ${({ theme }) => `
  display: flex;
  flex-direction: column;
  font-family: "Fira Code";
  height: 100vh;
  width: 100%;

  & .Body-root {
    background: ${theme.palette.background.secondary};
    border-top: 2px solid ${theme.palette.secondary[theme.palette.mode]};
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: auto;
  }

  & .CheckPreview-button {
    flex-direction: column;
    height: 100%;
    padding: 0;
    width: 100%;

    & .MuiCardHeader-root {
      border-bottom: 2px solid ${theme.palette.divider};
      width: 100%;
    }

    & .MuiCardHeader-content {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(1)};
      overflow: hidden; // Needed for text-overflow styling in title
    }

    & .CheckPreview-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & .CheckPreview-subtitle {
      align-items: center;
      color: ${theme.palette.text.disabled};
      display: flex;

      & .MuiSvgIcon-root {
        margin-right: ${theme.spacing(1)};
      }
    }

    & .MuiCardContent-root {
      color: ${theme.palette.text.primary};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(2)};
      padding: ${theme.spacing(2)}; // Overrides last-child padding when disabled
      width: 100%;
    }
  }

  & .CheckPreview-item {
    &.disabled {
      background: ${theme.palette.action.disabledBackground};
      pointer-events: none;

      & .MuiAvatarGroup-root .MuiAvatar-root {
        border-color: ${theme.palette.action.disabled};
      }

      & .CheckDigest-root {
        border-color: ${theme.palette.action.disabled};
      }
    }

    & .CheckDigest-root {
      align-items: center;
      background: ${theme.palette.action.hover};
      border: 2px solid ${theme.palette.primary[theme.palette.mode]};
      border-radius: ${theme.shape.borderRadius}px;
      display: flex;
      gap: ${theme.spacing(2)};
      margin-right: auto;
      padding: ${theme.spacing(0.5, 1)};

      & .CheckDigest-item {
        align-items: center;
        display: flex;

        & .MuiSvgIcon-root {
          margin-right: ${theme.spacing(1)};
        }
      }
    }

    & .MuiAvatarGroup-root {
      justify-content: flex-end;

      & .MuiAvatar-root {
        border-color: ${theme.palette.primary.main};
      }
    }
  }

  & .Paginator-pagination {
    grid-column: 1 / -1; // Only works for statically-defined grids
    margin: ${theme.spacing(3, 0, 1, 0)}
  }

  & .Page-root {
    display: grid;
    gap: ${theme.spacing(2)};

    ${theme.breakpoints.up("xs")} {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto auto;
      width: 100%;
    }
    ${theme.breakpoints.up("sm")} {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
    }
    ${theme.breakpoints.up("md")} {
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto;
    }
  }
`}
`;

HomePage.displayName = "HomePage";
