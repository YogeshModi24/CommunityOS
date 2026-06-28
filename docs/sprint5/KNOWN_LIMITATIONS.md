# CommunityOS Known Limitations

## Overview

This document outlines the known technical and functional limitations of the CommunityOS platform as of the Sprint 5 Release Candidate. These items are documented to inform future development iterations.

## 1. Backend \u0026 API Constraints

- **Scope Restriction**: Per project constraints, the backend (Express API, MongoDB schema, Business Logic) was strictly off-limits.
- **Impact**: Some frontend features (e.g., real-time typing indicators, advanced filtering, optimistic UI updates) are constrained by existing API structures and payload shapes.

## 2. Notification Center

- The `NotificationCenter` UI has been built and integrated into the global state, but real-time socket connections and persistence depend on backend capabilities which were not modified.

## 3. Map Interactions

- The `MapComponent` utilizes a static token and basic marker implementations. Clustering large datasets (>10,000 incidents) may experience client-side performance degradation until server-side clustering or vector tiles are supported by the backend.

## 4. Accessibility

- While core `aria-labels` and focus states have been implemented, a full WCAG 2.1 AA certification requires specialized testing tools and user studies. Complex elements like the Mapbox canvas remain challenging for screen readers without a dedicated text fallback mode.

## 5. Mobile Gestures

- Swipe-to-dismiss and other native-like gestures on mobile (e.g., closing the bottom sheet in the map view) are simulated via CSS and basic React state. Future iterations should leverage `framer-motion`'s drag APIs for true native feel.
