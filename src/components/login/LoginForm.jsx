const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    await authService.login(username, password);
    
    // Limpiar cualquier modal-backdrop que pueda quedar
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Recargar la página para asegurar una carga limpia después del login
    window.location.reload();
  } catch (error) {
    setError('Usuario o contraseña incorrectos');
    console.error('Error de login:', error);
  } finally {
    setLoading(false);
  }
}; 