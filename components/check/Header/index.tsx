import { Settings as SettingsIcon, Share } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Account, AccountProps } from "components/Account";
import { ShareClickHandler } from "components/check";
import { Settings, SettingsProps } from "components/check/Header/Settings";
import { TitleTextField } from "components/check/Header/TitleTextField";
import { LinkIconButton } from "components/Link";
import { useLoading } from "components/LoadingContextProvider";
import { Logo } from "components/Logo";
import { BaseProps, CheckSettings } from "declarations";
import Head from "next/head";
import { Dispatch, memo, MouseEventHandler, SetStateAction, useState } from "react";

export type HeaderProps = Pick<BaseProps, "className" | "strings"> & {
  accessLink: string;
  checkSettings: CheckSettings;
  checkId: string;
  onShareClick: ShareClickHandler;
  setCheckSettings: Dispatch<SetStateAction<CheckSettings>>;
  unsubscribe: () => void;
  userAccess: SettingsProps["userAccess"];
  writeAccess: boolean;
};

const HeaderUnstyled = memo((props: HeaderProps) => {
  const [checkSettingsOpen, setCheckSettingsOpen] = useState(false);
  const { loading } = useLoading();

  const handleSettingsDialogClose: SettingsProps["onClose"] = (_e, _reason) => {
    setCheckSettingsOpen(false);
  };

  const handleSettingsDialogOpen: MouseEventHandler<HTMLButtonElement> = (_e) => {
    setCheckSettingsOpen(true);
  };

  const handleSignOut: AccountProps["onSignOut"] = async () => {
    props.unsubscribe();
  };

  return (
    <header className={`Header-root ${props.className}`}>
      <Head>
        <title>{props.checkSettings.title}</title>
      </Head>
      <LinkIconButton className="Header-home" color="primary" NextLinkProps={{ href: "/" }}>
        <Logo />
      </LinkIconButton>
      <TitleTextField
        checkId={props.checkId}
        className="Header-title"
        disabled={loading.active || !props.writeAccess}
        label={props.strings["name"]}
        setCheckSettings={props.setCheckSettings}
        size="small"
        value={props.checkSettings.title}
        variant="outlined"
        writeAccess={props.writeAccess}
      />
      <div className="Header-actions">
        <IconButton
          aria-label={props.strings["share"]}
          className="Header-share"
          disabled={loading.active}
          onClick={props.onShareClick}
        >
          <Share />
        </IconButton>
        <IconButton
          aria-label={props.strings["settings"]}
          disabled={loading.active}
          onClick={handleSettingsDialogOpen}
        >
          <SettingsIcon />
        </IconButton>
        <Account onSignOut={handleSignOut} strings={props.strings} />
      </div>
      <Settings
        accessLink={props.accessLink}
        checkId={props.checkId}
        checkSettings={props.checkSettings}
        onClose={handleSettingsDialogClose}
        onShareClick={props.onShareClick}
        open={checkSettingsOpen}
        setCheckSettings={props.setCheckSettings}
        strings={props.strings}
        unsubscribe={props.unsubscribe}
        userAccess={props.userAccess}
        writeAccess={props.writeAccess}
      />
    </header>
  );
});

export const Header = styled(HeaderUnstyled)`
  ${({ theme }) => `
    display: flex;
    gap: ${theme.spacing(2)};
    margin: ${theme.spacing(2)};

    & .Header-actions {
      display: flex;
      gap: ${theme.spacing(2)};
      margin-left: auto;

      ${theme.breakpoints.down("sm")} {
        & .Header-share {
          display: none;
        }
      }
    }

    & .Header-home {
      padding: 0;
    }
  `}
`;

Header.displayName = "Header";
HeaderUnstyled.displayName = "HeaderUnstyled";
