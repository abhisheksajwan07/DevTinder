

const API_URL = import.meta.env.VITE_API_URL || "/v1";

export type OAuthProvider = "google" | "github"

export const googleOAuth = ()=>{
    window.location.href=`${API_URL}/oauth/google`
}

export const githubOAuth = ()=>{
    window.location.href = `${API_URL}/oauth/github`
}
export const connectGithub = () => {
  window.location.href = `${API_URL}/oauth/github/connect`;
};