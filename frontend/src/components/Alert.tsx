import * as React from 'react';
import Alert from 'react-bootstrap/Alert';

interface AlertProps {
    variant: string;
    message: string;
}

export const AlertComponent: React.FC<AlertProps> = ({ variant, message }) => {
  return (
    <Alert dismissible variant={variant}>
      <Alert.Heading>{message}</Alert.Heading>
    </Alert>
  );
}