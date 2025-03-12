import NextLink from 'next/link';

// material-ui
import { SxProps } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

// project imports
import LogoMain from './LogoMain';
import LogoIcon from './LogoIcon';

import { APP_DEFAULT_PATH } from 'config';

// ==============================|| MAIN LOGO ||============================== //

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: string;
}

export default function LogoSection({ reverse, isIcon, sx, to }: Props) {
  return (
    <ButtonBase disableRipple component={NextLink} href={to || APP_DEFAULT_PATH} sx={sx}>
      {isIcon ? <LogoIcon /> : <LogoMain reverse={reverse} />}
    </ButtonBase>
  );
}
