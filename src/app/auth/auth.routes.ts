import { Routes } from "@angular/router";
import { Login } from "./components/login/login";
import { ForgotPassword } from "./components/forgot-password/forgot-password";

export const authRoutes: Routes = [
  { path: '', component: Login },
  {path:"forgot-password", component: ForgotPassword}
]