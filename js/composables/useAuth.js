// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Autenticación

const { ref } = window.Vue;

export function useAuth() {
  const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
  const SUPABASE_KEY = "TU_SUPABASE_PUBLISHABLE_KEY";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const isLoggedIn = ref(false);
  const currentUserId = ref("");
  const userName = ref("");
  const userAvatar = ref("");

  const iniciarSesionGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const cerrarSesionAuth = async () => {
    await supabase.auth.signOut();
    isLoggedIn.value = false;
    currentUserId.value = "";
    userName.value = "";
    userAvatar.value = "";
  };

  const actualizarDatosUsuario = (session) => {
    if (session && session.user) {
      isLoggedIn.value = true;
      currentUserId.value = session.user.id;
      userName.value =
        session.user.user_metadata?.full_name ||
        session.user.email.split("@")[0];
      userAvatar.value = session.user.user_metadata?.avatar_url || "";
    }
  };

  return {
    supabase,
    isLoggedIn,
    currentUserId,
    userName,
    userAvatar,
    iniciarSesionGoogle,
    cerrarSesionAuth,
    actualizarDatosUsuario,
  };
}
