---
'@dfsync/client': minor
---

focusing on improving observability, refining retry behavior

- Improved request observability:
  - better visibility into request lifecycle
  - enhanced metadata available in hooks
- Retry behavior enhancements:
  - improved handling of retry conditions
  - better support for Retry-After scenarios
  - more predictable retry flow

Notes:

- existing APIs remain stable
- backward compatibility is preserved
- safe to upgrade from 0.6.x
