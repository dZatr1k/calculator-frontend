import {Configuration, DefaultApi} from "@/restAPI";

export interface AuthorizationData {
  login: string,
  password: string
}

// TODO use .env files

export const createApi = (auth?: AuthorizationData) => {
  return new DefaultApi(new Configuration({
    basePath: 'http://185.252.146.69:8080',
    username: auth?.login,
    password: auth?.password,
  }));
}

export interface ErrorResponse {
  name: string,
  message: string
}
