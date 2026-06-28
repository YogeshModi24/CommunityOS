"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEventType = void 0;
var AuthEventType;
(function (AuthEventType) {
    AuthEventType["LoginSuccess"] = "auth.login.success";
    AuthEventType["LoginFailed"] = "auth.login.failed";
    AuthEventType["RefreshSuccess"] = "auth.refresh.success";
    AuthEventType["RefreshFailed"] = "auth.refresh.failed";
    AuthEventType["Logout"] = "auth.logout";
    AuthEventType["SessionCreated"] = "auth.session.created";
    AuthEventType["SessionRevoked"] = "auth.session.revoked";
    AuthEventType["RBACDenied"] = "auth.rbac.denied";
})(AuthEventType || (exports.AuthEventType = AuthEventType = {}));
