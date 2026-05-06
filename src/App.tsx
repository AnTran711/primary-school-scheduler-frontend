import { ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  return (
    <>
      <RouterProvider router={router} />

      <ToastContainer />
    </>
  );
}

export default App;
