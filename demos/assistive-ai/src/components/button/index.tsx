import cn from 'classnames';
import './index.scss';

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={cn("button", props.className)}
  />
);

export default Button;
