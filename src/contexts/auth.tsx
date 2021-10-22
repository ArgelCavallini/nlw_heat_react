import { createContext, useState } from "react";
import { useEffect } from 'react';
import { api } from '../services/api';
type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}
type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void; //não tem retorno
}

export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
  children: ReactNode; // qualquer coisa aceitável pelo react
}

type AuthResponse = { // retorno request api
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=5d32b0ea44577419d034`;

  async function signIn(code: string) { // async para poder usar o await
    const response = await api.post<AuthResponse>('authenticate', {
      code
    })

    const { token, user } = response.data;

    localStorage.setItem('@dowhile:token', token); // salva no local storage do navegador

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem('@dowhile:token')
  }

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token');// pega o token do local storage do navegador

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>('profile').then(response => {
        setUser(response.data);
      })
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;//pegar url atual
    const hasGithubCode = url.includes('?code=');//verificar se minha url tem ?code=

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code='); // o que vem antes url sem código, depois url com código

      //limpar url, no caso retirando o código
      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubCode);
    }
  }, [])

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}