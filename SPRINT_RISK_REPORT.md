# Sprint Risk Report: Risk Registry & Mitigation Runbooks

- **Version**: 1.0.0
- **Status**: Completed
- **Owner**: Lead Staff Engineer & CTO

This report maps potential technical, migration, and infrastructure risks during the restructuring.

---

## 1. Active Risk Matrix

| Risk ID     | Risk Vector                                         | Category             | Business Impact | Technical Impact | Mitigation & Runbook Strategy                                                                                  |
| :---------- | :-------------------------------------------------- | :------------------- | :-------------- | :--------------- | :------------------------------------------------------------------------------------------------------------- |
| **RSK-001** | Relative path alias breaking during relocations     | Migration            | Low             | High             | Standardize `tsconfig` aliases (`@/components/*`) across workspaces. Verify all imports post relocation.       |
| **RSK-002** | Socket.io event loop blockade during Winston logs   | Performance          | Low             | Medium           | Winston configuration uses asynchronous file/stdout streams, protecting main event loop threads.               |
| **RSK-003** | Missing env configurations breaking CI builds       | Development          | Medium          | High             | Expose mocked environment profiles in `.env.example` configurations to let CI compile successfully.            |
| **RSK-004** | Hot reloading failures inside local running servers | Developer Experience | Low             | Medium           | Rebuild local workspace packages on change using turborepo dependencies trackers (`turbo run dev --parallel`). |
| **RSK-005** | Cloudinary file upload path resolutions failures    | Data Security        | Medium          | High             | Direct image upload logic resides inside `apps/web` client components, leaving backend logic unchanged.        |

---

## 2. Emergency Backup Recovery Process

If a fatal compilation state occurs that blocks work:

1. Revert to the master branch head: `git checkout -- .` and clean untracked directories: `git clean -fd`.
2. Re-import files from the `.legacy-backup` directory.
3. Clean local package caches: `npm cache clean --force` and clean node modules: `rm -rf node_modules package-lock.json`.
4. Re-run `npm install` to recover stability.
