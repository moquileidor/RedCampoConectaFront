import React from 'react';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Banner from '../components/banner/Banner';
import Footer from '../components/footer/Footer';

// La autenticación ya la garantiza <ProtectedRoute> en App.js
export default function UsuarioLogeadoPage() {
  return (
    <>
      <NavBarUsuario />
      <Banner />
      <Footer />
    </>
  );
}
