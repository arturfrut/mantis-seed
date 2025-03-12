'use client';

import { forwardRef, CSSProperties, ReactElement } from 'react';

// material-ui
import Card, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// types
import { KeyedObject } from 'types/root';

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProps extends KeyedObject {
  border?: boolean;
  boxShadow?: boolean;
  children?: ReactElement;
  subheader?: ReactElement | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps['sx'];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps['sx'];
  secondary?: CardHeaderProps['action'];
  shadow?: string;
  elevation?: number;
  title?: ReactElement | string;
  codeHighlight?: boolean;
  codeString?: string;
  modal?: boolean;
}

const MainCard = forwardRef<HTMLDivElement, MainCardProps>(function MainCard(
  {
    border = true,
    boxShadow,
    children,
    subheader,
    content = true,
    contentSX = {},
    darkTitle,
    divider = true,
    elevation,
    secondary,
    shadow,
    sx = {},
    title,
    modal = false,
    ...others
  },
  ref
) {
  return (
    <Card
      elevation={elevation || 0}
      sx={[
        (theme) => ({
          position: 'relative',
          border: border ? '1px solid' : 'none',
          borderRadius: 1,
          borderColor: 'grey.A800',
          boxShadow: boxShadow && !border ? shadow || theme.customShadows.z1 : 'inherit',
          ':hover': {
            boxShadow: boxShadow ? shadow || theme.customShadows.z1 : 'inherit'
          },
          ...theme.applyStyles('dark', {
            borderColor: 'divider',
            backgroundImage: 'none',
            boxShadow: shadow || theme.customShadows.z1,
            ':hover': { boxShadow: shadow || theme.customShadows.z1 }
          }),
          ...(modal && {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: `calc(100% - 50px)`, sm: 'auto' },
            maxWidth: 768,
            '& .MuiCardContent-root': { overflowY: 'auto', minHeight: 'auto', maxHeight: `calc(100vh - 200px)` }
          })
        }),
        sx
      ]}
      ref={ref}
      {...others}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader sx={headerSX} slotProps={{ title: { variant: 'subtitle1' } }} title={title} action={secondary} subheader={subheader} />
      )}
      {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h4">{title}</Typography>} action={secondary} />}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}
    </Card>
  );
});

export default MainCard;
