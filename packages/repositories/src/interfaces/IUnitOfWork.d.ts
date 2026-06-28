export interface IUnitOfWork {
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
//# sourceMappingURL=IUnitOfWork.d.ts.map