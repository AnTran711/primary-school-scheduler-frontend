import { Bounce, ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useBackendReady } from './hooks/use-backend-ready';
import SplashScreen from './components/splash-screen';

function App() {
  const { isReady, retryCount, error } = useBackendReady();

  // Chờ Spring Boot sẵn sàng trước khi render app
  if (!isReady) {
    return <SplashScreen retryCount={retryCount} error={error} />;
  }

  return (
    <>
      <RouterProvider router={router} />

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  );
}

export default App;
