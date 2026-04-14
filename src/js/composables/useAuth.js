// DESARROLLADO POR: JOSE LUIS CUENCA GUTIERREZ
// ÁREA: Ingeniería de Sistemas / Operaciones
// ARCHIVO: Composable de Autenticación

import { ref } from "vue";
// IMPORTACIÓN NUEVA Y PROFESIONAL DESDE NPM
import { createClient } from "@supabase/supabase-js";

export function useAuth() {
  const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
  const SUPABASE_KEY = "TU_SUPABASE_PUBLISHABLE_KEY";

  // AHORA USA LA FUNCIÓN IMPORTADA DIRECTAMENTE
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const isLoggedIn = ref(false);
  const currentUserId = ref("");
  const userName = ref("");
  const userAvatar = ref("");
  const userEmail = ref("");

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
    userEmail.value = "";
  };

  const actualizarDatosUsuario = (session) => {
    if (session && session.user) {
      isLoggedIn.value = true;
      currentUserId.value = session.user.id;
      userName.value =
        session.user.user_metadata?.full_name ||
        session.user.email.split("@")[0];
      userAvatar.value = session.user.user_metadata?.avatar_url || "";
      userEmail.value = session.user.email;
    }
  };

  return {
    supabase,
    isLoggedIn,
    currentUserId,
    userName,
    userAvatar,
    userEmail,
    iniciarSesionGoogle,
    cerrarSesionAuth,
    actualizarDatosUsuario,
  };
}
