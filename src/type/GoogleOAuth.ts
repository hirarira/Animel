export interface GoogleOAuth {
  Aa: string;
  qc: Qc;
  ft: Ft;
  googleId: string;
  tokenObj: TokenObj;
  tokenId: string;
  accessToken: string;
  profileObj: ProfileObj;
}

export interface ExtraQueryParams {
  authuser: string;
}

export interface SessionState {
  extraQueryParams: ExtraQueryParams;
}

export interface Qc {
  token_type: string;
  access_token: string;
  scope: string;
  login_hint: string;
  expires_in: number;
  id_token: string;
  session_state: SessionState;
  first_issued_at: number;
  expires_at: number;
  idpId: string;
}

export interface Ft {
  FS: string;
  Te: string;
  qU: string;
  yJ: string;
  Qt: string;
}

export interface TokenObj {
  token_type: string;
  access_token: string;
  scope: string;
  login_hint: string;
  expires_in: number;
  id_token: string;
  session_state: SessionState;
  first_issued_at: number;
  expires_at: number;
  idpId: string;
}

export interface ProfileObj {
  googleId: string;
  imageUrl: string;
  email: string;
  name: string;
  givenName: string;
}

