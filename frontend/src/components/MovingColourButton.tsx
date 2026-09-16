import { CtaButton, type CtaButtonProps } from './CtaButton';

export function MovingColourButton(props: CtaButtonProps) {
  return <CtaButton {...props} appearance="moving" baseClassName="moving-colour-button" />;
}
