import React, { Suspense } from 'react';
import Loading from '../components/Loading';

const suspense = (Comp) => (props) => (
  <Suspense fallback={<Loading fullWidth />}>
    <Comp {...props} />
  </Suspense>
);

export default suspense;
