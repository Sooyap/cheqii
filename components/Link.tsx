import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import { IconButton, IconButtonProps } from "@mui/material";
import { LoadingAction, useLoading } from "components/LoadingContextProvider";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import router from "next/router";
import { MouseEventHandler } from "react";

// interface LinkProps extends MuiLinkProps {
//   NextLinkProps: NextLinkProps;
// }

interface LinkButtonProps extends LoadingButtonProps {
  NextLinkProps: NextLinkProps;
}

interface LinkIconButtonProps extends IconButtonProps {
  NextLinkProps: NextLinkProps;
}

type Redirect = (setLoading: (state: LoadingAction) => void, path?: string) => void;

// export const Link = ({ children, NextLinkProps, ...props }: LinkProps) => (
//   <NextLink passHref {...NextLinkProps}>
//     <MuiLink {...props}>{children}</MuiLink>
//   </NextLink>
// );

export const LinkButton = ({
  children,
  disabled,
  NextLinkProps,
  onClick,
  ...props
}: LinkButtonProps) => {
  const { loading, setLoading } = useLoading();

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    setLoading({ active: true });
    if (typeof onClick === "function") {
      await onClick(e);
    }
    redirect(setLoading);
  };

  return (
    <NextLink passHref {...NextLinkProps}>
      <LoadingButton disabled={loading.active || disabled} onClick={handleClick} {...props}>
        {children}
      </LoadingButton>
    </NextLink>
  );
};

export const LinkIconButton = ({
  children,
  disabled,
  NextLinkProps,
  onClick,
  ...props
}: LinkIconButtonProps) => {
  const { loading, setLoading } = useLoading();

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    setLoading({ active: true });
    if (typeof onClick === "function") {
      await onClick(e);
    }
    redirect(setLoading);
  };

  return (
    <NextLink {...NextLinkProps}>
      <IconButton disabled={loading.active || disabled} onClick={handleClick} {...props}>
        {children}
      </IconButton>
    </NextLink>
  );
};

export const redirect: Redirect = (setLoading, path) => {
  const handleRouteChange = () => {
    setLoading({ active: false });
    router.events.off("routeChangeComplete", handleRouteChange);
  };
  router.events.on("routeChangeComplete", handleRouteChange);
  if (path) {
    router.push(path);
  }
};

LinkButton.displayName = "LinkButton";
LinkIconButton.displayName = "LinkIconButton";
