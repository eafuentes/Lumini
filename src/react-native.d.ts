import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface TouchableOpacityProps {
    className?: string;
  }

  interface SwitchProps {
    className?: string;
  }

  interface ModalProps {
    className?: string;
  }
}
