'use client';

import { Spinner as ChakraSpinner, SpinnerProps } from '@chakra-ui/react';
import colors from '@/brand/colors';

interface CustomSpinnerProps extends SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Spinner({
  size = 'md',
  color = colors.brand,
  ...props
}: CustomSpinnerProps) {
  return <ChakraSpinner color={color} size={size} {...props} />;
}

export function FullScreenSpinner({
  size = 'xl',
  color = colors.brand,
  ...props
}: CustomSpinnerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100dvw',
        height: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <Spinner size={size} color={color} {...props} />
    </div>
  );
}

export function CenteredSpinner({
  size = 'lg',
  color = colors.brand,
  minHeight = '200px',
  ...props
}: Omit<CustomSpinnerProps, 'minHeight'> & { minHeight?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight,
        width: '100%',
      }}
    >
      <Spinner size={size} color={color} {...props} />
    </div>
  );
}
