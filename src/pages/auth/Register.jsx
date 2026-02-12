import { Helmet } from 'react-helmet-async';
import { RegisterForm } from '../../components/auth';
import { APP_NAME } from '../../config/constants';

export default function Register() {
  return (
    <>
      <Helmet>
        <title>Register | {APP_NAME}</title>
        <meta name="description" content="Join AlumniCircle - Adarsha School Batch 2003 Alumni Network" />
      </Helmet>
      <RegisterForm />
    </>
  );
}
