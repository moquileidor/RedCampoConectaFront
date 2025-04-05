import React, { useEffect } from "react";
import logo from "../../assets/logo.png";
import IniciarSesionModal from "../modalIniciarSesion/ModalIniciarSesion";
import RegistrarmeModal from "../modalRegistro/ModalRegistrarse";
import "./Navbar.css";

export default function Navbar() {
    // Función para limpiar modales
    const cleanupModals = () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.removeAttribute('style');
    };
    
    // Asegurar que bootstrap está cargado correctamente
    useEffect(() => {
        // Forzar la limpieza de cualquier modal backdrop al montar el componente
        cleanupModals();
        
        // Aplicar clase al body para manejar el espaciado correctamente
        document.body.classList.add('has-navbar');
        
        // Limpiar al desmontar
        return () => {
            document.body.classList.remove('has-navbar');
        };
    }, []);

    // Manejar clic en iniciar sesión
    const handleLoginClick = () => {
        // Limpiar modales primero
        cleanupModals();
        
        // Inicializar el modal manualmente si es necesario
        const modal = document.getElementById('iniciarSesion');
        if (modal && window.bootstrap && window.bootstrap.Modal) {
            const modalInstance = new window.bootstrap.Modal(modal);
            modalInstance.show();
        } else {
            // Fallback si Bootstrap no está disponible
            if (modal) {
                modal.style.display = 'block';
                modal.classList.add('show');
            }
        }
    };

    // Manejar clic en registrarse
    const handleRegisterClick = () => {
        // Limpiar modales primero
        cleanupModals();
        
        // Inicializar el modal manualmente si es necesario
        const modal = document.getElementById('registrarme');
        if (modal && window.bootstrap && window.bootstrap.Modal) {
            const modalInstance = new window.bootstrap.Modal(modal);
            modalInstance.show();
        } else {
            // Fallback si Bootstrap no está disponible
            if (modal) {
                modal.style.display = 'block';
                modal.classList.add('show');
            }
        }
    };

    return (
        <header className="navbar-header">
            <nav className="navbar bg-body-tertiary navbar-campo-conecta">
                <div className="container-fluid contenedor-info-nav">
                    <a className="navbar-brand navbar-cc-principal" href="/">
                        <img
                            src={logo}
                            alt="Logo"
                            width="80"
                            height="80"
                        />
                        <p className="nombre-campo-conecta">Campo Conecta</p>
                    </a>
                    <div className="contenedor-btns-nav">
                        <button
                            type="button"
                            className="btn-iniciar-sesion"
                            onClick={handleLoginClick}
                        >
                            <i className="bi bi-box-arrow-in-right"></i>
                            Iniciar sesión
                        </button>

                        <button
                            type="button"
                            className="btn-registrarme"
                            onClick={handleRegisterClick}
                        >
                           <i className="bi bi-person-plus"></i>
                           Regístrate
                        </button>
                    </div>
                </div>
            </nav>

            {/* Modales */}
            <IniciarSesionModal />
            <RegistrarmeModal />
        </header>
    );
}
