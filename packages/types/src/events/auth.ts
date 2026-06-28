export enum AuthEventType {
  LoginSuccess = 'auth.login.success',
  LoginFailed = 'auth.login.failed',
  RefreshSuccess = 'auth.refresh.success',
  RefreshFailed = 'auth.refresh.failed',
  Logout = 'auth.logout',
  SessionCreated = 'auth.session.created',
  SessionRevoked = 'auth.session.revoked',
  RBACDenied = 'auth.rbac.denied',
}
