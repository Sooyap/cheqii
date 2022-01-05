import { styled } from "@mui/material/styles";
import { ValidateTextField } from "components/ValidateForm";
import { Styles } from "declarations";

export const TextField = styled(ValidateTextField)`
  ${({ theme }: Styles) => `
    & .MuiInputBase-root.MuiInputBase-adornedStart {
      & .MuiInputBase-input {
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        padding-left: ${theme.spacing(1)};
        margin: 0;
      }

      & .MuiSvgIcon-root {
        margin: 0 ${theme.spacing(1)};
      }
    }
  `}
`;
