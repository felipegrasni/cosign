# Contract parity matrix

| Behavior | Solidity | Clarity |
| --- | --- | --- |
| Category range 0–4 | `InvalidKind` | `u400` |
| Context 1–48 ASCII bytes | `InvalidContext` | `u401` |
| Note 1–160 ASCII bytes | `InvalidNote` | `u402` |
| Expiry 1 hour–30 days | `InvalidExpiry` | `u403` |
| Creator cannot target self | `SelfTarget` | `u404` |
| Missing card/index | `NotFound` | `u405` |
| Creator-only cancellation | `NotCreator` | `u406` |
| Creator cannot co-sign | `SelfSign` | `u407` |
| Addressed signer enforced | `WrongSigner` | `u408` |
| Completed card immutable | `AlreadyCompleted` | `u409` |
| Cancelled card immutable | `AlreadyCancelled` | `u410` |
| Expired card cannot change | `Expired` | `u411` |

Both contracts index created cards by creator and completed cards by co-signer. Neither contract has an owner, payable method, token path, withdrawal, proxy, or upgrade mechanism.
