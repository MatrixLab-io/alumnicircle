import { Helmet } from 'react-helmet-async';
import { LoginForm } from '../../components/auth';
import { APP_NAME } from '../../config/constants';

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Sign In | {APP_NAME}</title>
        <meta name="description" content="Sign in to your AlumniCircle account" />
      </Helmet>
      <LoginForm />
    </>
  );
}
