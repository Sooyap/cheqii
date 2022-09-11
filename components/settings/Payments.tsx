import { Payments as PaymentsIcon, Wallet } from "@mui/icons-material";
import { List, Menu, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ListItem, ListItemMenu } from "components/List";
import { useLoading } from "components/LoadingContextProvider";
import { useSnackbar } from "components/SnackbarContextProvider";
import {
  ValidateForm,
  ValidateFormProps,
  ValidateSubmitButton,
  ValidateTextField,
} from "components/ValidateForm";
import { BaseProps, User } from "declarations";
import { MouseEventHandler, useState } from "react";
import { interpolateString } from "services/formatter";
import { parseObjectByKeys } from "services/parser";

type PaymentsProps = Pick<BaseProps, "className" | "strings"> & {
  walletTypes: string[];
  userData: User;
};

export const Payments = styled((props: PaymentsProps) => {
  const { loading, setLoading } = useLoading();
  const { setSnackbar } = useSnackbar();
  const [walletType, setWalletType] = useState(props.userData.payment?.type || "");
  const [paymentsMenu, setPaymentsMenu] = useState<HTMLElement | null>(null);

  const handleFormSubmit: ValidateFormProps["onSubmit"] = async (e) => {
    try {
      setLoading({
        active: true,
        id: "paymentsSubmit",
      });
      const newUserData = parseObjectByKeys(props.userData, ["displayName", "email", "photoURL"]);
      newUserData.payment = {
        id: (e.currentTarget.elements.namedItem("walletId") as HTMLInputElement).value,
        type: walletType,
      };
      await fetch("/api/user", {
        body: JSON.stringify(newUserData),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
    } catch (err) {
      setSnackbar({
        active: true,
        message: err,
        type: "error",
      });
    } finally {
      setLoading({
        active: false,
        id: "paymentsSubmit",
      });
    }
  };

  const handleWalletTypeMenuClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setPaymentsMenu(e.currentTarget);
  };

  const handleWalletTypeMenuClose: MouseEventHandler<HTMLButtonElement> = (e) => {
    setPaymentsMenu(null);
  };

  return (
    <ValidateForm className={`Payments-root ${props.className}`} onSubmit={handleFormSubmit}>
      <Typography className="Payments-heading" component="h2" variant="h2">
        <PaymentsIcon fontSize="inherit" />
        <span>{props.strings["payments"]}</span>
      </Typography>
      <List>
        <ListItemMenu
          ListItemButtonProps={{
            onClick: handleWalletTypeMenuClick,
          }}
          ListItemTextProps={{
            primary: props.strings[walletType],
            secondary:
              walletType === "none"
                ? props.strings["walletTypeHiddenHint"]
                : interpolateString(props.strings["walletTypeHint"], {
                    walletType: props.strings[walletType],
                  }),
          }}
        />
      </List>
      <ValidateTextField
        defaultValue={props.userData.payment?.id}
        disabled={walletType === "none"}
        inputProps={{
          maxLength: 64,
        }}
        InputProps={{
          startAdornment: <Wallet />,
        }}
        label={
          walletType !== "none"
            ? interpolateString(props.strings["walletTypeId"], {
                walletType: props.strings[walletType],
              })
            : undefined
        }
        name="walletId"
      />
      <Menu
        anchorEl={paymentsMenu}
        onClose={handleWalletTypeMenuClose}
        open={Boolean(paymentsMenu)}
      >
        {props.walletTypes.map((currentWalletType) => {
          const handleWalletTypeClick: MouseEventHandler<HTMLButtonElement> = () => {
            setWalletType(currentWalletType);
            setPaymentsMenu(null);
          };

          return (
            <ListItem
              key={currentWalletType}
              ListItemButtonProps={{
                onClick: handleWalletTypeClick,
                selected: walletType === currentWalletType,
              }}
              ListItemTextProps={{
                primary: props.strings[currentWalletType],
              }}
            />
          );
        })}
      </Menu>
      <ValidateSubmitButton loading={loading.queue.includes("paymentsSubmit")} variant="outlined">
        {props.strings["save"]}
      </ValidateSubmitButton>
    </ValidateForm>
  );
})`
  ${({ theme }) => `
    & .Checkbox-root {
      display: flex;
      flex-direction: column;

      & .Checkbox-hint {
        margin-left: ${theme.spacing(4)};
      }
    }

    & .MuiList-root {
      background: ${theme.palette.action.hover};
      border-radius: ${theme.shape.borderRadius}px;
      overflow: hidden;
      padding: 0;
    }

    & .Payments-heading {
      align-items: center;
      display: flex;

      & .MuiSvgIcon-root {
        margin-right: ${theme.spacing(2)};
      }
    }
  `}
`;

Payments.displayName = "Payments";
